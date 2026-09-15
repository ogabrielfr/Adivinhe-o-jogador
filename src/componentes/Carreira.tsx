import { useEffect, useState } from 'react'
import { Escudo } from './Escudo'
import { CLUBE_POR_ID } from '../dados/clubes'

interface Props {
  clubes: string[]
  /** no fim da partida os nomes de todos os clubes ficam à mostra */
  revelarTudo?: boolean
  /** anima a entrada dos escudos quando a partida termina */
  animar?: boolean
}

export function Carreira({ clubes, revelarTudo = false, animar = false }: Props) {
  const [aberto, setAberto] = useState<number | null>(null)

  // o nome revelado por toque some sozinho — em celular não existe "tirar o mouse"
  useEffect(() => {
    if (aberto === null) return
    const t = setTimeout(() => setAberto(null), 2200)
    return () => clearTimeout(t)
  }, [aberto])

  return (
    <div>
      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-3 sm:gap-x-5">
        {clubes.map((id, i) => {
          const nome = CLUBE_POR_ID.get(id)?.nome ?? id
          const mostrando = revelarTudo || aberto === i
          return (
            <li key={`${id}-${i}`} className="w-[clamp(72px,21vw,104px)]">
              <button
                type="button"
                onClick={() => setAberto(aberto === i ? null : i)}
                onMouseEnter={() => !revelarTudo && setAberto(i)}
                aria-label={`Clube ${i + 1} de ${clubes.length}: ${nome}`}
                className={`block w-full cursor-pointer ${animar ? 'assentar' : ''}`}
                style={animar ? { animationDelay: `${i * 70}ms` } : undefined}
              >
                <Escudo id={id} className="aspect-square w-full" />
                <span
                  className={`t-rotulo mt-2 block text-center text-[11px] leading-tight transition-opacity duration-200 sm:text-xs ${
                    mostrando ? 'text-cal-500 opacity-100' : 'text-cal-700 opacity-0'
                  }`}
                >
                  {nome}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {!revelarTudo && (
        <p className="mt-4 text-center text-xs text-cal-700">
          Em ordem de carreira. Toque num escudo para ver o nome do clube.
        </p>
      )}
    </div>
  )
}
