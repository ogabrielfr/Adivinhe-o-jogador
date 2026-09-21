import type { Nivel } from '../dados/tipos'
import { NIVEIS } from '../dados/tipos'

export const TENTATIVAS = 3
/** Duas dicas por jogador: a primeira situa, a segunda entrega. */
export const DICAS = 2

export type StatusPartida = 'jogando' | 'ganhou' | 'perdeu'

export interface Partida {
  status: StatusPartida
  /** o que a pessoa digitou, na ordem */
  palpites: string[]
  /** quantas das duas dicas a pessoa já pediu */
  dicasUsadas: number
  /**
   * Desistiu em vez de gastar os três chutes. Conta como derrota igual, e
   * serve só para a tela não dizer "acabaram os chutes" a quem ainda tinha.
   * Opcional porque partida salva antes desta versão não tem o campo.
   */
  desistiu?: boolean
}

export interface Estatistica {
  jogadas: number
  vitorias: number
  sequencia: number
  melhorSequencia: number
  /** número do dia da última partida concluída, para saber se a sequência quebrou */
  ultimoDia: number | null
  /** vitórias com 1, 2 e 3 tentativas */
  porTentativa: [number, number, number]
}

interface Estado {
  versao: 1
  /** só o dia corrente é guardado; partidas antigas não têm mais uso */
  dia: string | null
  partidas: Partial<Record<Nivel, Partida>>
  estatisticas: Record<Nivel, Estatistica>
}

const CHAVE = 'acerte-o-jogador:v1'

const estatisticaZerada = (): Estatistica => ({
  jogadas: 0,
  vitorias: 0,
  sequencia: 0,
  melhorSequencia: 0,
  ultimoDia: null,
  porTentativa: [0, 0, 0],
})

export const partidaNova = (): Partida => ({ status: 'jogando', palpites: [], dicasUsadas: 0 })

/**
 * Partida gravada antes das duas dicas guardava `usouDica: boolean`. O estado
 * só sobrevive ao dia corrente, então isto vale por poucas horas — mas nessas
 * horas o jogo mostraria "nenhuma dica usada" para quem já tinha usado a sua.
 */
function migrar(p: Partida & { usouDica?: boolean }): Partida {
  if (typeof p?.dicasUsadas === 'number') return p
  const { usouDica, ...resto } = p ?? {}
  return { ...resto, dicasUsadas: usouDica ? 1 : 0 } as Partida
}

const estadoInicial = (): Estado => ({
  versao: 1,
  dia: null,
  partidas: {},
  estatisticas: Object.fromEntries(NIVEIS.map((n) => [n, estatisticaZerada()])) as Record<Nivel, Estatistica>,
})

/** localStorage pode estar bloqueado (aba anônima, cookies desligados) — o jogo segue sem histórico. */
export function carregar(diaAtual: string): Estado {
  try {
    const bruto = localStorage.getItem(CHAVE)
    if (!bruto) return { ...estadoInicial(), dia: diaAtual }
    const salvo = JSON.parse(bruto) as Estado
    if (salvo.versao !== 1) return { ...estadoInicial(), dia: diaAtual }
    const estatisticas = { ...estadoInicial().estatisticas, ...salvo.estatisticas }
    // virou o dia: as partidas de ontem não valem mais
    if (salvo.dia !== diaAtual) return { versao: 1, dia: diaAtual, partidas: {}, estatisticas }
    const partidas = Object.fromEntries(
      Object.entries(salvo.partidas ?? {}).map(([n, p]) => [n, migrar(p as Partida)]),
    ) as Partial<Record<Nivel, Partida>>
    return { versao: 1, dia: diaAtual, partidas, estatisticas }
  } catch {
    return { ...estadoInicial(), dia: diaAtual }
  }
}

export function salvar(estado: Estado): void {
  try {
    localStorage.setItem(CHAVE, JSON.stringify(estado))
  } catch {
    // sem espaço ou sem permissão: a partida continua válida em memória
  }
}

/** Atualiza as estatísticas de um nível quando a partida do dia termina. */
export function registrarResultado(
  anterior: Estatistica,
  ganhou: boolean,
  tentativasUsadas: number,
  dia: number,
): Estatistica {
  const emSequencia = anterior.ultimoDia === null || anterior.ultimoDia === dia - 1
  const sequencia = ganhou ? (emSequencia ? anterior.sequencia : 0) + 1 : 0
  const porTentativa = [...anterior.porTentativa] as [number, number, number]
  if (ganhou && tentativasUsadas >= 1 && tentativasUsadas <= TENTATIVAS) porTentativa[tentativasUsadas - 1]++
  return {
    jogadas: anterior.jogadas + 1,
    vitorias: anterior.vitorias + (ganhou ? 1 : 0),
    sequencia,
    melhorSequencia: Math.max(anterior.melhorSequencia, sequencia),
    ultimoDia: dia,
    porTentativa,
  }
}

export type { Estado }
