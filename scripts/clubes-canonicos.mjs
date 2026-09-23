/**
 * Clubes referenciados pelos jogadores.
 *
 * CANONICOS fixa o id e o nome em português de um clube que existe nas fontes:
 * `de` é o id que o gerador produziria sozinho a partir do nome do arquivo.
 * Sem isso o Barcelona viraria "fc-barcelona" e quebraria os dados existentes.
 */
export const CANONICOS = {
  /**
   * Nomes que saíram errados ou longos demais das fontes. O jogador vê este
   * nome ao tocar no escudo e dentro da dica de tempo de casa, então
   * "Hotspur" e "Goias" não servem.
   */
  'goias': { de: 'goias', nome: "Goiás", pais: 'BR' },
  'avai': { de: 'avai', nome: "Avaí", pais: 'BR' },
  'ceara': { de: 'ceara', nome: "Ceará", pais: 'BR' },
  'hotspur': { de: 'hotspur', nome: "Tottenham", pais: 'EN' },
  'unione-sportiva-catanzaro': { de: 'unione-sportiva-catanzaro', nome: "Catanzaro", pais: 'IT' },
  'comercial-futebol-clube-ribeirao-preto': {
    de: 'comercial-futebol-clube-ribeirao-preto', nome: "Comercial-SP", pais: 'BR',
  },

  'arouca': { de: 'fc-arouca', nome: "Arouca", pais: 'PT' },
  'londrina': { de: 'londrina', nome: "Londrina", pais: 'BR' },
  'flamengo': { de: 'flamengo', nome: "Flamengo", pais: 'BR' },
  'palmeiras': { de: 'palmeiras', nome: "Palmeiras", pais: 'BR' },
  'corinthians': { de: 'corinthians', nome: "Corinthians", pais: 'BR' },
  'sao-paulo': { de: 'sao-paulo', nome: "São Paulo", pais: 'BR' },
  'santos': { de: 'santos', nome: "Santos", pais: 'BR' },
  'vasco': { de: 'vasco', nome: "Vasco da Gama", pais: 'BR' },
  'fluminense': { de: 'fluminense', nome: "Fluminense", pais: 'BR' },
  'botafogo': { de: 'botafogo', nome: "Botafogo", pais: 'BR' },
  'gremio': { de: 'gremio', nome: "Grêmio", pais: 'BR' },
  'internacional': { de: 'internacional', nome: "Internacional", pais: 'BR' },
  'cruzeiro': { de: 'cruzeiro', nome: "Cruzeiro", pais: 'BR' },
  'atletico-mg': { de: 'atletico-mg', nome: "Atlético Mineiro", pais: 'BR' },
  'athletico-pr': { de: 'parana', nome: "Athletico Paranaense", pais: 'BR' },
  'coritiba': { de: 'coritiba', nome: "Coritiba", pais: 'BR' },
  'bahia': { de: 'bahia', nome: "Bahia", pais: 'BR' },
  'sport': { de: 'sport', nome: "Sport Recife", pais: 'BR' },
  'vitoria': { de: 'vitoria', nome: "Vitória", pais: 'BR' },
  'figueirense': { de: 'figueirense', nome: "Figueirense", pais: 'BR' },
  'portuguesa': { de: 'portuguesa', nome: "Portuguesa", pais: 'BR' },
  'boca-juniors': { de: 'boca-juniors', nome: "Boca Juniors", pais: 'AR' },
  'velez-sarsfield': { de: 'velez', nome: "Vélez Sarsfield", pais: 'AR' },
  'barcelona': { de: 'barcelona', nome: "Barcelona", pais: 'ES' },
  'real-madrid': { de: 'real-madrid', nome: "Real Madrid", pais: 'ES' },
  'atletico-madrid': { de: 'atletico-madrid', nome: "Atlético de Madrid", pais: 'ES' },
  'valencia': { de: 'valencia', nome: "Valencia", pais: 'ES' },
  'villarreal': { de: 'villarreal', nome: "Villarreal", pais: 'ES' },
  'real-betis': { de: 'real-betis', nome: "Real Betis", pais: 'ES' },
  'espanyol': { de: 'espanyol', nome: "Espanyol", pais: 'ES' },
  'milan': { de: 'ac-milan', nome: "Milan", pais: 'IT' },
  'inter': { de: 'inter-milan', nome: "Inter de Milão", pais: 'IT' },
  'juventus': { de: 'juventus', nome: "Juventus", pais: 'IT' },
  'roma': { de: 'roma', nome: "Roma", pais: 'IT' },
  'fiorentina': { de: 'fiorentina', nome: "Fiorentina", pais: 'IT' },
  'parma': { de: 'parma', nome: "Parma", pais: 'IT' },
  'monza': { de: 'monza', nome: "Monza", pais: 'IT' },
  'manchester-united': { de: 'manchester-united', nome: "Manchester United", pais: 'EN' },
  'manchester-city': { de: 'manchester-city', nome: "Manchester City", pais: 'EN' },
  'liverpool': { de: 'liverpool', nome: "Liverpool", pais: 'EN' },
  'chelsea': { de: 'chelsea', nome: "Chelsea", pais: 'EN' },
  'arsenal': { de: 'arsenal', nome: "Arsenal", pais: 'EN' },
  'tottenham': { de: 'tottenham-hotspur', nome: "Tottenham", pais: 'EN' },
  'everton': { de: 'everton', nome: "Everton", pais: 'EN' },
  'aston-villa': { de: 'aston-villa', nome: "Aston Villa", pais: 'EN' },
  'sunderland': { de: 'sunderland', nome: "Sunderland", pais: 'EN' },
  'nottingham-forest': { de: 'nottingham-forest', nome: "Nottingham Forest", pais: 'EN' },
  'psg': { de: 'paris-saint-germain', nome: "Paris Saint-Germain", pais: 'FR' },
  'marseille': { de: 'marseille', nome: "Olympique de Marseille", pais: 'FR' },
  'lyon': { de: 'lyon', nome: "Olympique Lyonnais", pais: 'FR' },
  'monaco': { de: 'monaco', nome: "Monaco", pais: 'FR' },
  'bordeaux': { de: 'g-bordeaux', nome: "Bordeaux", pais: 'FR' },
  'nice': { de: 'nice', nome: "Nice", pais: 'FR' },
  'bayern': { de: 'bayern-munich', nome: "Bayern de Munique", pais: 'DE' },
  'bayer-leverkusen': { de: 'leverkusen', nome: "Bayer Leverkusen", pais: 'DE' },
  'werder-bremen': { de: 'sv-werder-bremen', nome: "Werder Bremen", pais: 'DE' },
  'wolfsburg': { de: 'wolfsburg', nome: "Wolfsburg", pais: 'DE' },
  'hamburgo': { de: 'hamburger', nome: "Hamburgo", pais: 'DE' },
  'schalke': { de: 'schalke-04', nome: "Schalke 04", pais: 'DE' },
  'hoffenheim': { de: 'hoffenheim', nome: "Hoffenheim", pais: 'DE' },
  'porto': { de: 'porto', nome: "Porto", pais: 'PT' },
  'benfica': { de: 'benfica', nome: "Benfica", pais: 'PT' },
  'sporting-cp': { de: 'sporting-cp', nome: "Sporting", pais: 'PT' },
  'vitoria-guimaraes': { de: 'vitoria-guimaraes-sc', nome: "Vitória de Guimarães", pais: 'PT' },
  'ajax': { de: 'ajax', nome: "Ajax", pais: 'NL' },
  'psv': { de: 'psv-eindhoven', nome: "PSV", pais: 'NL' },
  'feyenoord': { de: 'feyenoord', nome: "Feyenoord", pais: 'NL' },
  'galatasaray': { de: 'galatasaray', nome: "Galatasaray", pais: 'TR' },
  'fenerbahce': { de: 'fenerbahce', nome: "Fenerbahçe", pais: 'TR' },
  'besiktas': { de: 'besiktas-jk', nome: "Beşiktaş", pais: 'TR' },
  'kayserispor': { de: 'kayserispor', nome: "Kayserispor", pais: 'TR' },
  'basel': { de: 'fc-basel', nome: "Basel", pais: 'CH' },
  'olympiacos': { de: 'olympiacos', nome: "Olympiacos", pais: 'GR' },
  'shakhtar': { de: 'shakhtar-donetsk', nome: "Shakhtar Donetsk", pais: 'UA' },
  'zenit': { de: 'zenit-s-pb', nome: "Zenit", pais: 'RU' },
  'cska-moscow': { de: 'cska-moscow', nome: "CSKA Moscou", pais: 'RU' },
  'lokomotiv-moscow': { de: 'lokomotiv-moscow', nome: "Lokomotiv Moscou", pais: 'RU' },
  'rosenborg': { de: 'rosenborg-bk', nome: "Rosenborg", pais: 'NO' },
  'copenhagen': { de: 'fc-copenhagen', nome: "Copenhague", pais: 'DK' },
  'inter-miami': { de: 'inter-miami-cf', nome: "Inter Miami", pais: 'US' },
  'la-galaxy': { de: 'la-galaxy', nome: "LA Galaxy", pais: 'US' },
  'orlando-city': { de: 'orlando-city-sc', nome: "Orlando City", pais: 'US' },
  'new-york-red-bulls': { de: 'new-york-red-bulls', nome: "New York Red Bulls", pais: 'US' },
  'al-nassr': { de: 'al-nassr', nome: "Al-Nassr", pais: 'SA' },
  'al-hilal': { de: 'al-hilal', nome: "Al-Hilal", pais: 'SA' },
  'al-ahli-saudi': { de: 'al-ahli', nome: "Al-Ahli", pais: 'SA' },
  'kawasaki-frontale': { de: 'kawasaki-frontale', nome: "Kawasaki Frontale", pais: 'JP' },
  'tokyo-verdy': { de: 'tokyo-verdy', nome: "Tokyo Verdy", pais: 'JP' },
  'nagoya-grampus': { de: 'nagoya-grampus', nome: "Nagoya Grampus", pais: 'JP' },
}

/** Clubes que nenhuma fonte pública cobre: entram no catálogo com cores para o brasão de reserva. */
/**
 * Clubes em uso que os repositórios de escudo não cobrem. As `cores` desenham
 * o brasão de reserva quando não há arquivo.
 *
 * `wd` aponta o QID do clube no catálogo do Wikidata, e quando existe o escudo
 * real entra no lugar do brasão. É por QID e não por nome de propósito:
 * "Guangzhou Evergrande" casa por nome tanto com o Guangzhou FC (que é ele,
 * renomeado) quanto com o Guangzhou City (que é outro clube, o ex-R&F), e
 * escudo trocado é o pior erro possível neste jogo.
 */
export const SEM_ESCUDO = {
  'colo-colo': { nome: "Colo-Colo", pais: 'CL', cores: ['#FFFFFF', '#1A1A1A'], wd: 'Q207373' },
  'hercules': { nome: "Hércules", pais: 'ES', cores: ['#FFFFFF', '#0A3D91'], wd: 'Q11963' },
  'brescia': { nome: "Brescia", pais: 'IT', cores: ['#0A3D91', '#FFFFFF'], wd: 'Q6651' },
  'birmingham-city': { nome: "Birmingham City", pais: 'EN', cores: ['#0000FF', '#FFFFFF'], wd: 'Q19444' },
  'reading': { nome: "Reading", pais: 'EN', cores: ['#004494', '#FFFFFF'], wd: 'Q18729' },
  'sheffield-wednesday': { nome: "Sheffield Wednesday", pais: 'EN', cores: ['#0066B3', '#FFFFFF'], wd: 'Q19498' },
  'al-gharafa': { nome: "Al-Gharafa", pais: 'QA', cores: ['#1A1A1A', '#FFD700'], wd: 'Q428211' },
  'al-jazira': { nome: "Al-Jazira", pais: 'AE', cores: ['#F58220', '#FFFFFF'], wd: 'Q429630' },
  'shanghai-shenhua': { nome: "Shanghai Shenhua", pais: 'CN', cores: ['#0A3D91', '#FFFFFF'], wd: 'Q725367' },
  'shanghai-sipg': { nome: "Shanghai Port", pais: 'CN', cores: ['#E30613', '#1A1A1A'], wd: 'Q564216' },
  'shandong-luneng': { nome: "Shandong Taishan", pais: 'CN', cores: ['#F58220', '#1A1A1A'], wd: 'Q1046367' },
  'guangzhou-evergrande': { nome: "Guangzhou Evergrande", pais: 'CN', cores: ['#E30613', '#FFD700'], wd: 'Q130521' },

  /**
   * Clubes que o casamento por nome trocava por um homônimo — de outra época,
   * outro país ou só parecido. `tm` busca o escudo no Transfermarkt quando o
   * Wikidata não tem, ou tem o de outra fase do clube.
   *
   * - Yokohama Flügels (1964–1998): virava o Yokohama FC, fundado em 1998 pelos
   *   torcedores do Flügels. Zinho e César Sampaio.
   * - Miami FC de 2006: virava o Inter Miami, de 2018. Zinho. Fica com o brasão
   *   desenhado: o clube virou Fort Lauderdale Strikers, e é esse o escudo que
   *   as duas fontes mostram.
   * - Belenenses de 1991: virava o Belenenses SAD, de 2018. Mirandinha. O
   *   escudo é o da cruz, do clube; o do "B" é o da SAD.
   * - Campinas FC (1998): virava o Campinas de Mato Grosso. Careca.
   * - Atlético Dallas: virava o FC Dallas. Chicharito.
   * - Quick Boys, de Katwijk: virava o Sport Boys do Peru. Kuyt.
   * - Miami United: virava o United FC dos Emirados. Adriano.
   */
  'yokohama-flugels': { nome: "Yokohama Flügels", pais: 'JP', cores: ['#0A3D91', '#FFFFFF'], wd: 'Q1368488', tm: '26093' },
  'miami-fc-2006': { nome: "Miami FC", pais: 'US', cores: ['#0A3D91', '#FFFFFF'] },
  'os-belenenses': { nome: "Belenenses", pais: 'PT', cores: ['#0A3D91', '#FFFFFF'], wd: 'Q216510', tm: '68608' },
  'campinas-fc': { nome: "Campinas FC", pais: 'BR', cores: ['#E30613', '#FFFFFF'], wd: 'Q48855991', tm: '23002' },
  'atletico-dallas': { nome: "Atlético Dallas", pais: 'US', cores: ['#E30613', '#0A3D91'], wd: 'Q131384708' },
  'quick-boys': { nome: "Quick Boys", pais: 'NL', cores: ['#0A3D91', '#FFFFFF'], wd: 'Q2108810', tm: '7110' },
  'miami-united': { nome: "Miami United", pais: 'US', cores: ['#1A1A1A', '#FFFFFF'], wd: 'Q16844935', tm: '46181' },
}

/**
 * Duplicatas que a chave de deduplicação não pega, porque o football.db cola o
 * nome inteiro ("vascodagama") ou acrescenta o estado ("interrs") e o resultado
 * não bate com o id curto vindo do sprite brasileiro.
 */
export const DESCARTAR = ['interrs', 'santossp', 'vascodagama', 'sportrecife', 'atletico-pr', 'atleticomg', 'atleticogo', 'atleticopr', 'pontepreta', 'saopaulo']

/**
 * Pares id-do-clube-no-Transfermarkt -> clube do catálogo, conferidos à mão.
 * Vencem o que `npm run mapa-tm` tira do Wikidata.
 *
 * Existem para o clube cujo QID no catálogo não é dele (e por isso não dá par
 * nenhum) e para o clube que o Transfermarkt registra com um id que o
 * Wikidata não conhece. Cada um foi conferido pela passagem que o usa.
 */
export const PARES_TM = {
  // o QID do catálogo é o do time feminino (2015)
  398: 'lazio',
  // o QID do catálogo aponta um homônimo fundado em 2008
  449: 'trabzonspor',
  // "Willem II" terminava em "II" e caía no filtro de time reserva; Frenkie de Jong
  403: 'willem-ii',
  // o Al-Ahli de Dubai antes da fusão de 2017, que o Transfermarkt guarda com outro id; Everton Ribeiro
  15541: 'al-ahli-emirados-arabes-unidos',
  // Talleres de Remedios de Escalada, não o de Córdoba; Zanetti
  14519: 'club-atletico-talleres-remedios-de-escalada',
  // "Tigres UANL" tem uma palavra que o nosso "Tigres" não tem; Rafael Sobis e Enner Valencia
  7055: 'tigres',
  // o catálogo tem o Betis duas vezes, e o nome inteiro do Transfermarkt casava com a cópia
  150: 'real-betis',
  // os homônimos de SEM_ESCUDO
  26093: 'yokohama-flugels',
  9713: 'miami-fc-2006',
  68608: 'os-belenenses',
  23002: 'campinas-fc',
  130372: 'atletico-dallas',
  7110: 'quick-boys',
  46181: 'miami-united',
}
