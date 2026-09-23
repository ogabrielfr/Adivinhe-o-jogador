import { JOGADORES } from '../dados/jogadores'
import agenda from '../dados/agenda.json' with { type: 'json' }
import type { Jogador, Nivel } from '../dados/tipos'
import { formasDerivadas } from './texto'
import { dataDoDia, embaralhar, numeroDoDia, posicaoDoDia, semente } from './sorteio'

export { numeroDoDia } from './sorteio'


export function chaveDoDia(d = new Date()): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function msAteAmanha(d = new Date()): number {
  const amanha = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  return amanha.getTime() - d.getTime()
}

/**
 * Só entra no sorteio quem tem a carreira vinda de fonte externa, não da
 * memória do modelo. Ligado desde que a biblioteca passou a ser gerada do
 * histórico do Transfermarkt — antes disso deixaria os três níveis vazios.
 *
 * `verificado` quer dizer "a lista de clubes e a ordem saíram de uma fonte
 * externa e `fonte` aponta qual", não "alguém conferiu à mão".
 */
export const EXIGIR_VERIFICACAO = true

const elegivel = (j: Jogador) => !EXIGIR_VERIFICACAO || j.verificado === true

const POR_NIVEL: Record<Nivel, Jogador[]> = {
  facil: JOGADORES.filter((j) => j.nivel === 'facil' && elegivel(j)),
  intermediario: JOGADORES.filter((j) => j.nivel === 'intermediario' && elegivel(j)),
  dificil: JOGADORES.filter((j) => j.nivel === 'dificil' && elegivel(j)),
}

const POR_ID = new Map(JOGADORES.map((j) => [j.id, j]))

/**
 * A agenda: quem cai em cada dia, já decidido. Vence o sorteio.
 *
 * O sorteio sozinho embaralha a lista inteira do nível, então qualquer troca
 * na biblioteca mudava o jogador de todos os dias — inclusive o de hoje, para
 * quem já tinha jogado, que via "Era ele:" com outro nome. Com a agenda, mexer
 * na biblioteca só afeta os dias que ainda não estão nela. `npm run agenda`
 * estende a agenda a partir do sorteio, e o arquivo pode ser editado à mão.
 */
const AGENDA: Record<string, Partial<Record<Nivel, string>>> = agenda.dias

/**
 * Jogador do dia: o da agenda, e sem agenda o do sorteio. A lista de cada nível
 * é reembaralhada a cada ciclo completo, então ninguém se repete antes de
 * todos terem aparecido uma vez.
 */
export function jogadorDoDia(nivel: Nivel, dia = numeroDoDia()): Jogador {
  const marcado = POR_ID.get(AGENDA[dataDoDia(dia)]?.[nivel] ?? '')
  if (marcado && elegivel(marcado)) return marcado
  return sorteado(nivel, dia)
}

/** O que o sorteio dá para o dia, sem olhar a agenda. */
export function sorteado(nivel: Nivel, dia: number): Jogador {
  const lista = POR_NIVEL[nivel]
  const { posicao, ciclo } = posicaoDoDia(dia, lista.length)
  return embaralhar(lista, semente(`${nivel}:${ciclo}`))[posicao]
}

/** Jogador pelo id, para a partida salva continuar com quem ela começou. */
export const jogadorPorId = (id: string | undefined): Jogador | undefined =>
  id ? POR_ID.get(id) : undefined

export function totalNoNivel(nivel: Nivel): number {
  return POR_NIVEL[nivel].length
}

/**
 * Palpites que casariam com mais de um jogador precisam de desempate — mas só
 * quando são pedaço de nome. O nome canônico sempre vale: existem dois
 * Paulinhos na biblioteca, e quem digita "Paulinho" no dia de um deles não tem
 * como ser mais específico. Recusar seria pedir o nome de registro, que
 * ninguém sabe.
 */
export const PALPITES_AMBIGUOS: ReadonlySet<string> = (() => {
  const contagem = new Map<string, Set<string>>()
  for (const j of JOGADORES) {
    for (const k of formasDerivadas(j.nome, j.apelidos)) {
      if (!contagem.has(k)) contagem.set(k, new Set())
      contagem.get(k)!.add(j.id)
    }
  }
  return new Set([...contagem].filter(([, ids]) => ids.size > 1).map(([k]) => k))
})()
