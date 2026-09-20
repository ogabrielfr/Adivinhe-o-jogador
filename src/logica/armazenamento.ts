import type { Nivel } from '../dados/tipos'
import { NIVEIS } from '../dados/tipos'

export const TENTATIVAS = 3

export type StatusPartida = 'jogando' | 'ganhou' | 'perdeu'

export interface Partida {
  status: StatusPartida
  /** o que a pessoa digitou, na ordem */
  palpites: string[]
  usouDica: boolean
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

export const partidaNova = (): Partida => ({ status: 'jogando', palpites: [], usouDica: false })

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
    return { versao: 1, dia: diaAtual, partidas: salvo.partidas ?? {}, estatisticas }
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
