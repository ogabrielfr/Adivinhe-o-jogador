import { NIVEIS, ROTULO_NIVEL } from '../dados/tipos'
import type { Nivel } from '../dados/tipos'
import type { Estatistica } from '../logica/armazenamento'
import { sequenciaAtual, TENTATIVAS } from '../logica/armazenamento'
import { MarcadorNivel } from './MarcadorNivel'

interface Props {
  dia: number
  estatisticas: Record<Nivel, Estatistica>
  aoVoltar: () => void
}

/**
 * O histórico de cada nível: jogos, aproveitamento, sequências e em que chute
 * a pessoa costuma acertar. O jogo sempre guardou tudo isso, mas a tela só
 * mostrava a sequência atual — e em jogo diário a estatística é boa parte do
 * motivo para voltar amanhã. Fica tudo no aparelho, como o resto.
 */
export function TelaEstatisticas({ dia, estatisticas, aoVoltar }: Props) {
  const jogouAlgum = NIVEIS.some((n) => estatisticas[n].jogadas > 0)

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-10">
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
        <h1 className="t-rotulo text-sm">Estatísticas</h1>
        {/* equilibra o cabeçalho, para o título ficar no centro */}
        <span className="w-[72px]" aria-hidden="true" />
      </header>

      {!jogouAlgum && (
        <p className="mt-10 text-center text-[15px] text-cal-500">
          Termine uma partida e o seu histórico aparece aqui.
        </p>
      )}

      <div className="mt-2">
        {NIVEIS.map((nivel) => (
          <ResumoDoNivel key={nivel} nivel={nivel} e={estatisticas[nivel]} dia={dia} />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-cal-700">
        O histórico fica guardado neste aparelho e neste navegador.
      </p>
    </div>
  )
}

function ResumoDoNivel({ nivel, e, dia }: { nivel: Nivel; e: Estatistica; dia: number }) {
  const aproveitamento = e.jogadas ? Math.round((e.vitorias / e.jogadas) * 100) : 0
  const maior = Math.max(...e.porTentativa, 1)

  return (
    <section className="border-b border-relva-700 py-6" aria-label={`Estatísticas do nível ${ROTULO_NIVEL[nivel]}`}>
      <h2 className="flex items-center gap-3">
        <span className="text-[22px] leading-none" style={{ fontStretch: '112%', fontWeight: 700 }}>
          {ROTULO_NIVEL[nivel]}
        </span>
        <MarcadorNivel nivel={nivel} />
      </h2>

      {e.jogadas === 0 ? (
        <p className="mt-3 text-[13px] text-cal-700">Nenhuma partida terminada ainda.</p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
            <Numero valor={e.jogadas} rotulo={e.jogadas === 1 ? 'partida' : 'partidas'} />
            <Numero valor={`${aproveitamento}%`} rotulo="de acertos" />
            <Numero valor={sequenciaAtual(e, dia)} rotulo="sequência atual" />
            <Numero valor={e.melhorSequencia} rotulo="maior sequência" />
          </dl>

          <p className="t-rotulo mt-5 text-xs text-cal-500">Acertou no</p>
          <ol className="mt-2 flex flex-col gap-1.5">
            {Array.from({ length: TENTATIVAS }, (_, i) => {
              const n = e.porTentativa[i] ?? 0
              return (
                <li key={i} className="flex items-center gap-3 text-[13px]">
                  <span className="t-rotulo w-16 shrink-0 text-cal-500">{i + 1}º chute</span>
                  <span className="flex-1">
                    <span
                      className={`block h-5 min-w-5 rounded-sm px-1.5 text-right text-xs leading-5 ${
                        n ? 'bg-acerto text-relva-900' : 'bg-relva-700 text-cal-700'
                      }`}
                      style={{ width: `${Math.max((n / maior) * 100, 8)}%`, fontWeight: 700 }}
                    >
                      {n}
                    </span>
                  </span>
                </li>
              )
            })}
          </ol>
          {e.jogadas > e.vitorias && (
            <p className="mt-2 text-[13px] text-cal-700">
              Não saiu em {e.jogadas - e.vitorias} {e.jogadas - e.vitorias === 1 ? 'partida' : 'partidas'}.
            </p>
          )}
        </>
      )}
    </section>
  )
}

function Numero({ valor, rotulo }: { valor: number | string; rotulo: string }) {
  return (
    <div className="flex flex-col-reverse gap-1">
      <dt className="text-[11px] leading-tight text-cal-700">{rotulo}</dt>
      <dd className="text-[26px] leading-none" style={{ fontStretch: '112%', fontWeight: 700 }}>
        {valor}
      </dd>
    </div>
  )
}
