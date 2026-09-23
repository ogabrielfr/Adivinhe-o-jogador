import { useEffect, useRef, useState } from 'react'
import type { Jogador, Nivel } from '../dados/tipos'
import { ROTULO_NIVEL } from '../dados/tipos'
import type { Partida } from '../logica/armazenamento'
import { DICAS, TENTATIVAS } from '../logica/armazenamento'
import { Carreira } from './Carreira'
import { MarcadorNivel } from './MarcadorNivel'
import { Compartilhar } from './Compartilhar'

export type ResultadoChute = 'acertou' | 'errou' | 'ambiguo' | 'repetido' | 'vazio'

interface Props {
  nivel: Nivel
  jogador: Jogador
  partida: Partida
  textoCompartilhar: string
  proximoNivel: Nivel | null
  aoChutar: (texto: string) => ResultadoChute
  aoPedirDica: () => void
  aoDesistir: () => void
  aoVoltar: () => void
  aoIrPara: (nivel: Nivel) => void
}

export function TelaPartida({
  nivel,
  jogador,
  partida,
  textoCompartilhar,
  proximoNivel,
  aoChutar,
  aoPedirDica,
  aoDesistir,
  aoVoltar,
  aoIrPara,
}: Props) {
  const [texto, setTexto] = useState('')
  const [aviso, setAviso] = useState<string | null>(null)
  const [tremendo, setTremendo] = useState(false)
  /** desistir é irreversível, então o primeiro toque só arma a confirmação */
  const [confirmandoDesistencia, setConfirmandoDesistencia] = useState(false)
  const campo = useRef<HTMLInputElement>(null)

  const acabou = partida.status !== 'jogando'
  const restantes = TENTATIVAS - partida.palpites.length

  useEffect(() => {
    setTexto('')
    setAviso(null)
    setConfirmandoDesistencia(false)
    if (!acabou) campo.current?.focus()
  }, [nivel, acabou])

  function enviar(e: React.FormEvent) {
    e.preventDefault()
    const resultado = aoChutar(texto)
    if (resultado === 'vazio') return
    if (resultado === 'ambiguo') {
      setAviso('Mais de um jogador atende por esse nome. Escreva o nome completo.')
      return
    }
    // antes a tela tremia como erro e o contador não mexia: parecia travado
    if (resultado === 'repetido') {
      setAviso('Você já tentou esse nome.')
      return
    }
    setTexto('')
    setAviso(null)
    if (resultado === 'errou') {
      setTremendo(true)
      setTimeout(() => setTremendo(false), 420)
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-8">
      <header className="flex items-center justify-between gap-4 border-b border-relva-700 py-4">
        <button
          type="button"
          onClick={aoVoltar}
          className="-ml-1 flex cursor-pointer items-center gap-1.5 p-1 text-cal-500 transition-colors hover:text-cal"
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <path d="M11.5 3.5 6 9l5.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <span className="t-rotulo text-sm">Níveis</span>
        </button>

        <span className="flex items-center gap-2.5">
          <span className="t-rotulo text-sm">{ROTULO_NIVEL[nivel]}</span>
          <MarcadorNivel nivel={nivel} />
        </span>

        <span className="flex items-center gap-1.5" aria-label={`${restantes} de ${TENTATIVAS} chutes restantes`}>
          {Array.from({ length: TENTATIVAS }, (_, i) => (
            <span
              key={i}
              className={`block h-2 w-2 rounded-full ${
                i < restantes ? 'bg-cal' : partida.status === 'ganhou' ? 'bg-acerto' : 'bg-relva-600'
              }`}
            />
          ))}
        </span>
      </header>

      <main className="flex flex-1 flex-col justify-center gap-7 py-8">
        <Carreira clubes={jogador.clubes} revelarTudo={acabou} animar={acabou} />

        {partida.dicasUsadas > 0 && (
          <div className="mx-auto flex w-full max-w-[38ch] flex-col gap-3">
            {jogador.dicas.slice(0, partida.dicasUsadas).map((dica, i) => (
              <p
                key={i}
                className="t-nota border-l-2 border-dica pl-4 text-[17px] leading-snug text-cal"
              >
                {dica}
              </p>
            ))}
          </div>
        )}

        {acabou ? (
          <section className="assentar text-center" style={{ animationDelay: `${jogador.clubes.length * 70 + 120}ms` }}>
            {/*
              O aviso de dica entra no meio da frase, antes do ponto. Colado
              no fim ficava "Era ele: Com as duas dicas." e o nome vinha na
              linha de baixo, como se "com as duas dicas" fosse a resposta.
            */}
            <p className="t-rotulo text-sm text-cal-500">
              {partida.status === 'ganhou'
                ? partida.palpites.length === 1
                  ? 'De primeira'
                  : `Você acertou no ${partida.palpites.length}º chute`
                : partida.desistiu
                  ? 'Você desistiu'
                  : 'Acabaram os chutes'}
              {partida.dicasUsadas > 0 && (
                <>
                  ,{' '}
                  <span className="text-dica">
                    {partida.dicasUsadas === 1 ? 'com uma dica' : 'com as duas dicas'}
                  </span>
                </>
              )}
              {partida.status === 'ganhou' ? '.' : '. Era ele:'}
            </p>
            <h2 className="t-camisa mt-3 text-[clamp(1.9rem,8.5vw,2.9rem)]">{jogador.nome}</h2>
            {jogador.complemento && (
              <p className="t-rotulo mt-2 text-sm text-cal-500">{jogador.complemento}</p>
            )}

            <div className="mt-8 flex flex-col items-center gap-3">
              <Compartilhar texto={textoCompartilhar} />
              {proximoNivel ? (
                <button
                  type="button"
                  onClick={() => aoIrPara(proximoNivel)}
                  className="t-rotulo cursor-pointer px-3 py-1.5 text-sm text-cal-500 transition-colors hover:text-cal"
                >
                  Jogar o {ROTULO_NIVEL[proximoNivel].toLowerCase()} de hoje
                </button>
              ) : (
                <button
                  type="button"
                  onClick={aoVoltar}
                  className="t-rotulo cursor-pointer px-3 py-1.5 text-sm text-cal-500 transition-colors hover:text-cal"
                >
                  Voltar aos níveis
                </button>
              )}
            </div>
          </section>
        ) : (
          <form onSubmit={enviar} className={tremendo ? 'tremer' : undefined}>
            <label htmlFor="palpite" className="sr-only">
              Nome do jogador
            </label>
            <input
              id="palpite"
              ref={campo}
              value={texto}
              onChange={(e) => {
                setTexto(e.target.value)
                setAviso(null)
              }}
              placeholder="Quem é o jogador?"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="words"
              spellCheck={false}
              enterKeyHint="go"
              className="w-full rounded-xl border border-relva-600 bg-relva-800 px-4 py-3.5 text-[17px] text-cal outline-none transition-colors placeholder:text-cal-700 focus:border-cal"
            />
            <div className="mt-3 flex gap-3">
              <button
                type="submit"
                disabled={!texto.trim()}
                className="flex-1 cursor-pointer rounded-xl bg-cal px-4 py-3.5 text-[16px] text-relva-900 transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                style={{ fontStretch: '100%', fontWeight: 700 }}
              >
                Chutar
              </button>
              <button
                type="button"
                onClick={aoPedirDica}
                disabled={partida.dicasUsadas >= DICAS}
                className="t-rotulo cursor-pointer rounded-xl border border-relva-600 px-5 py-3.5 text-[15px] text-cal-500 transition-colors hover:border-dica hover:text-dica disabled:cursor-not-allowed disabled:opacity-35"
              >
                {partida.dicasUsadas === 0 ? 'Dica' : partida.dicasUsadas === 1 ? 'Outra dica' : 'Sem mais dicas'}
              </button>
            </div>
            {partida.dicasUsadas < DICAS && (
              <p className="mt-2.5 text-center text-xs text-cal-700">
                {partida.dicasUsadas === 0
                  ? 'São duas dicas, e nenhuma gasta chute.'
                  : 'A segunda dica entrega mais. Também não gasta chute.'}
              </p>
            )}

            {/*
              Desistir revela o nome e encerra o nível, e não dá para voltar
              atrás — por isso o primeiro toque só arma a confirmação, em vez
              de queimar a partida do dia num clique sem querer.
            */}
            <div className="mt-5 text-center">
              {confirmandoDesistencia ? (
                <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-cal-700">
                  <span>Revelar o nome e encerrar?</span>
                  <button
                    type="button"
                    onClick={aoDesistir}
                    className="t-rotulo cursor-pointer rounded-lg border border-erro px-2.5 py-1 text-xs text-erro transition-colors hover:bg-erro hover:text-relva-900"
                  >
                    Desistir
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmandoDesistencia(false)}
                    className="t-rotulo cursor-pointer px-1 py-1 text-xs text-cal-500 underline underline-offset-2 transition-colors hover:text-cal"
                  >
                    Continuar jogando
                  </button>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmandoDesistencia(true)}
                  className="t-rotulo cursor-pointer px-2 py-1 text-xs text-cal-700 underline underline-offset-2 transition-colors hover:text-erro"
                >
                  Desistir e ver o nome
                </button>
              )}
            </div>
          </form>
        )}

        <div aria-live="polite" className="min-h-[1.5rem]">
          {aviso && <p className="text-center text-sm text-dica">{aviso}</p>}
          {!aviso && !acabou && partida.palpites.length > 0 && (
            <ul className="flex flex-wrap justify-center gap-2">
              {partida.palpites.map((p, i) => (
                <li
                  key={i}
                  className="t-rotulo rounded-full border border-relva-600 px-3 py-1 text-xs text-cal-700 line-through"
                >
                  {p}
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}
