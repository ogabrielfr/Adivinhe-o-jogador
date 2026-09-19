/**
 * Nível decidido à mão, que vence qualquer cálculo.
 *
 * O nível é calculado a partir de visualizações da Wikipédia em português,
 * jogos de seleção e tempo de carreira. É uma boa aproximação e erra em
 * casos concretos: jogador jovem em evidência acumula procura rápido e sobe
 * demais, jogador de época anterior à internet fica abaixo do que merece.
 *
 * Quando o cálculo errar, escreva aqui. É o único lugar em que julgamento
 * editorial entra, e ele ganha do número de propósito.
 *
 *   'id-do-jogador': 'facil' | 'intermediario' | 'dificil'
 */
export const NIVEL_FIXO = {
  // apontado pelo cliente: a carreira dele não é de nível fácil
  'vitor-roque': 'dificil',
}
