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
  /** slug estável, fixado em scripts/clubes-canonicos.mjs para os clubes em uso */
  id: string
  nome: string
  /** sigla do país */
  pais: string
  /** arquivo em public/escudos; ausente quando nenhuma fonte cobre o clube */
  escudo?: string
  /** cores oficiais [primária, secundária], só nos clubes sem escudo */
  cores?: [string, string]
}

export interface Jogador {
  id: string
  /** resposta canônica, exibida no fim da partida */
  nome: string
  /** outras grafias aceitas como acerto (sem acento e caixa são tratados no código) */
  apelidos: string[]
  nivel: Nivel
  /**
   * Ids de clube em ordem cronológica. Um clube repetido significa que o
   * jogador voltou a ele, e o escudo aparece de novo na posição certa.
   */
  clubes: string[]
  /** uma frase que revela algo marcante sem entregar nome, clube ou posição */
  dica: string
  /**
   * Carreira conferida contra uma fonte externa. Jogador sem esta marca não
   * entra no sorteio diário — ver scripts/verificar-carreiras.mjs.
   */
  verificado?: boolean
  /** de onde veio a conferência, quando houve */
  fonte?: string
}
