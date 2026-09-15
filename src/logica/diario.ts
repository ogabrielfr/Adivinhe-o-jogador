import { JOGADORES } from '../dados/jogadores'
import type { Jogador, Nivel } from '../dados/tipos'

/** Dia 1 do jogo. O desafio vira à meia-noite no fuso de quem está jogando. */
const EPOCA = Date.UTC(2026, 0, 1)
const UM_DIA = 86_400_000

export function chaveDoDia(d = new Date()): string {
  const mes = String(d.getMonth() + 1).padStart(2, '0')
  const dia = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mes}-${dia}`
}

export function numeroDoDia(d = new Date()): number {
  return Math.round((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - EPOCA) / UM_DIA)
}

export function msAteAmanha(d = new Date()): number {
  const amanha = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)
  return amanha.getTime() - d.getTime()
}

// ------------------------------------------------------------ sorteio estável
function semente(texto: string): number {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

function gerador(s: number) {
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = Math.imul(s ^ (s >>> 15), 1 | s)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function embaralhar<T>(lista: T[], s: number): T[] {
  const r = gerador(s)
  const saida = [...lista]
  for (let i = saida.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[saida[i], saida[j]] = [saida[j], saida[i]]
  }
  return saida
}

const POR_NIVEL: Record<Nivel, Jogador[]> = {
  facil: JOGADORES.filter((j) => j.nivel === 'facil'),
  intermediario: JOGADORES.filter((j) => j.nivel === 'intermediario'),
  dificil: JOGADORES.filter((j) => j.nivel === 'dificil'),
}

/**
 * Jogador do dia. A lista de cada nível é reembaralhada a cada ciclo completo,
 * então ninguém se repete antes de todos terem aparecido uma vez.
 */
export function jogadorDoDia(nivel: Nivel, dia = numeroDoDia()): Jogador {
  const lista = POR_NIVEL[nivel]
  const posicaoAbsoluta = ((dia % lista.length) + lista.length) % lista.length
  const ciclo = Math.floor(dia / lista.length)
  return embaralhar(lista, semente(`${nivel}:${ciclo}`))[posicaoAbsoluta]
}

export function totalNoNivel(nivel: Nivel): number {
  return POR_NIVEL[nivel].length
}

/** Palpites que casariam com mais de um jogador precisam de desempate. */
export const PALPITES_AMBIGUOS: ReadonlySet<string> = (() => {
  const contagem = new Map<string, Set<string>>()
  for (const j of JOGADORES) {
    for (const p of [j.nome, ...j.apelidos]) {
      const k = p.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
      if (!contagem.has(k)) contagem.set(k, new Set())
      contagem.get(k)!.add(j.id)
    }
  }
  return new Set([...contagem].filter(([, ids]) => ids.size > 1).map(([k]) => k))
})()
