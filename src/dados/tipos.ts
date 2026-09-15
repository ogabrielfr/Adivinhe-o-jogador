export type Nivel = 'facil' | 'intermediario' | 'dificil'

export const NIVEIS: Nivel[] = ['facil', 'intermediario', 'dificil']

export const ROTULO_NIVEL: Record<Nivel, string> = {
  facil: 'Fácil',
  intermediario: 'Intermediário',
  dificil: 'Difícil',
}

export const DESCRICAO_NIVEL: Record<Nivel, string> = {
  facil: 'Craques que todo mundo reconhece de cara.',
  intermediario: 'Você conhece, mas vai ter que pensar.',
  dificil: 'Carreiras errantes e nomes que o tempo apagou.',
}

export interface Clube {
  /** slug estável — também é o nome do arquivo do escudo */
  id: string
  nome: string
  /** ISO do país, usado no rótulo e no escudo de reserva */
  pais: string
  /** cores oficiais [primária, secundária] — usadas quando não há escudo real */
  cores: [string, string]
}

export interface Jogador {
  id: string
  /** resposta canônica, exibida no fim da partida */
  nome: string
  /** outras grafias aceitas como acerto (sem acento e caixa são tratados no código) */
  apelidos: string[]
  nivel: Nivel
  /** ids de clube em ordem cronológica de carreira */
  clubes: string[]
  /** uma frase que revela algo marcante sem entregar nome, clube ou posição */
  dica: string
}
