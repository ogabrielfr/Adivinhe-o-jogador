import { NIVEIS, ROTULO_NIVEL, DESCRICAO_NIVEL } from '../dados/tipos'
import type { Nivel } from '../dados/tipos'
import type { Estatistica, Partida } from '../logica/armazenamento'
import { TENTATIVAS } from '../logica/armazenamento'
import { ParedeDeEscudos } from './ParedeDeEscudos'
import { MarcadorNivel } from './MarcadorNivel'
import { ContagemRegressiva } from './ContagemRegressiva'

interface Props {
  dia: number
  data: Date
  partidas: Partial<Record<Nivel, Partida>>
  estatisticas: Record<Nivel, Estatistica>
  aoEscolher: (nivel: Nivel) => void
}

function Resultado({ partida }: { partida: Partida }) {
  if (partida.status === 'jogando') {
    return <span className="t-rotulo text-xs text-cal-500">Em andamento</span>
  }
  if (partida.status === 'perdeu') {
    return <span className="t-rotulo text-xs text-erro">Não saiu hoje</span>
  }
  const n = partida.palpites.length
  return (
    <span className="t-rotulo text-xs text-acerto">
      {n === 1 ? 'De primeira' : `Em ${n} chutes`}
      {partida.dicasUsadas > 0 && (
        <span className="text-dica"> · com {partida.dicasUsadas === 1 ? 'uma dica' : 'as duas dicas'}</span>
      )}
    </span>
  )
}

export function TelaInicial({ dia, data, partidas, estatisticas, aoEscolher }: Props) {
  const concluidos = NIVEIS.filter((n) => partidas[n] && partidas[n]!.status !== 'jogando').length
  const totalSequencia = Math.max(...NIVEIS.map((n) => estatisticas[n].sequencia))

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-lg px-4 pb-10">
      <ParedeDeEscudos />

      <header className="relative pt-40 sm:pt-48">
        <h1 className="t-camisa text-[clamp(2.5rem,11vw,3.5rem)]">
          Acerte
          <br />
          o jogador
          <br />
          pela carreira
        </h1>
        <p className="mt-5 max-w-[34ch] text-[15px] leading-relaxed text-cal-500">
          Os escudos mostram por onde ele passou. Você tem {TENTATIVAS} chutes e uma dica para
          descobrir quem é.
        </p>
      </header>

      <nav className="mt-9 border-t border-relva-700" aria-label="Escolha o nível">
        {NIVEIS.map((nivel) => {
          const partida = partidas[nivel]
          return (
            <button
              key={nivel}
              type="button"
              onClick={() => aoEscolher(nivel)}
              className="group flex w-full cursor-pointer items-center gap-4 border-b border-relva-700 py-5 text-left transition-colors hover:bg-relva-850"
            >
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-3">
                  <span
                    className="text-[26px] leading-none sm:text-[28px]"
                    style={{ fontStretch: '112%', fontWeight: 700 }}
                  >
                    {ROTULO_NIVEL[nivel]}
                  </span>
                  <MarcadorNivel nivel={nivel} />
                </span>
                <span className="mt-2 block text-[13px] text-cal-700">{DESCRICAO_NIVEL[nivel]}</span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1.5">
                {partida ? <Resultado partida={partida} /> : <span className="t-rotulo text-xs text-cal-500">Jogar</span>}
                <span className="text-cal-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                    <path d="M6.5 3.5 12 9l-5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
              </span>
            </button>
          )
        })}
      </nav>

      <footer className="mt-8 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 text-[13px] text-cal-700">
        <span>
          Desafio {dia} de{' '}
          {data.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}
        </span>
        {totalSequencia > 0 && (
          <span className="text-cal-500">
            Sequência de {totalSequencia} {totalSequencia === 1 ? 'dia' : 'dias'}
          </span>
        )}
        <span className="basis-full">
          {concluidos === NIVEIS.length ? (
            <>
              Você fechou os três de hoje. <ContagemRegressiva prefixo="Novos jogadores em" />
            </>
          ) : (
            <ContagemRegressiva prefixo="Os jogadores mudam em" />
          )}
        </span>
      </footer>
    </div>
  )
}
