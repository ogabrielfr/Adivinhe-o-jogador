import { NIVEIS, ROTULO_NIVEL } from '../dados/tipos'
import type { Nivel } from '../dados/tipos'
import type { Partida } from './armazenamento'
import { TENTATIVAS } from './armazenamento'

/**
 * Resumo do dia inteiro, sem entregar nenhum nome.
 * 🟢 sem dica · 🟡 com uma dica · 🟠 com as duas · ⬛ não saiu
 */
export function textoDeCompartilhamento(
  dia: number,
  partidas: Partial<Record<Nivel, Partida>>,
  url = typeof location !== 'undefined' ? location.href.split('?')[0] : '',
): string {
  const linhas = NIVEIS.flatMap((nivel) => {
    const p = partidas[nivel]
    if (!p || p.status === 'jogando') return []
    const marca = p.status === 'perdeu' ? '⬛' : ['🟢', '🟡', '🟠'][Math.min(p.dicasUsadas, 2)]
    const placar = p.status === 'perdeu' ? `X/${TENTATIVAS}` : `${p.palpites.length}/${TENTATIVAS}`
    return [`${marca} ${ROTULO_NIVEL[nivel]} ${placar}`]
  })

  return [`Acerte o jogador pela carreira #${dia}`, '', ...linhas, '', url].join('\n')
}
