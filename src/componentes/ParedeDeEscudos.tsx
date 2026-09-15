import { useMemo } from 'react'
import { ESCUDOS } from '../dados/escudos'
import { Escudo } from './Escudo'

/**
 * Hero da tela inicial: uma parede de escudos que diz, sem uma palavra, do que
 * o jogo se trata. Sorteia entre os clubes com escudo real e não tem relação
 * com o desafio do dia, então não entrega nada.
 */
export function ParedeDeEscudos({ quantidade = 28 }: { quantidade?: number }) {
  const ids = useMemo(() => {
    const todos = Object.keys(ESCUDOS)
    for (let i = todos.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[todos[i], todos[j]] = [todos[j], todos[i]]
    }
    return todos.slice(0, quantidade)
  }, [quantidade])

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-52 overflow-hidden select-none sm:h-60"
      style={{
        maskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.42) 52%, transparent 84%)',
        WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.42) 52%, transparent 84%)',
      }}
    >
      <div className="flex flex-wrap justify-center gap-2 px-2 pt-3">
        {ids.map((id) => (
          <Escudo key={id} id={id} adiar className="h-14 w-14 shrink-0 opacity-55 sm:h-16 sm:w-16" />
        ))}
      </div>
    </div>
  )
}
