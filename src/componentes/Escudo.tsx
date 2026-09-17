import { useMemo, useState } from 'react'
import { CLUBE_POR_ID } from '../dados/clubes'

const BASE = import.meta.env.BASE_URL

/** Iniciais do clube para o brasão de reserva: "Shanghai Port" -> "SP". */
function iniciais(nome: string): string {
  const palavras = nome
    .split(/[\s-]+/)
    .filter((p) => p.length > 2 || /^[A-Z]/.test(p))
    .filter((p) => !/^(de|do|da|del|al)$/i.test(p))
  if (palavras.length >= 2) return (palavras[0][0] + palavras[1][0]).toUpperCase()
  return nome.replace(/[^A-Za-zÀ-ÿ]/g, '').slice(0, 3).toUpperCase()
}

/** Texto escuro sobre fundo claro e vice-versa. */
function contrasta(hex: string): string {
  const n = parseInt(hex.slice(1), 16)
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((c) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.42 ? '#12201A' : '#F2F0E9'
}

/** Brasão desenhado para os clubes sem escudo em nenhuma das fontes públicas. */
function BrasaoReserva({ id }: { id: string }) {
  const clube = CLUBE_POR_ID.get(id)
  const [primaria, secundaria] = clube?.cores ?? ['#274034', '#F2F0E9']
  const sigla = useMemo(() => iniciais(clube?.nome ?? id), [clube, id])
  return (
    <svg viewBox="0 0 100 116" className="h-[82%] w-[82%]" aria-hidden="true">
      <path d="M50 3 96 18v44c0 29-21 44-46 51C25 106 4 91 4 62V18z" fill={primaria} />
      <path d="M50 3 96 18v44c0 29-21 44-46 51C25 106 4 91 4 62V18z" fill="none" stroke={secundaria} strokeWidth="5" />
      <text
        x="50"
        y="66"
        textAnchor="middle"
        fill={contrasta(primaria)}
        fontSize={sigla.length > 2 ? 30 : 38}
        fontFamily="'Archivo Variable', sans-serif"
        fontWeight="800"
        letterSpacing="-1"
      >
        {sigla}
      </text>
    </svg>
  )
}

export function Escudo({
  id,
  className = '',
  adiar = false,
}: {
  id: string
  className?: string
  /** escudos decorativos só carregam quando entram em cena */
  adiar?: boolean
}) {
  const arquivo = CLUBE_POR_ID.get(id)?.escudo

  /**
   * Uma partida pede todos os escudos de uma vez, e basta uma requisição
   * falhar para o navegador cravar o ícone de imagem quebrada ali — não há
   * nova tentativa, e o escudo é a informação principal do jogo.
   *
   * `tentativa` força uma URL diferente para o navegador não devolver a falha
   * do cache, e o intervalo cresce a cada uma — falha transitória some sozinha
   * em pouco tempo, e o que se quer é o escudo real de volta, não a queda.
   * Esgotadas as tentativas, desenha o brasão, que é a mesma queda já usada
   * para clube sem escudo: pior que o escudo real, muito melhor que um
   * quadrado vazio.
   *
   * Na prática quem falha são os arquivos maiores do lote, o que bate com
   * transferência interrompida e não com arquivo ruim: os mesmos escudos
   * decodificam sem erro quando pedidos de novo.
   */
  const [tentativa, setTentativa] = useState(0)
  const desistiu = tentativa > 2

  return (
    <span
      className={`grid place-items-center rounded-xl bg-[#EDEBE4] shadow-[inset_0_0_0_1px_rgba(12,23,17,0.12)] ${className}`}
    >
      {arquivo && !desistiu ? (
        <img
          key={tentativa}
          src={tentativa ? `${BASE}escudos/${arquivo}?r=${tentativa}` : `${BASE}escudos/${arquivo}`}
          alt=""
          loading={adiar ? 'lazy' : 'eager'}
          className="h-[76%] w-[76%] object-contain"
          draggable={false}
          onError={() => {
            const n = tentativa + 1
            if (n > 2) setTentativa(n)
            else setTimeout(() => setTentativa(n), n * 400)
          }}
        />
      ) : (
        <BrasaoReserva id={id} />
      )}
    </span>
  )
}
