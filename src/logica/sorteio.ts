/**
 * Sorteio estável: as mesmas primitivas para o jogo e para o gerador da
 * biblioteca.
 *
 * Vivem aqui, e não dentro de `diario.ts`, porque o gerador precisa das mesmas
 * contas para garantir que um jogador caia num dia específico. Duplicar o
 * embaralhamento nos dois lados faria a garantia quebrar em silêncio no dia em
 * que um deles mudasse.
 */

/** Dia 1 do jogo. O desafio vira à meia-noite no fuso de quem está jogando. */
export const EPOCA = Date.UTC(2026, 0, 1)
const UM_DIA = 86_400_000

export function numeroDoDia(d = new Date()): number {
  const local = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  return Math.floor((local - EPOCA) / UM_DIA)
}

/** O caminho de volta: número do dia -> "AAAA-MM-DD", a chave da agenda. */
export function dataDoDia(dia: number): string {
  return new Date(EPOCA + dia * UM_DIA).toISOString().slice(0, 10)
}

export function semente(texto: string): number {
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

/**
 * Fisher-Yates com semente. A sequência de trocas depende só da semente, não
 * do conteúdo: a saída é sempre `entrada[permutacao(k)]`. É essa propriedade
 * que deixa o gerador calcular, de antemão, em que posição da lista de origem
 * um jogador precisa estar para cair num dia escolhido.
 */
export function embaralhar<T>(lista: readonly T[], s: number): T[] {
  const r = gerador(s)
  const saida = [...lista]
  for (let i = saida.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1))
    ;[saida[i], saida[j]] = [saida[j], saida[i]]
  }
  return saida
}

/** Em que posição da lista de origem está quem sai na posição `destino`. */
export function origemDaPosicao(tamanho: number, s: number, destino: number): number {
  const indices = embaralhar(
    Array.from({ length: tamanho }, (_, i) => i),
    s,
  )
  return indices[destino]
}

/** Posição sorteada para um dia, e o ciclo a que ele pertence. */
export function posicaoDoDia(dia: number, tamanho: number) {
  return {
    posicao: ((dia % tamanho) + tamanho) % tamanho,
    ciclo: Math.floor(dia / tamanho),
  }
}
