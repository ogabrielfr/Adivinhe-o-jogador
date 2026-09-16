import { JOGADORES } from '../dados/jogadores'
import type { Jogador, Nivel } from '../dados/tipos'
import { formasAceitas } from './texto'
import { embaralhar, numeroDoDia, posicaoDoDia, semente } from './sorteio'

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
 * Quando ligado, só jogadores com a carreira conferida contra fonte externa
 * entram no sorteio. Está desligado porque a conferência ainda não rodou —
 * ligar agora deixaria os três níveis vazios.
 */
export const EXIGIR_VERIFICACAO = false

const elegivel = (j: Jogador) => !EXIGIR_VERIFICACAO || j.verificado === true

const POR_NIVEL: Record<Nivel, Jogador[]> = {
  facil: JOGADORES.filter((j) => j.nivel === 'facil' && elegivel(j)),
  intermediario: JOGADORES.filter((j) => j.nivel === 'intermediario' && elegivel(j)),
  dificil: JOGADORES.filter((j) => j.nivel === 'dificil' && elegivel(j)),
}

/**
 * Jogador do dia. A lista de cada nível é reembaralhada a cada ciclo completo,
 * então ninguém se repete antes de todos terem aparecido uma vez.
 */
export function jogadorDoDia(nivel: Nivel, dia = numeroDoDia()): Jogador {
  const lista = POR_NIVEL[nivel]
  const { posicao, ciclo } = posicaoDoDia(dia, lista.length)
  return embaralhar(lista, semente(`${nivel}:${ciclo}`))[posicao]
}

export function totalNoNivel(nivel: Nivel): number {
  return POR_NIVEL[nivel].length
}

/** Palpites que casariam com mais de um jogador precisam de desempate. */
export const PALPITES_AMBIGUOS: ReadonlySet<string> = (() => {
  const contagem = new Map<string, Set<string>>()
  for (const j of JOGADORES) {
    // o mesmo conjunto que o jogo aceita como acerto, para que uma palavra
    // servindo a dois jogadores seja recusada em vez de premiar o primeiro
    for (const k of formasAceitas(j.nome, j.apelidos)) {
      if (!contagem.has(k)) contagem.set(k, new Set())
      contagem.get(k)!.add(j.id)
    }
  }
  return new Set([...contagem].filter(([, ids]) => ids.size > 1).map(([k]) => k))
})()
