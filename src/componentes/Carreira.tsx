import { Escudo } from './Escudo'
import { CLUBE_POR_ID } from '../dados/clubes'

interface Props {
  clubes: string[]
  /** no fim da partida a orientação sai de baixo dos escudos */
  acabou?: boolean
  /** anima a entrada dos escudos quando a partida termina */
  animar?: boolean
}

/**
 * Carreira longa encolhe o escudo para caber em quatro fileiras no celular.
 * Com três por fileira, 13 escudos já eram cinco fileiras e o campo de
 * palpite descia para fora da tela. O cliente pediu todos os escudos, sem
 * teto — o Rivaldo tem 16, e carreira confusa é a graça do jogo.
 */
function largura(quantos: number): string {
  if (quantos > 16) return 'w-[clamp(48px,14.5vw,76px)]'
  if (quantos > 12) return 'w-[clamp(56px,18vw,88px)]'
  return 'w-[clamp(72px,21vw,104px)]'
}

/**
 * O nome do clube fica à mostra embaixo de cada escudo, a partida inteira.
 * Ficava escondido até o toque; o cliente pediu que aparecesse direto.
 *
 * O nome ocupa também o vão entre os escudos: com 18 escudos num celular de
 * 360 pixels, cada um tem 52 de largura, e "Corinthians" partia no meio da
 * palavra.
 */
export function Carreira({ clubes, acabou = false, animar = false }: Props) {
  return (
    <div>
      <ul
        aria-label="Clubes da carreira, em ordem"
        className="flex flex-wrap justify-center gap-x-3 gap-y-3 sm:gap-x-5"
      >
        {clubes.map((id, i) => (
          <li
            key={`${id}-${i}`}
            className={`${largura(clubes.length)} ${animar ? 'assentar' : ''}`}
            style={animar ? { animationDelay: `${i * 70}ms` } : undefined}
          >
            <Escudo id={id} className="aspect-square w-full" />
            <span className="t-rotulo -mx-1.5 mt-2 block text-center text-[11px] leading-tight text-cal-500 break-words sm:-mx-2.5 sm:text-xs">
              {CLUBE_POR_ID.get(id)?.nome ?? id}
            </span>
          </li>
        ))}
      </ul>
      {!acabou && <p className="mt-4 text-center text-xs text-cal-700">Em ordem de carreira.</p>}
    </div>
  )
}
