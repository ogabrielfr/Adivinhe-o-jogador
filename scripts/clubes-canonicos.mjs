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
   * nome embaixo do escudo e dentro da dica de tempo de casa, então
   * "Hotspur" e "Goias" não servem.
   */
  'goias': { de: 'goias', nome: "Goiás", pais: 'BR' },
  'avai': { de: 'avai', nome: "Avaí", pais: 'BR' },
  'ceara': { de: 'ceara', nome: "Ceará", pais: 'BR' },
  'hotspur': { de: 'hotspur', nome: "Tottenham", pais: 'EN' },
  'unione-sportiva-catanzaro': { de: 'unione-sportiva-catanzaro', nome: "Catanzaro", pais: 'IT' },
  'crb': { de: 'crb', nome: "CRB", pais: 'BR' },
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

  /**
   * Primeiros clubes dos grandes nomes que o catálogo não tinha, com o escudo
   * do Transfermarkt: o Cannes do Zidane, o Al Mokawloon do Salah, o Delta
   * Warszawa e o Znicz do Lewandowski e o RS Futebol do Thiago Silva.
   */
  'as-cannes': { nome: "Cannes", pais: 'FR', cores: ['#E30613', '#FFFFFF'], tm: '895' },
  'al-mokawloon': { nome: "Al Mokawloon", pais: 'EG', cores: ['#FFD700', '#1A1A1A'], tm: '3369' },
  'delta-warszawa': { nome: "Delta Warszawa", pais: 'PL', cores: ['#0A3D91', '#FFFFFF'], tm: '30379' },
  'znicz-pruszkow': { nome: "Znicz Pruszków", pais: 'PL', cores: ['#E30613', '#FFFFFF'], tm: '9109' },
  'rs-futebol': { nome: "RS Futebol", pais: 'BR', cores: ['#0A3D91', '#E30613'], tm: '10495' },

  /**
   * O Cerro Porteño de Assunção, onde o Lugano jogou em 2015. O catálogo só
   * tinha o homônimo de Presidente Franco, e o casamento por nome caía nele.
   */
  'cerro-porteno': { nome: "Cerro Porteño", pais: 'PY', cores: ['#0A3D91', '#E30613'], tm: '1214' },
  // os clubes que entraram com os 90 de 28/09: o jogador de cada um vem ao lado
  'queens-park-rangers': { nome: "Queens Park Rangers", pais: 'EN', cores: ['#1D5BA4', '#FFFFFF'], tm: '1039' }, // Júlio César, Park Ji-sung, Rio Ferdinand
  'middlesbrough': { nome: "Middlesbrough", pais: 'EN', cores: ['#E11B22', '#FFFFFF'], tm: '641' }, // Juninho Paulista
  'sochaux': { nome: "Sochaux", pais: 'FR', cores: ['#FFD200', '#003A70'], tm: '750' }, // Miranda
  'fc-08-homburg': { nome: "Homburg", pais: 'DE', cores: ['#00843D', '#FFFFFF'], tm: '459' }, // Klose
  'sg-blaubach-diedelkopf': { nome: "Blaubach-Diedelkopf", pais: 'DE', cores: ['#1D4F91', '#FFFFFF'], tm: '1768' }, // Klose
  'salgueiros': { nome: "Salgueiros", pais: 'PT', cores: ['#C8102E', '#FFFFFF'], tm: '2434' }, // Deco
  'penafiel': { nome: "Penafiel", pais: 'PT', cores: ['#C8102E', '#1A1A1A'], tm: '3327' }, // Diego Costa
  'zrinjski-mostar': { nome: "Zrinjski Mostar", pais: 'BA', cores: ['#C8102E', '#FFFFFF'], tm: '6808' }, // Modrić
  'mauaense': { nome: "Mauaense", pais: 'BR', cores: ['#1D4F91', '#FFFFFF'], tm: '33115' }, // Willian
  'pstc': { nome: "PSTC", pais: 'BR', cores: ['#003A70', '#C8102E'], tm: '28488' }, // Fernandinho
  'audax': { nome: "Audax", pais: 'BR', cores: ['#F58220', '#1D4F91'], tm: '16083' }, // Paulinho, Viola
  'fc-vilnius': { nome: "FC Vilnius", pais: 'LT', cores: ['#1D4F91', '#FFFFFF'], tm: '8608' }, // Paulinho
  'ibis': { nome: "Íbis", pais: 'BR', cores: ['#1A1A1A', '#C8102E'], tm: '76157' }, // Denílson
  'miguelense': { nome: "Miguelense", pais: 'BR', cores: ['#1D4F91', '#FFFFFF'], tm: '81094' }, // Luiz Gustavo
  'corinthians-alagoano': { nome: "Corinthians Alagoano", pais: 'BR', cores: ['#1A1A1A', '#FFFFFF'], tm: '3266' }, // Luiz Gustavo
  'sona': { nome: "Sona", pais: 'IT', cores: ['#1D4F91', '#FFFFFF'], tm: '63520' }, // Maicon
  'tre-penne': { nome: "Tre Penne", pais: 'SM', cores: ['#1D4F91', '#FFFFFF'], tm: '10747' }, // Maicon
  'parana-clube': { nome: "Paraná Clube", pais: 'BR', cores: ['#003A70', '#C8102E'], tm: '309' }, // Luizão, Thiago Neves, Washington, Dodô
  'levallois': { nome: "Levallois", pais: 'FR', cores: ['#1D4F91', '#FFFFFF'], tm: '11132' }, // Drogba
  'guingamp': { nome: "Guingamp", pais: 'FR', cores: ['#C8102E', '#1A1A1A'], tm: '855' }, // Drogba
  'phoenix-rising': { nome: "Phoenix Rising", pais: 'US', cores: ['#E4002B', '#1A1A1A'], tm: '33414' }, // Drogba
  'boulogne': { nome: "Boulogne", pais: 'FR', cores: ['#C8102E', '#1A1A1A'], tm: '7042' }, // Ribéry
  'ales': { nome: "Olympique d'Alès", pais: 'FR', cores: ['#C8102E', '#1D4F91'], tm: '2618' }, // Ribéry
  'chemnitzer-fc': { nome: "Chemnitzer FC", pais: 'DE', cores: ['#6CACE4', '#FFFFFF'], tm: '21' }, // Ballack
  'beira-mar': { nome: "Beira-Mar", pais: 'PT', cores: ['#FFD200', '#1A1A1A'], tm: '1436' }, // Jardel
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
  // homônimos que travavam pelo nome na reposição de setembro: o catálogo tem
  // duas Sampdorias (a mesma imagem), um San Lorenzo paraguaio além do
  // argentino, e o Transfermarkt chama o Dínamo de "Dinamo De Kiev"
  1038: 'sampdoria',
  1775: 'san-lorenzo',
  338: 'dynamo-kyiv',
  1214: 'cerro-porteno',
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
  // o QID do Brasil de Pelotas no catálogo é o do CRB, e o id do CRB veio junto pela URL do escudo; Marcos Rocha
  11449: 'crb',
  // "Instituto ACC" é o Instituto Atlético Central Córdoba, e o nome inteiro contém o do Central Córdoba; Dybala
  1829: 'instituto',
  // o Transfermarkt guarda o nome de hoje; na época da passagem o clube era o nosso
  918: 'nk-inter-zapresic', // NK Inker; Lovren
  10948: 'guangzhou-evergrande', // Guangzhou FC; Robinho
  17276: 'hangzhou-greentown-football-club', // Zhejiang FC; Tim Cahill
  // os grandes nomes: abreviação que não casa ("Argentinos Jrs", "Rennes") e clube novo acima
  1030: 'argentinos-juniors', // Maradona e Riquelme
  273: 'rennais', // Raphinha
  95478: 'serrano-foot-ball-club', // o Serrano de Petrópolis; Garrincha
  895: 'as-cannes',
  3369: 'al-mokawloon',
  30379: 'delta-warszawa',
  9109: 'znicz-pruszkow',
  10495: 'rs-futebol',
  // os 90 de 28/09: abreviação que não casa ("K'lautern", "Js Suning") ou
  // nome inteiro que difere do nosso ("SER Caxias do Sul", "Nacional AC")
  2: 'kaiserslautern', // Klose, Ballack
  3: 'koln', // Podolski
  22219: 'jiangsu-football-club', // Ramires, Miranda, Jô
  3302: 'almeria', // UD Almería; Felipe Melo
  504: 'grasshopper-club-zurich', // Élber
  44: 'hertha-bsc', // Luizão
  22878: 'rio-branco-esporte-clube', // o de Americana; Luizão
  1963: 'clube-de-regatas-guara', // Lúcio
  1711: 'nacional-atletico-clube-sao-paulo', // Deco, Dodô
  98856: 'barcelona-esportivo-capela', // o de Ibiúna; Diego Costa
  9141: 'sociedade-esportiva-e-recreativa-caxias-do-sul', // Washington
  1770: 'campo-grande-atletico-clube', // o do Rio; Roberto Dinamite
  468: 'sparta-rotterdam', // Cássio
  5622: 'corporacion-club-deportivo-universidad-de-concepcion', // Valdivia
  5623: 'morelia', // Valdivia
  27414: 'olimpia-futebol-clube', // o de Olímpia (SP); Viola
  1164: 'le-mans-fc', // Drogba
  3911: 'stade-brestois-29', // Ribéry
  // os clubes novos de SEM_ESCUDO
  1039: 'queens-park-rangers',
  641: 'middlesbrough',
  750: 'sochaux',
  459: 'fc-08-homburg',
  1768: 'sg-blaubach-diedelkopf',
  2434: 'salgueiros',
  3327: 'penafiel',
  6808: 'zrinjski-mostar',
  33115: 'mauaense',
  28488: 'pstc',
  // o Grêmio Osasco Audax casava com o São Paulo e ficava sem par; agora está no catálogo
  16083: 'audax',
  8608: 'fc-vilnius',
  76157: 'ibis',
  81094: 'miguelense',
  3266: 'corinthians-alagoano',
  63520: 'sona',
  10747: 'tre-penne',
  309: 'parana-clube',
  11132: 'levallois',
  855: 'guingamp',
  33414: 'phoenix-rising',
  7042: 'boulogne',
  2618: 'ales',
  21: 'chemnitzer-fc',
  1436: 'beira-mar',
}

/**
 * Ids do Transfermarkt que não podem virar par com clube nenhum do catálogo:
 * o nome casava com um clube nosso, mas o Transfermarkt diz que é outro, e o
 * clube certo não está no catálogo.
 */
export const SEM_PAR_TM = new Set([
  // aries Toshima; o QID do FC Tokyo no catálogo é o do aries
  '36176',
  // SPG Lechtal, da Áustria; casava com o Francavilla, da Itália
  '26657',
])
