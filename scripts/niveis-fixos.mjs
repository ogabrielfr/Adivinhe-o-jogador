/**
 * Nível decidido à mão, que vence qualquer cálculo.
 *
 * O nível sai de visualizações da Wikipédia em português. É a melhor medida
 * de reconhecimento brasileiro que achamos, e tem um ponto cego conhecido:
 * **ela mede fama, não mede fama de jogador.** Quem ficou famoso no banco
 * acumula procura como treinador e sobe de nível como se fosse pelo que fez
 * em campo — e o jogo mostra escudos da carreira de jogador.
 *
 * `npm run tecnicos` ordena os candidatos a esse erro pela razão entre
 * procura e tamanho da carreira de jogador. Ele não corrige nada: a razão
 * erra em casos que importam (goleiro não tem taxa de transferência, então o
 * Rogério Ceni aparece no topo da lista sendo ídolo conhecidíssimo como
 * jogador). A lista é para olhar; a decisão é daqui.
 *
 *   'id-do-jogador': 'facil' | 'intermediario' | 'dificil'
 */
export const NIVEL_FIXO = {
  /**
   * Razão 29,2 — 8761 visualizações por mês para 1 jogo de seleção e uma
   * transferência de € 1 milhão. Os escudos dele são Grêmio, Vissel Kobe,
   * Fluminense e D.C. United: dá para conhecer o nome e ainda assim não
   * chegar nele por aí. Difícil é exatamente isso.
   */
  'roger-machado': 'dificil',

  /**
   * Razão infinita — nenhum jogo de seleção, nenhuma transferência com
   * valor. Toda a procura pelo nome é pelo treinador; o lateral do Vasco e
   * do Olaria dos anos 1970 não é o que o torcedor lembra.
   */
  'joel-santana': 'dificil',

  /**
   * Razão 3,3. O caso mais discutível dos três, e por isso está aqui e não
   * mais embaixo: ele foi volante do Barcelona com 47 jogos pela Espanha, o
   * que é carreira de sobra. Mas as 16 mil visualizações por mês são do
   * treinador do City, e no fácil ele entrega o jogo pelo nome antes de o
   * torcedor olhar os escudos. No intermediário a carreira de jogador vira
   * o enigma que ela é.
   */
  'josep-guardiola': 'intermediario',

  /**
   * Decisões do cliente jogando, no dia em que os dois caíram (23/09): o
   * Mário Fernandes, lateral do CSKA que defendeu a seleção russa, o torcedor
   * conhece mas precisa pensar; o Desailly, campeão do mundo pela França, o
   * torcedor brasileiro não situa pelos escudos. São também exemplos da
   * régua por amostra: a fama no mundo superestima o europeu.
   */
  'mario-fernandes': 'intermediario',
  'marcel-desailly': 'dificil',
}
