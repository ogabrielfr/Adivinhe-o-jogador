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
  // a atualização de novembro de 2026: o David Silva voltou a jogar, em Hong Kong (cores do escudo do Transfermarkt)
  'sha-tin': { nome: "Sha Tin", pais: 'HK', cores: ['#806040', '#FFFFC0'], tm: '34344' }, // David Silva
  /**
   * A ampliação para 900 jogadores (novembro de 2026): clubes das carreiras novas
   * que o catálogo não tinha. Nome e país do Transfermarkt, escudo do
   * Transfermarkt, cores tiradas do escudo. O jogador de cada um vem ao lado.
   */
  '1-fc-nuremberg': { nome: "Nuremberg", pais: 'DE', cores: ['#A02040', '#FFFFFF'], tm: '4' }, // Eric Maxim Choupo-Moting, Cacau, İlkay Gündoğan
  '1-fc-saarbrucken': { nome: "Saarbrücken", pais: 'DE', cores: ['#FFE000', '#202020'], tm: '1' }, // Andreas Brehme
  'aa-iguacu': { nome: "AA Iguaçu", pais: 'BR', cores: ['#FFFFFF', '#FFC000'], tm: '22781' }, // Neto Baiano
  'aa-portuguesa': { nome: "Portuguesa-RJ", pais: 'BR', cores: ['#FFFFFF', '#80C0A0'], tm: '52517' }, // Vavá
  'aas-sarcelles': { nome: "AAS Sarcelles", pais: 'FR', cores: ['#204080', '#8080C0'], tm: '73865' }, // Riyad Mahrez
  'ac-arles': { nome: "AC Arles", pais: 'FR', cores: ['#FFE020', '#2060A0'], tm: '11300' }, // André Ayew
  'ac-bellinzona': { nome: "AC Bellinzona", pais: 'CH', cores: ['#FFFFFF', '#802020'], tm: '2047' }, // Matuzalém
  'ac-semassi-fc': { nome: "AC Semassi FC", pais: 'TG', cores: ['#FFFFFF', '#E02020'], tm: '45757' }, // Emmanuel Adebayor
  'academica-de-coimbra': { nome: "Académica de Coimbra", pais: 'PT', cores: ['#000000', '#C0C0C0'], tm: '2990' }, // Cédric Soares
  'ad-nueve-de-octubre': { nome: "AD Nueve de Octubre", pais: 'EC', cores: ['#FFE020', '#004020'], tm: '19101' }, // Jairzinho
  'ae-aracatuba': { nome: "AE Araçatuba", pais: 'BR', cores: ['#FFC000', '#204080'], tm: '9480' }, // Magno Alves
  'ae-canedense': { nome: "AE Canedense", pais: 'BR', cores: ['#FFFFFF', '#FF0000'], tm: '26938' }, // Túlio Maravilha
  'agovv-apeldoorn': { nome: "AGOVV Apeldoorn", pais: 'NL', cores: ['#0060A0', '#FFFFFF'], tm: '1389' }, // Dries Mertens, Klaas-Jan Huntelaar
  'al-bidda-sc': { nome: "Al-Bidda SC", pais: 'QA', cores: ['#FFFFFF', '#000000'], tm: '69892' }, // Javi Martínez
  'al-ittifaq-fc': { nome: "Al-Ittifaq FC", pais: 'AE', cores: ['#000000', '#FFE000'], tm: '93797' }, // Douglas Costa, Mario Balotelli
  'al-ula-fc': { nome: "Al-Ula FC", pais: 'SA', cores: ['#402020', '#206080'], tm: '107818' }, // Danilo Barbosa da Silva
  'amiens-sc': { nome: "Amiens SC", pais: 'FR', cores: ['#FFFFFF', '#000000'], tm: '1416' }, // Paulo Henrique Ganso, Danilo Fernando Avelar
  'aparecida-ec': { nome: "Aparecida EC", pais: 'BR', cores: ['#006000', '#408040'], tm: '21842' }, // Carlos Gilberto Nascimento Silva, Túlio Maravilha
  'apollon-petalidiou': { nome: "Apollon Petalidiou", pais: 'GR', cores: ['#000000', '#A0A0A0'], tm: '50067' }, // Sokratis Papastathopoulos
  'as-aix-en-provence': { nome: "AS Aix-en-Provence", pais: 'FR', cores: ['#606060', '#A0A0A0'], tm: '3528' }, // Paulo Cézar Lima
  'as-arta-solar7': { nome: "AS Arta/Solar7", pais: 'DJ', cores: ['#FFFFFF', '#4060C0'], tm: '84230' }, // Salomon Kalou
  'as-excelsior': { nome: "AS Excelsior", pais: 'FR', cores: ['#E06020', '#000000'], tm: '11265' }, // Dimitri Payet
  'as-trencin': { nome: "AS Trencin", pais: 'SK', cores: ['#C00020', '#FFFFFF'], tm: '7918' }, // Wesley Moraes
  'asec-mimosas': { nome: "ASEC Mimosas", pais: 'CI', cores: ['#000000', '#FFFF20'], tm: '3891' }, // Yaya Touré, Kolo Touré, Salomon Kalou
  'atk': { nome: "ATK", pais: 'IN', cores: ['#FFFFFF', '#C0A040'], tm: '45278' }, // Hélder Postiga, Robbie Keane
  'barcelona-ba': { nome: "Barcelona-BA", pais: 'BR', cores: ['#C00040', '#FFFFFF'], tm: '93588' }, // Magno Alves
  'barmbek-u': { nome: "Barmbek-Uhlenhorst", pais: 'DE', cores: ['#FFE000', '#4040A0'], tm: '1481' }, // Andreas Brehme
  'barranquilla-fc': { nome: "Barranquilla FC", pais: 'CO', cores: ['#FFFFFF', '#FFE000'], tm: '18127' }, // Luis Díaz, Freddy Rincón
  'barueri': { nome: "Barueri", pais: 'BR', cores: ['#FFFFFF', '#FFE040'], tm: '8698' }, // Marcelinho Paraíba, Marcos Assunção, Leandro Castán, Willian José, Paulo Roberto Jamelli Júnior, Alexandre da Silva Mariano
  'boavista-sc': { nome: "Boavista-RJ", pais: 'BR', cores: ['#FFFFFF', '#00A000'], tm: '11266' }, // Carlos Alberto, Reinaldo, Luiz Alberto da Silva Oliveira, Jucilei, Juan Maldonado Jaimez Júnior, Tartá
  'boca-raton-fc': { nome: "Boca Raton FC", pais: 'US', cores: ['#202020', '#FFFFFF'], tm: '53946' }, // Amoroso
  'botafogo-df': { nome: "Botafogo-DF", pais: 'BR', cores: ['#202020', '#FFFF00'], tm: '25294' }, // Sérgio Manoel
  'ca-cerro': { nome: "CA Cerro", pais: 'UY', cores: ['#FFFFFF', '#00A0E0'], tm: '14806' }, // Diego Godín
  'ca-fenix': { nome: "CA Fénix", pais: 'UY', cores: ['#FFFFFF', '#602060'], tm: '3829' }, // Agustín Canobbio
  'ca-juventud': { nome: "CA Juventud", pais: 'UY', cores: ['#FFFFFF', '#004080'], tm: '17428' }, // Martín Cáceres
  'ca-linense': { nome: "CA Linense", pais: 'BR', cores: ['#E02020', '#FFFFFF'], tm: '20132' }, // William de Oliveira Pottker, Leivinha
  'ca-patronato': { nome: "CA Patronato", pais: 'AR', cores: ['#000000', '#C00000'], tm: '19806' }, // Lucas Barrios
  'cd-aves': { nome: "CD Aves", pais: 'PT', cores: ['#C0A020', '#C02020'], tm: '3336' }, // Raul Meireles
  'cd-fatima': { nome: "CD Fátima", pais: 'PT', cores: ['#A04040', '#FFFFFF'], tm: '6987' }, // Nélson Semedo
  'cf-gloria-bistrita': { nome: "CF Gloria Bistrita", pais: 'RO', cores: ['#FFFFFF', '#C0C0E0'], tm: '4688' }, // Aluísio Chaves Ribeiro Moraes Júnior
  'chievo-verona': { nome: "Chievo Verona", pais: 'IT', cores: ['#FFFF00', '#0060FF'], tm: '862' }, // Douglas Costa, Lucas Piazón, Leandro Paredes, Andrea Barzagli, Kerlon Moura Souza, César Luis Prates
  'club-san-luis-1957': { nome: "Club San Luis", pais: 'MX', cores: ['#FFFFFF', '#E0A020'], tm: '11693' }, // Sebastián Abreu
  'cn-marcilio-dias': { nome: "CN Marcílio Dias", pais: 'BR', cores: ['#FFFFFF', '#C0C0E0'], tm: '4759' }, // Leandro Damião, Renan Brito Soares, Rodrigo Pimpão
  'comunicaciones-fc': { nome: "Comunicaciones FC", pais: 'GT', cores: ['#204080', '#60A0E0'], tm: '9709' }, // Tita
  'corinthians-pr': { nome: "Corinthians-PR", pais: 'BR', cores: ['#A0A0A0', '#E0E0E0'], tm: '11738' }, // Jucilei, Adriano Gabiru
  'coton-sport-fc': { nome: "Coton Sport FC", pais: 'CM', cores: ['#E0E0A0', '#FFFFFF'], tm: '4675' }, // Vincent Aboubakar
  'cr-belouizdad': { nome: "CR Belouizdad", pais: 'DZ', cores: ['#FFFFFF', '#E02020'], tm: '13365' }, // Islam Slimani
  'cr-porongos-fc': { nome: "CR Porongos FC", pais: 'UY', cores: ['#FFFFFF', '#002060'], tm: '99722' }, // Diego Godín
  'dallas-texans': { nome: "Dallas Texans", pais: 'US', cores: ['#000000', '#FFFFFF'], tm: '9068' }, // Clint Dempsey
  'delfines-del-carmen': { nome: "Delfines del Carmen", pais: 'MX', cores: ['#FFFFFF', '#204080'], tm: '38387' }, // Apodi
  'deportes-temuco': { nome: "Deportes Temuco", pais: 'CL', cores: ['#406040', '#000000'], tm: '13554' }, // Lucas Barrios
  'deportivo-galicia': { nome: "Deportivo Galicia", pais: 'VE', cores: ['#FFFFFF', '#808080'], tm: '22917' }, // Brito
  'desportivo-brasil': { nome: "Desportivo Brasil", pais: 'BR', cores: ['#C02020', '#FFFFFF'], tm: '17300' }, // Éderson José dos Santos Lourenço da Silva, Maurício, Gustavo Scarpa, Douglas Pereira dos Santos, Ilsinho, Alan Douglas Borges de Carvalho
  'dijon-fco': { nome: "Dijon FCO", pais: 'FR', cores: ['#E00020', '#E04060'], tm: '2969' }, // Pierre-Emerick Aubameyang, Yoann Gourcuff
  'dubai-csc': { nome: "Dubai CSC", pais: 'AE', cores: ['#C0A020', '#000020'], tm: '9710' }, // Márcio Rodrigues
  'dulwich-hamlet': { nome: "Dulwich Hamlet", pais: 'EN', cores: ['#E080C0', '#A060A0'], tm: '6169' }, // Peter Crouch
  'ec-atletico-carioca': { nome: "EC Atlético Carioca", pais: 'BR', cores: ['#000000', '#FFFFFF'], tm: '93608' }, // Túlio Maravilha, Jucilei
  'ec-guarani': { nome: "Guarani-RS", pais: 'BR', cores: ['#E02020', '#202020'], tm: '35653' }, // Edenilson
  'ec-pocoes': { nome: "EC Poções", pais: 'BR', cores: ['#FFFFFF', '#A0A0C0'], tm: '26244' }, // Liedson
  'ec-tupy': { nome: "EC Tupy", pais: 'BR', cores: ['#008040', '#E0E040'], tm: '75852' }, // Túlio Maravilha
  'eendracht-aalst': { nome: "Eendracht Aalst", pais: 'BE', cores: ['#FFFFFF', '#A0A0A0'], tm: '1111' }, // Dries Mertens
  'esbjerg-fb': { nome: "Esbjerg fB", pais: 'DK', cores: ['#FFFFFF', '#C0A040'], tm: '3426' }, // Martin Braithwaite, Rafael van der Vaart
  'excelsior-virton': { nome: "Excelsior Virton", pais: 'BE', cores: ['#E02020', '#FFFFFF'], tm: '1199' }, // Thomas Meunier
  'extremadura-ud': { nome: "Extremadura UD", pais: 'ES', cores: ['#FFFFFF', '#202060'], tm: '29095' }, // José Antonio Reyes
  'farroupilha': { nome: "Farroupilha", pais: 'BR', cores: ['#E02020', '#00A020'], tm: '21604' }, // Arílson
  'farul-constanta': { nome: "Farul Constanta", pais: 'RO', cores: ['#FFFFFF', '#2060A0'], tm: '5267' }, // Gheorghe Hagi
  'fc-barreirense': { nome: "FC Barreirense", pais: 'PT', cores: ['#C04020', '#FFFFFF'], tm: '5707' }, // Nelinho
  'fc-chiasso': { nome: "FC Chiasso", pais: 'CH', cores: ['#FFFFFF', '#0060A0'], tm: '510' }, // Mazzola, Gianluca Zambrotta
  'fc-differdange-03': { nome: "FC Differdange 03", pais: 'LU', cores: ['#000000', '#FF0000'], tm: '11914' }, // Florent Malouda
  'fc-jurong': { nome: "FC Jurong", pais: 'SG', cores: ['#E06020', '#002080'], tm: '23472' }, // Keisuke Honda
  'fc-mendrisiostar': { nome: "FC Mendrisiostar", pais: 'CH', cores: ['#FFFFFF', '#E02020'], tm: '60600' }, // Mazzola
  'fc-oberneuland': { nome: "FC Oberneuland", pais: 'DE', cores: ['#FFFFFF', '#A02020'], tm: '115' }, // Aílton Gonçalves da Silva
  'fc-pyunik-erewan': { nome: "FC Pyunik Erewan", pais: 'AM', cores: ['#404080', '#FFFFFF'], tm: '10301' }, // Henrik Mkhitarian
  'fc-santa-coloma': { nome: "FC Santa Coloma", pais: 'AD', cores: ['#FFFFFF', '#A0A0A0'], tm: '10854' }, // Joan Capdevila
  'fc-st-lucia': { nome: "FC St. Lucia", pais: 'MT', cores: ['#FFFFFF', '#002080'], tm: '37653' }, // Mathieu Valbuena
  'fc-vss-kosice': { nome: "FC VSS Kosice", pais: 'SK', cores: ['#002040', '#FFFFFF'], tm: '779' }, // Nemanja Matić
  'fc-wil-1900': { nome: "FC Wil 1900", pais: 'CH', cores: ['#000000', '#0080C0'], tm: '850' }, // André Santos
  'fk-chmel-blsany': { nome: "FK Chmel Blsany", pais: 'CZ', cores: ['#0080C0', '#FFC000'], tm: '135' }, // Petr Čech
  'fk-vigantice': { nome: "FK Vigantice", pais: 'CZ', cores: ['#0080FF', '#FFFFFF'], tm: '89174' }, // Milan Baroš
  'floridsdorfer-ac': { nome: "Floridsdorfer AC", pais: 'AT', cores: ['#FFFFFF', '#6080C0'], tm: '7443' }, // Marko Arnautović
  'fluminense-ba': { nome: "Fluminense-BA", pais: 'BR', cores: ['#A02020', '#FFFFFF'], tm: '25116' }, // Jorge Wagner
  'furman-paladins': { nome: "Furman Paladins", pais: 'US', cores: ['#402080', '#FFFFFF'], tm: '9745' }, // Clint Dempsey
  'ga-farroupilha': { nome: "GA Farroupilha", pais: 'BR', cores: ['#FFFFFF', '#C0C0C0'], tm: '38786' }, // Palhinha
  'gandzasar-kapan': { nome: "Gandzasar Kapan", pais: 'AM', cores: ['#000000', '#A0C0A0'], tm: '23911' }, // William de Oliveira Pottker
  'gd-sao-carlense': { nome: "GD São-Carlense", pais: 'BR', cores: ['#FFFFFF', '#002060'], tm: '76417' }, // Giovanni Silva de Oliveira
  'gd-sou-tigers': { nome: "Guangdong Tigers", pais: 'CN', cores: ['#E02020', '#FFC0A0'], tm: '38865' }, // Muriqui
  'ge-gloria': { nome: "GE Glória", pais: 'BR', cores: ['#FFFFFF', '#00C0FF'], tm: '13064' }, // Arílson
  'gremio-catanduvense': { nome: "Grêmio Catanduvense", pais: 'BR', cores: ['#FFFFFF', '#0040A0'], tm: '21730' }, // Alexandre da Silva Mariano, Luan Vieira
  'gremio-maringa': { nome: "Grêmio Maringá", pais: 'BR', cores: ['#FFFFFF', '#000000'], tm: '29236' }, // Anderson Cléber Beraldo
  'gremio-novorizontino': { nome: "Grêmio Novorizontino", pais: 'BR', cores: ['#202020', '#FFE000'], tm: '37474' }, // Márcio Roberto dos Santos, Paulo Sérgio Silvestre Nascimento, Magno Alves, Richarlyson
  'grenoble-foot-38': { nome: "Grenoble Foot 38", pais: 'FR', cores: ['#0040A0', '#FFFFFF'], tm: '1290' }, // Olivier Giroud, Youri Djorkaeff
  'guarani-ec': { nome: "Guarani-MG", pais: 'BR', cores: ['#E02020', '#FFFFFF'], tm: '22331' }, // Fábio Júnior Pereira
  'h-zehlendorf': { nome: "Hertha Zehlendorf", pais: 'DE', cores: ['#FFFFFF', '#A0C0E0'], tm: '2943' }, // Niko Kovač
  'harborough-town': { nome: "Harborough Town", pais: 'EN', cores: ['#202020', '#FFFF00'], tm: '87938' }, // Sandro Ranieri Guimarães Cordeiro
  'hassia-bingen': { nome: "Hassia Bingen", pais: 'DE', cores: ['#E02020', '#000000'], tm: '994' }, // Aílton Gonçalves da Silva
  'hogaborgs-bk': { nome: "Högaborgs BK", pais: 'SE', cores: ['#208060', '#FFFFFF'], tm: '2011' }, // Henrik Larsson
  'hurstpierpoint-fc': { nome: "Hurstpierpoint FC", pais: 'EN', cores: ['#A0A0A0', '#FFFFFF'], tm: '127899' }, // Gareth Barry
  'iape-fc': { nome: "IAPE FC", pais: 'BR', cores: ['#000040', '#C0C000'], tm: '87160' }, // Márcio Rodrigues Araújo
  'ifk-gotemburgo': { nome: "IFK Gotemburgo", pais: 'SE', cores: ['#FFFFFF', '#2040A0'], tm: '801' }, // Marek Hamšík
  'ifk-hassleholm': { nome: "IFK Hässleholm", pais: 'SE', cores: ['#000000', '#FFE020'], tm: '2005' }, // Peter Crouch
  'imbituba-fc': { nome: "Imbituba FC", pais: 'BR', cores: ['#0080A0', '#FFC000'], tm: '27423' }, // Joubert Araújo Martins
  'indep-santa-fe': { nome: "Santa Fe", pais: 'CO', cores: ['#FFFFFF', '#E02020'], tm: '11648' }, // Yerry Mina, Freddy Rincón, Arílson
  'independente-fc': { nome: "Independente-SP", pais: 'BR', cores: ['#FFFFFF', '#202020'], tm: '34153' }, // Magno Alves
  'ipatinga-fc': { nome: "Ipatinga FC", pais: 'BR', cores: ['#FFFFFF', '#408080'], tm: '3270' }, // Müller, Jonatas Cristian de Jesus, Mariano Ferreira Filho, Palhinha, Neto Baiano
  'iperzola': { nome: "Iperzola", pais: 'IT', cores: ['#FFFFFF', '#2040A0'], tm: '25376' }, // Antonio Di Natale
  'iraty-sc': { nome: "Iraty SC", pais: 'BR', cores: ['#FFFFFF', '#004060'], tm: '12583' }, // Wendell Nascimento Borges, Alex Silva, Brandão, Elton Rodrigues Brandão
  'istres-football-club': { nome: "Istres Football Club", pais: 'FR', cores: ['#FFFFFF', '#000000'], tm: '2580' }, // Olivier Giroud, Leandro Câmara do Amaral
  'jmg-academy-abidjan': { nome: "JMG Academy Abidjan", pais: 'CI', cores: ['#0080C0', '#FFFFFF'], tm: '21667' }, // Kolo Touré, Gervinho
  'js-saint-pierroise': { nome: "JS Saint-Pierroise", pais: 'FR', cores: ['#FFFFFF', '#C0C0C0'], tm: '20375' }, // Djibril Cissé
  'js-suresnes': { nome: "JS Suresnes", pais: 'FR', cores: ['#2040A0', '#FFFF00'], tm: '79569' }, // N'Golo Kanté
  'jsm-cheraga': { nome: "JSM Chéraga", pais: 'DZ', cores: ['#FFFFFF', '#FF6060'], tm: '30543' }, // Islam Slimani
  'jupie-bb': { nome: "Jupie BB", pais: 'SK', cores: ['#FFFFFF', '#000040'], tm: '23107' }, // Marek Hamšík
  'kfc-uerdingen-05': { nome: "KFC Uerdingen 05", pais: 'DE', cores: ['#E00020', '#FFFFFF'], tm: '95' }, // Aílton Gonçalves da Silva
  'kickers-offenbach': { nome: "Kickers Offenbach", pais: 'DE', cores: ['#FFFFFF', '#E02020'], tm: '107' }, // Rudi Völler
  'kisvarda-fc': { nome: "Kisvárda FC", pais: 'HU', cores: ['#FFFFFF', '#E02020'], tm: '30613' }, // Wellington Nem
  'ks-stradom': { nome: "KS Stradom", pais: 'PL', cores: ['#A02020', '#FFFFC0'], tm: '9530' }, // Q151025
  'ksc-lokeren': { nome: "KSC Lokeren", pais: 'BE', cores: ['#A0A0A0', '#FFFFFF'], tm: '7773' }, // Radja Nainggolan
  'ksk-beveren': { nome: "KSK Beveren", pais: 'BE', cores: ['#0060A0', '#FFFF00'], tm: '1073' }, // Yaya Touré, Gervinho
  'ksv-roeselare': { nome: "KSV Roeselare", pais: 'BE', cores: ['#000000', '#FFFFFF'], tm: '2977' }, // Ivan Perišić
  'kuban-krasnodar': { nome: "Kuban Krasnodar", pais: 'RU', cores: ['#FFFFFF', '#A08000'], tm: '2439' }, // Felipe Augusto Santana, Djibril Cissé, Apodi
  'langon-castets': { nome: "Langon-Castets", pais: 'FR', cores: ['#E04040', '#204080'], tm: '26625' }, // Mathieu Valbuena
  'lb-chateauroux': { nome: "LB Châteauroux", pais: 'FR', cores: ['#FFFFFF', '#E00020'], tm: '1175' }, // Florent Malouda
  'leca-fc': { nome: "Leça FC", pais: 'PT', cores: ['#E0C000', '#FFFFFF'], tm: '3267' }, // Ricardo Carvalho
  'legia-de-varsovia': { nome: "Legia de Varsóvia", pais: 'PL', cores: ['#FFFFFF', '#00A060'], tm: '255' }, // Eduardo da Silva, Łukasz Fabiański, Roger Guerreiro, Elton Rodrigues Brandão
  'legon-cities-fc': { nome: "Legon Cities FC", pais: 'GH', cores: ['#000000', '#FFA020'], tm: '18743' }, // Asamoah Gyan
  'liberty-prof': { nome: "Liberty Prof.", pais: 'GH', cores: ['#FFFFFF', '#C0C0C0'], tm: '13607' }, // Asamoah Gyan, Michael Essien
  'libourne-fa': { nome: "Libourne FA", pais: 'FR', cores: ['#2040A0', '#C0C0E0'], tm: '2968' }, // Mathieu Valbuena
  'lierse-sk': { nome: "Lierse SK", pais: 'BE', cores: ['#000000', '#FFE000'], tm: '204' }, // Joan Capdevila
  'lobos-buap': { nome: "Lobos BUAP", pais: 'MX', cores: ['#FFFFFF', '#000000'], tm: '13357' }, // Luis Advíncula
  'lubuszanin-drezdenko': { nome: "Lubuszanin Drezdenko", pais: 'PL', cores: ['#C02020', '#2080C0'], tm: '31260' }, // Łukasz Fabiański
  'luceafarul-buc': { nome: "Luceafărul Buc", pais: 'RO', cores: ['#FFFFFF', '#6080A0'], tm: '86707' }, // Gheorghe Hagi
  'lusail-sc': { nome: "Lusail SC", pais: 'QA', cores: ['#004080', '#FFFFFF'], tm: '77101' }, // Rodrigo Moreno Machado
  'lyn-1896-fk': { nome: "Lyn 1896 FK", pais: 'NO', cores: ['#002080', '#FFE040'], tm: '175' }, // Mikel John Obi
  'lyon-la-duchere': { nome: "Lyon - La Duchère", pais: 'FR', cores: ['#C00020', '#FFE000'], tm: '17768' }, // Éric Abidal
  'maidstone-united': { nome: "Maidstone United", pais: 'EN', cores: ['#202020', '#806020'], tm: '7047' }, // Chris Smalling
  'manado-united': { nome: "Manado United", pais: 'ID', cores: ['#002060', '#0060A0'], tm: '31440' }, // Alexandre da Silva Mariano
  'marsala-1912': { nome: "Marsala 1912", pais: 'IT', cores: ['#0080E0', '#E0A000'], tm: '4555' }, // Patrice Evra, Marco Materazzi
  'miami-dade-fc': { nome: "Miami Dade FC", pais: 'US', cores: ['#004080', '#FFE000'], tm: '46373' }, // Kerlon Moura Souza, Gabriel Rodrigues dos Santos
  'mieszko-gniezno': { nome: "Mieszko Gniezno", pais: 'PL', cores: ['#FFFFFF', '#0060A0'], tm: '8362' }, // Łukasz Fabiański
  'minas-boca-mg': { nome: "Minas Boca-MG", pais: 'BR', cores: ['#FFE000', '#FF0000'], tm: '39855' }, // Fábio Júnior Pereira
  'msp-szamotuly': { nome: "MSP Szamotuly", pais: 'PL', cores: ['#FFFFFF', '#E02020'], tm: '2593' }, // Łukasz Fabiański
  'msv-duisburg': { nome: "MSV Duisburg", pais: 'DE', cores: ['#202060', '#8080A0'], tm: '52' }, // Roque Júnior, Aílton Gonçalves da Silva
  'nacional-ec': { nome: "Nacional-MG", pais: 'BR', cores: ['#000000', '#FFFFFF'], tm: '32405' }, // Lucas Silva, Kerlon Moura Souza
  'nj-imperials': { nome: "NJ Imperials", pais: 'US', cores: ['#604040', '#A0A0A0'], tm: '81293' }, // Tim Howard
  'nk-domzale': { nome: "NK Domzale", pais: 'SI', cores: ['#FFFF00', '#0040A0'], tm: '6248' }, // Samir Handanovič
  'nk-olimpija': { nome: "NK Olimpija", pais: 'SI', cores: ['#FFFFFF', '#006040'], tm: '4772' }, // Jan Oblak
  'nk-zagreb': { nome: "NK Zagreb", pais: 'HR', cores: ['#E02020', '#FFFFFF'], tm: '5107' }, // Ivica Olić, Mario Mandžukić
  'novi-pazar-mar': { nome: "Novi Pazar Marathon", pais: 'DE', cores: ['#000060', '#FFFFFF'], tm: '16120' }, // Ronny Heberson Furtado de Araújo
  'odra-wodzislaw': { nome: "Odra Wodzislaw", pais: 'PL', cores: ['#0060A0', '#FFC040'], tm: '1305' }, // Rodrigo Moledo
  'olhanense': { nome: "Olhanense", pais: 'PT', cores: ['#000000', '#C02020'], tm: '4750' }, // Luiz Marcelo Morais dos Reis
  'olimpia-de-minas': { nome: "Olimpia de Minas", pais: 'UY', cores: ['#1A1A1A', '#FFFFFF'], tm: '91885' }, // Sebastián Abreu
  'oc-blue-star': { nome: "OC Blue Star", pais: 'US', cores: ['#202060', '#A0A020'], tm: '16893' }, // Jürgen Klinsmann
  'pa-classics': { nome: "PA Classics", pais: 'US', cores: ['#FFFFFF', '#C0C0C0'], tm: '45065' }, // Christian Pulisic
  'palm-beach-stars': { nome: "Palm Beach Stars", pais: 'US', cores: ['#FFFFFF', '#202020'], tm: '85690' }, // Keirrison
  'pao-chicago': { nome: "PAO Chicago", pais: 'US', cores: ['#FFFFFF', '#008040'], tm: '89752' }, // Djibril Cissé
  'paro-fc': { nome: "Paro FC", pais: 'BT', cores: ['#404040', '#E0A000'], tm: '71982' }, // Keisuke Honda
  'patro-eisden': { nome: "Patro Eisden", pais: 'BE', cores: ['#402060', '#FFFFFF'], tm: '3225' }, // Radja Nainggolan
  'pfc-cajazeiras': { nome: "PFC Cajazeiras", pais: 'BR', cores: ['#000000', '#FFFFFF'], tm: '88140' }, // Danilo dos Santos de Oliveira
  'plateau-united-jos': { nome: "Plateau United FC", pais: 'NG', cores: ['#A0E060', '#FFFF00'], tm: '5069' }, // Mikel John Obi
  'prs-futebol-clube': { nome: "PRS Futebol Clube", pais: 'BR', cores: ['#0040A0', '#FFC000'], tm: '72208' }, // Roger Ibañez da Silva
  'quimper-fc': { nome: "Quimper FC", pais: 'FR', cores: ['#0080C0', '#FFFFFF'], tm: '23375' }, // Riyad Mahrez
  'ras-al-khaima': { nome: "Ras Al-Khaima", pais: 'AE', cores: ['#FFFFFF', '#C0C0C0'], tm: '54535' }, // Palhinha
  'recreativo-de-huelva': { nome: "Recreativo de Huelva", pais: 'ES', cores: ['#FFFFFF', '#FFC000'], tm: '2867' }, // Martín Cáceres, Antonio Valencia, Santi Cazorla
  'remont-cacak': { nome: "Remont Cacak", pais: 'RS', cores: ['#0040FF', '#E0E0FF'], tm: '4662' }, // Branislav Ivanović
  'ribeirao-1968-fc': { nome: "Ribeirão 1968 FC", pais: 'PT', cores: ['#FFFFFF', '#204080'], tm: '6144' }, // Ederson Moraes
  'rio-branco-sc': { nome: "Rio Branco SC", pais: 'BR', cores: ['#FF0000', '#FFFFFF'], tm: '22785' }, // Roger Guerreiro
  'rondinella': { nome: "Rondinella", pais: 'IT', cores: ['#E00020', '#000000'], tm: '4569' }, // Andrea Barzagli
  'rot-weiss-ahlen': { nome: "Rot Weiss Ahlen", pais: 'DE', cores: ['#FFFFFF', '#C00020'], tm: '50' }, // Marco Reus
  'royal-antuerpia-fc': { nome: "Royal Antuérpia FC", pais: 'BE', cores: ['#FFFFFF', '#000000'], tm: '1096' }, // Toby Alderweireld, Radja Nainggolan
  'rozwoj-katowice': { nome: "Rozwój Katowice", pais: 'PL', cores: ['#FFFFFF', '#000000'], tm: '11843' }, // Arkadiusz Milik
  'san-diego-sockers': { nome: "San Diego Sockers", pais: 'US', cores: ['#002040', '#A0A080'], tm: '78017' }, // Landon Donovan
  'san-diego-toros': { nome: "San Diego Toros", pais: 'US', cores: ['#FFFFFF', '#002080'], tm: '77361' }, // Vavá
  'santa-tecla-fc': { nome: "Santa Tecla FC", pais: 'SV', cores: ['#FFFFFF', '#FF0000'], tm: '37712' }, // Sebastián Abreu
  'sao-cristovao-fr': { nome: "São Cristóvão FR", pais: 'BR', cores: ['#000000', '#FFFFFF'], tm: '15281' }, // Jonas Eduardo Américo
  'sao-luiz-al': { nome: "São Luiz-AL", pais: 'BR', cores: ['#E0E0E0', '#A0A0A0'], tm: '25441' }, // Arílson
  'sc-bastia': { nome: "SC Bastia", pais: 'FR', cores: ['#0060E0', '#C0C0C0'], tm: '595' }, // Michael Essien, Brandão, Djibril Cissé, Apodi
  'sc-ulbra-ji-parana': { nome: "SC Ulbra Ji-Paraná", pais: 'BR', cores: ['#FFFFFF', '#C08080'], tm: '81418' }, // Argélico Fuchs
  'sc-uniao-torreense': { nome: "SC União Torreense", pais: 'PT', cores: ['#A08060', '#602020'], tm: '2432' }, // Fernando Marçal Oliveira
  'shaanxi-wuzhou': { nome: "Shaanxi Wuzhou", pais: 'CN', cores: ['#20A0E0', '#80E080'], tm: '24566' }, // Reinaldo
  'skf-sered': { nome: "SKF Sered", pais: 'SK', cores: ['#FFFFFF', '#E00020'], tm: '31297' }, // Álvaro Pereira
  'sliema-wanderers': { nome: "Sliema Wanderers", pais: 'MT', cores: ['#0080E0', '#004080'], tm: '329' }, // Denílson Pereira Neves, Kerlon Moura Souza
  'slovan-bratislava': { nome: "Slovan Bratislava", pais: 'SK', cores: ['#FFFFFF', '#E02020'], tm: '540' }, // Marek Hamšík
  'sm-caen': { nome: "SM Caen", pais: 'FR', cores: ['#204060', '#FFFFFF'], tm: '1162' }, // Raphaël Guerreiro, N'Golo Kanté, William Gallas
  'societa-calcio-leffe': { nome: "Società Calcio Leffe", pais: 'IT', cores: ['#FFFFFF', '#2060FF'], tm: '25265' }, // Filippo Inzaghi
  'sparta-brodnica': { nome: "Sparta Brodnica", pais: 'PL', cores: ['#FFE000', '#000000'], tm: '8640' }, // Łukasz Fabiański
  'spartak-trnava': { nome: "Spartak Trnava", pais: 'SK', cores: ['#000000', '#C00000'], tm: '365' }, // Kerlon Moura Souza
  'sr-saint-die': { nome: "SR Saint-Dié", pais: 'FR', cores: ['#E04020', '#FFFFFF'], tm: '25638' }, // Kalidou Koulibaly
  'ss-murata': { nome: "SS Murata", pais: 'SM', cores: ['#000000', '#606060'], tm: '10611' }, // Aldair Santos do Nascimento
  'steaua-bucuresti': { nome: "Steaua București", pais: 'RO', cores: ['#000080', '#FF0000'], tm: '139720' }, // Gheorghe Hagi
  'stella-club-adjame': { nome: "Stella Club", pais: 'CI', cores: ['#80C060', '#FFFFFF'], tm: '9369' }, // Franck Kessié (o nome casava com o Stella brasileiro)
  'stk-1914-samorin': { nome: "STK 1914 Samorin", pais: 'SK', cores: ['#FFFFFF', '#0080C0'], tm: '34775' }, // Francisco Evanilson de Lima Barbosa
  'stuttgarter-kickers': { nome: "Stuttgarter Kickers", pais: 'DE', cores: ['#FFFFFF', '#00A0E0'], tm: '71' }, // Jürgen Klinsmann
  'su-sintrense': { nome: "SU Sintrense", pais: 'PT', cores: ['#808080', '#FFFFFF'], tm: '1992' }, // Nélson Semedo
  'suduva': { nome: "Suduva", pais: 'LT', cores: ['#FF0000', '#FFFFFF'], tm: '8047' }, // Keisuke Honda
  'suwon-bluewings': { nome: "Suwon Bluewings", pais: 'KR', cores: ['#FFFFFF', '#0060A0'], tm: '3301' }, // Reinaldo, Rodrigo Pimpão, Roger Silva
  'sv-nord-wedding-1893': { nome: "SV Nord Wedding 1893", pais: 'DE', cores: ['#2000C0', '#FFFF60'], tm: '182' }, // Niko Kovač
  'sv-turk-gucu-munchen': { nome: "SV Türk Gücü München", pais: 'DE', cores: ['#FFFFFF', '#FF0000'], tm: '5110' }, // Cacau
  'thonon-evian': { nome: "Thonon Évian", pais: 'FR', cores: ['#202040', '#FFFFFF'], tm: '14171' }, // Túlio de Melo, Cláudio Caçapa
  'tiro-federal-r': { nome: "Tiro Federal R", pais: 'AR', cores: ['#FFFFFF', '#2080A0'], tm: '9645' }, // Lucas Barrios
  'toronto-blizzard': { nome: "Toronto Blizzard", pais: 'CA', cores: ['#C02040', '#002060'], tm: '10451' }, // Edino Nazareth Filho
  'toronto-italia-fc': { nome: "Toronto Italia FC", pais: 'CA', cores: ['#1A1A1A', '#FFFFFF'], tm: '85290' }, // Mazzola
  'tours-fc': { nome: "Tours FC", pais: 'FR', cores: ['#FFFFFF', '#808080'], tm: '3161' }, // Olivier Giroud, Medhi Benatia
  'tsv-1860-munique': { nome: "TSV 1860 Munique", pais: 'DE', cores: ['#002020', '#FFFFFF'], tm: '72' }, // Ivica Olić, Rudi Völler
  'tsv-marl-huls': { nome: "TSV Marl-Hüls", pais: 'DE', cores: ['#0040C0', '#FFFFFF'], tm: '6524' }, // Mineiro
  'tus-koblenz': { nome: "TuS Koblenz", pais: 'DE', cores: ['#204080', '#E04020'], tm: '996' }, // Mineiro
  'ud-leiria': { nome: "UD Leiria", pais: 'PT', cores: ['#FFFFFF', '#E00000'], tm: '2639' }, // Ronny Heberson Furtado de Araújo, Helton, Jan Oblak
  'ud-salamanca': { nome: "UD Salamanca", pais: 'ES', cores: ['#FFFFFF', '#E0A080'], tm: '1087' }, // Carlos Vela
  'udv-alegre': { nome: "UDV Alegre", pais: 'ES', cores: ['#FFFFFF', '#FF0000'], tm: '76811' }, // André Onana
  'ue-tarrega': { nome: "UE Tarrega", pais: 'ES', cores: ['#FFFFFF', '#000000'], tm: '21267' }, // Joan Capdevila
  'ujpest-fc': { nome: "Újpest FC", pais: 'HU', cores: ['#FFFFFF', '#C0C0A0'], tm: '708' }, // Túlio Maravilha
  'uniao-mogi-fc': { nome: "União Mogi FC", pais: 'BR', cores: ['#E00000', '#E06060'], tm: '21468' }, // Felipe Augusto de Almeida Monteiro, Gilberto Ribeiro Gonçalves
  'urt-mg': { nome: "URT-MG", pais: 'BR', cores: ['#FFFFFF', '#202060'], tm: '13687' }, // Alexandre da Silva Mariano, Rodrigo Pereira Possebon
  'us-fiorenzuola-1922': { nome: "US Fiorenzuola 1922", pais: 'IT', cores: ['#E02020', '#000000'], tm: '4163' }, // Luca Toni
  'usd-tor-di-quinto': { nome: "USD Tor di Quinto", pais: 'IT', cores: ['#FFFFFF', '#000020'], tm: '10707' }, // Marco Materazzi
  'valenciennes-fc': { nome: "Valenciennes FC", pais: 'FR', cores: ['#E02020', '#FFFFFF'], tm: '1423' }, // Carlos Gilberto Nascimento Silva, Vincent Aboubakar
  'valur-reykjavik': { nome: "Valur Reykjavík", pais: 'IS', cores: ['#E02020', '#004080'], tm: '1033' }, // Gylfi Sigurðsson
  'vbv-de-graafschap': { nome: "VBV De Graafschap", pais: 'NL', cores: ['#0080C0', '#FFFFFF'], tm: '642' }, // Klaas-Jan Huntelaar, Luuk de Jong
  'viagem-usti-n-l': { nome: "Ústí nad Labem", pais: 'CZ', cores: ['#FFFFFF', '#000040'], tm: '6377' }, // Edin Džeko
  'vikingur-reykjavik': { nome: "Víkingur Reykjavík", pais: 'IS', cores: ['#FFFFFF', '#E06020'], tm: '5849' }, // Gylfi Sigurðsson
  'vila-real-fc': { nome: "Vila Real FC", pais: 'BR', cores: ['#FFFFFF', '#E04040'], tm: '132224' }, // Fernando Henrique dos Anjos
  'vitoria-fc': { nome: "Vitória FC", pais: 'PT', cores: ['#E0E000', '#C0E0C0'], tm: '1085' }, // Ricardo Carvalho, Paulo Ferreira, Luis Advíncula
  'vv-noordwijk': { nome: "VV Noordwijk", pais: 'NL', cores: ['#FF4040', '#FFFFFF'], tm: '7474' }, // Edwin van der Sar
  'vv-st-truiden': { nome: "Sint-Truiden", pais: 'BE', cores: ['#FFE020', '#0060C0'], tm: '475' }, // Shinji Okazaki, Shinji Kagawa, Daichi Kamada, Takehiro Tomiyasu, Wataru Endō
  'vvv-venlo': { nome: "VVV-Venlo", pais: 'NL', cores: ['#000000', '#FFE000'], tm: '1426' }, // Vampeta, Keisuke Honda
  'west-bengal': { nome: "West Bengal", pais: 'IN', cores: ['#E0E0E0', '#808080'], tm: '35262' }, // Fabio Cannavaro
  'wythenshawe-fc': { nome: "Wythenshawe FC", pais: 'EN', cores: ['#C08040', '#C0C0C0'], tm: '87438' }, // Antonio Valencia
  'xj-t-leopard': { nome: "Xinjiang Tianshan", pais: 'CN', cores: ['#FFFFFF', '#8080A0'], tm: '36879' }, // José Antonio Reyes
  'zeljeznicar': { nome: "Zeljeznicar", pais: 'BA', cores: ['#E0E0E0', '#004080'], tm: '2573' }, // Edin Džeko
  'zeljeznicar-sb': { nome: "Zeljeznicar SB", pais: 'HR', cores: ['#FFFFFF', '#8020A0'], tm: '27246' }, // Mario Mandžukić
}

/**
 * Escudo guardado no próprio repositório, em `scripts/escudos-fixos/`, que
 * vence o de qualquer fonte. Serve para o clube que mudou de escudo e cujas
 * fontes ainda têm o antigo: o repositório de escudos brasileiros dá o do
 * Palmeiras sem a estrela vermelha em cima, e o atual — o da Wikipédia, do
 * Wikimedia Commons — tem.
 */
export const ESCUDO_ARQUIVO = {
  palmeiras: 'palmeiras.png',
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
  34344: 'sha-tin',
  // a ampliação para 900: clubes que o catálogo tinha e o nome não alcançava (o jogador vem ao lado)
  // o Lyon resolvia pelo nome, e o Lyon - La Duchère do Abidal deixou o nome ambíguo
  1041: 'olympique-lyon',
  24: 'eintracht-frankfurt', // Mario Götze, Lucas Piazón, Kevin-Prince Boateng, Daichi Kamada, Luka Jović, Kevin Trapp
  369: 'lyngby-boldklub', // Gylfi Sigurðsson
  626: 'new-england-revolution', // Clint Dempsey
  646: 'tampa-bay-mutiny', // Carlos Valderrama
  798: 'excelsior-rotterdam', // Michel Bastos, Salomon Kalou
  1044: 'djurgardens-if', // Teddy Sheringham
  1465: 'gd-estoril-praia', // Bruno César, Paulo Ferreira, Luiz Marcelo Morais dos Reis
  3280: 'associacao-desportiva-confianca', // Joubert Araújo Martins
  3364: 'esporte-clube-democrata', // Brito
  7477: 'club-sportivo-miramar-misiones', // Álvaro Pereira
  10560: 'brasil-de-pelotas', // Denílson Pereira Neves, Fabiano Eller
  11960: 'uniao-bandeirante-futebol-clube', // Brandão, Fábio
  15169: 'clube-atletico-do-porto', // Rômulo Borges Monteiro
  23565: 'tampa-bay-rowdies', // Joe Cole
  25224: 'votoraty-futebol-clube', // Alex Roberto Santana Rafael
  27413: 'goytacaz-futebol-clube', // Amarildo
  27785: 'itaperuna-esporte-clube', // Serginho
  35946: 'sao-goncalo-esporte-clube', // Luiz Alberto da Silva Oliveira
  40195: 'esporte-clube-sao-bernardo', // Luís Pereira
  51663: 'atlanta-united', // Breel Embolo
  57520: 'generation-adidas', // Tim Howard
  114309: 'wimbledon-football-club', // Peter Shilton
  // os clubes novos de SEM_ESCUDO da ampliação
  9369: 'stella-club-adjame',
  4: '1-fc-nuremberg',
  1: '1-fc-saarbrucken',
  22781: 'aa-iguacu',
  52517: 'aa-portuguesa',
  73865: 'aas-sarcelles',
  11300: 'ac-arles',
  2047: 'ac-bellinzona',
  45757: 'ac-semassi-fc',
  2990: 'academica-de-coimbra',
  19101: 'ad-nueve-de-octubre',
  9480: 'ae-aracatuba',
  26938: 'ae-canedense',
  1389: 'agovv-apeldoorn',
  69892: 'al-bidda-sc',
  93797: 'al-ittifaq-fc',
  107818: 'al-ula-fc',
  1416: 'amiens-sc',
  21842: 'aparecida-ec',
  50067: 'apollon-petalidiou',
  3528: 'as-aix-en-provence',
  84230: 'as-arta-solar7',
  11265: 'as-excelsior',
  7918: 'as-trencin',
  3891: 'asec-mimosas',
  45278: 'atk',
  93588: 'barcelona-ba',
  1481: 'barmbek-u',
  18127: 'barranquilla-fc',
  8698: 'barueri',
  11266: 'boavista-sc',
  53946: 'boca-raton-fc',
  25294: 'botafogo-df',
  14806: 'ca-cerro',
  3829: 'ca-fenix',
  17428: 'ca-juventud',
  20132: 'ca-linense',
  19806: 'ca-patronato',
  3336: 'cd-aves',
  6987: 'cd-fatima',
  4688: 'cf-gloria-bistrita',
  862: 'chievo-verona',
  11693: 'club-san-luis-1957',
  4759: 'cn-marcilio-dias',
  9709: 'comunicaciones-fc',
  11738: 'corinthians-pr',
  4675: 'coton-sport-fc',
  13365: 'cr-belouizdad',
  99722: 'cr-porongos-fc',
  9068: 'dallas-texans',
  38387: 'delfines-del-carmen',
  13554: 'deportes-temuco',
  22917: 'deportivo-galicia',
  17300: 'desportivo-brasil',
  2969: 'dijon-fco',
  9710: 'dubai-csc',
  6169: 'dulwich-hamlet',
  93608: 'ec-atletico-carioca',
  35653: 'ec-guarani',
  26244: 'ec-pocoes',
  75852: 'ec-tupy',
  1111: 'eendracht-aalst',
  3426: 'esbjerg-fb',
  1199: 'excelsior-virton',
  29095: 'extremadura-ud',
  21604: 'farroupilha',
  5267: 'farul-constanta',
  5707: 'fc-barreirense',
  510: 'fc-chiasso',
  11914: 'fc-differdange-03',
  23472: 'fc-jurong',
  60600: 'fc-mendrisiostar',
  115: 'fc-oberneuland',
  10301: 'fc-pyunik-erewan',
  10854: 'fc-santa-coloma',
  37653: 'fc-st-lucia',
  779: 'fc-vss-kosice',
  850: 'fc-wil-1900',
  135: 'fk-chmel-blsany',
  89174: 'fk-vigantice',
  7443: 'floridsdorfer-ac',
  25116: 'fluminense-ba',
  9745: 'furman-paladins',
  38786: 'ga-farroupilha',
  23911: 'gandzasar-kapan',
  76417: 'gd-sao-carlense',
  38865: 'gd-sou-tigers',
  13064: 'ge-gloria',
  21730: 'gremio-catanduvense',
  29236: 'gremio-maringa',
  37474: 'gremio-novorizontino',
  1290: 'grenoble-foot-38',
  22331: 'guarani-ec',
  2943: 'h-zehlendorf',
  87938: 'harborough-town',
  994: 'hassia-bingen',
  2011: 'hogaborgs-bk',
  127899: 'hurstpierpoint-fc',
  87160: 'iape-fc',
  801: 'ifk-gotemburgo',
  2005: 'ifk-hassleholm',
  27423: 'imbituba-fc',
  11648: 'indep-santa-fe',
  34153: 'independente-fc',
  3270: 'ipatinga-fc',
  25376: 'iperzola',
  12583: 'iraty-sc',
  2580: 'istres-football-club',
  21667: 'jmg-academy-abidjan',
  20375: 'js-saint-pierroise',
  79569: 'js-suresnes',
  30543: 'jsm-cheraga',
  23107: 'jupie-bb',
  95: 'kfc-uerdingen-05',
  107: 'kickers-offenbach',
  30613: 'kisvarda-fc',
  9530: 'ks-stradom',
  7773: 'ksc-lokeren',
  1073: 'ksk-beveren',
  2977: 'ksv-roeselare',
  2439: 'kuban-krasnodar',
  26625: 'langon-castets',
  1175: 'lb-chateauroux',
  3267: 'leca-fc',
  255: 'legia-de-varsovia',
  18743: 'legon-cities-fc',
  13607: 'liberty-prof',
  2968: 'libourne-fa',
  204: 'lierse-sk',
  13357: 'lobos-buap',
  31260: 'lubuszanin-drezdenko',
  86707: 'luceafarul-buc',
  77101: 'lusail-sc',
  175: 'lyn-1896-fk',
  17768: 'lyon-la-duchere',
  7047: 'maidstone-united',
  31440: 'manado-united',
  4555: 'marsala-1912',
  46373: 'miami-dade-fc',
  8362: 'mieszko-gniezno',
  39855: 'minas-boca-mg',
  2593: 'msp-szamotuly',
  52: 'msv-duisburg',
  32405: 'nacional-ec',
  81293: 'nj-imperials',
  6248: 'nk-domzale',
  4772: 'nk-olimpija',
  5107: 'nk-zagreb',
  16120: 'novi-pazar-mar',
  1305: 'odra-wodzislaw',
  4750: 'olhanense',
  91885: 'olimpia-de-minas',
  16893: 'oc-blue-star',
  45065: 'pa-classics',
  85690: 'palm-beach-stars',
  89752: 'pao-chicago',
  71982: 'paro-fc',
  3225: 'patro-eisden',
  88140: 'pfc-cajazeiras',
  5069: 'plateau-united-jos',
  72208: 'prs-futebol-clube',
  23375: 'quimper-fc',
  54535: 'ras-al-khaima',
  2867: 'recreativo-de-huelva',
  4662: 'remont-cacak',
  6144: 'ribeirao-1968-fc',
  22785: 'rio-branco-sc',
  4569: 'rondinella',
  50: 'rot-weiss-ahlen',
  1096: 'royal-antuerpia-fc',
  11843: 'rozwoj-katowice',
  78017: 'san-diego-sockers',
  77361: 'san-diego-toros',
  37712: 'santa-tecla-fc',
  15281: 'sao-cristovao-fr',
  25441: 'sao-luiz-al',
  595: 'sc-bastia',
  81418: 'sc-ulbra-ji-parana',
  2432: 'sc-uniao-torreense',
  24566: 'shaanxi-wuzhou',
  31297: 'skf-sered',
  329: 'sliema-wanderers',
  540: 'slovan-bratislava',
  1162: 'sm-caen',
  25265: 'societa-calcio-leffe',
  8640: 'sparta-brodnica',
  365: 'spartak-trnava',
  25638: 'sr-saint-die',
  10611: 'ss-murata',
  139720: 'steaua-bucuresti',
  34775: 'stk-1914-samorin',
  71: 'stuttgarter-kickers',
  1992: 'su-sintrense',
  8047: 'suduva',
  3301: 'suwon-bluewings',
  182: 'sv-nord-wedding-1893',
  5110: 'sv-turk-gucu-munchen',
  14171: 'thonon-evian',
  9645: 'tiro-federal-r',
  10451: 'toronto-blizzard',
  85290: 'toronto-italia-fc',
  3161: 'tours-fc',
  72: 'tsv-1860-munique',
  6524: 'tsv-marl-huls',
  996: 'tus-koblenz',
  2639: 'ud-leiria',
  1087: 'ud-salamanca',
  76811: 'udv-alegre',
  21267: 'ue-tarrega',
  708: 'ujpest-fc',
  21468: 'uniao-mogi-fc',
  13687: 'urt-mg',
  4163: 'us-fiorenzuola-1922',
  10707: 'usd-tor-di-quinto',
  1423: 'valenciennes-fc',
  1033: 'valur-reykjavik',
  642: 'vbv-de-graafschap',
  6377: 'viagem-usti-n-l',
  5849: 'vikingur-reykjavik',
  132224: 'vila-real-fc',
  1085: 'vitoria-fc',
  7474: 'vv-noordwijk',
  475: 'vv-st-truiden',
  1426: 'vvv-venlo',
  35262: 'west-bengal',
  87438: 'wythenshawe-fc',
  36879: 'xj-t-leopard',
  2573: 'zeljeznicar',
  27246: 'zeljeznicar-sb',
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
