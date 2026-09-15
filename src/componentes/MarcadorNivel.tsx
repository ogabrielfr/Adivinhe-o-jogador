import type { Nivel } from '../dados/tipos'

const PESO: Record<Nivel, number> = { facil: 1, intermediario: 2, dificil: 3 }

/** Três barras: quantas estão acesas é a dificuldade. Cor não carrega a informação. */
export function MarcadorNivel({ nivel }: { nivel: Nivel }) {
  const acesas = PESO[nivel]
  return (
    <span className="flex items-end gap-[3px]" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={i < acesas ? 'bg-cal' : 'bg-relva-600'}
          style={{ width: 4, height: 9 + i * 5, borderRadius: 1 }}
        />
      ))}
    </span>
  )
}
