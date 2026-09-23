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
  /**
   * Linha embaixo do nome na revelação, só para quem divide o nome com outro
   * jogador da biblioteca: posição e o clube em que ele mais jogou. "ADRIANO"
   * sozinho não diz se era o Imperador ou o lateral do Barcelona.
   */
  complemento?: string
  /** outras grafias aceitas como acerto (sem acento e caixa são tratados no código) */
  apelidos: string[]
  nivel: Nivel
  /**
   * Ids de clube em ordem cronológica. Um clube repetido significa que o
   * jogador voltou a ele, e o escudo aparece de novo na posição certa.
   */
  clubes: string[]
  /**
   * Duas dicas, na ordem em que o jogo oferece. A primeira situa (posição,
   * país, ano) e a segunda entrega: leva os dois fatos mais raros do jogador,
   * sem apresentação. Nenhuma das duas cita nome de jogador nem clube que
   * está à mostra no mural — `npm run validar-dados` recusa a biblioteca se
   * escapar.
   */
  dicas: [string, string]
  /**
   * Carreira conferida contra uma fonte externa. Jogador sem esta marca não
   * entra no sorteio diário — ver scripts/verificar-carreiras.mjs.
   */
  verificado?: boolean
  /** de onde veio a conferência, quando houve */
  fonte?: string
}
