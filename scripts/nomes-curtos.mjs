/**
 * O nome que o torcedor fala, para o clube cujo nome oficial não cabe
 * embaixo do escudo.
 *
 * O nome aparece embaixo de cada escudo, a partida inteira, e na dica de
 * tempo de casa. "Associação Atlética Internacional (Limeira)"
 * quebrava em quatro linhas embaixo de um escudo de 80 pixels, e ninguém
 * chama o clube assim: é o Inter de Limeira.
 *
 * O catálogo continua com o nome inteiro, porque é ele que casa com o
 * Transfermarkt e o Wikidata; este mapa vale só para mostrar. A escolha segue
 * o nome curto do próprio Transfermarkt, em português quando o clube tem nome
 * consagrado aqui (Estrela Vermelha, Marselha), com o estado quando há
 * homônimo em uso (América-MG, América-RJ, América-RN) e com o nome da época
 * quando o clube mudou de nome depois (Guangzhou Evergrande).
 */
export const NOME_CURTO = {
  // Brasil
  'america-futebol-clube-rio-grande-do-norte': 'América-RN',
  'america-football-club-rio-de-janeiro': 'America-RJ',
  'america-futebol-clube-belo-horizonte': 'América-MG',
  'associacao-atletica-internacional-limeira': 'Inter de Limeira',
  'associacao-atletica-sao-bento-sao-paulo': 'AA São Bento',
  'esporte-clube-sao-bento': 'São Bento',
  'botafogo-futebol-clube-ribeirao-preto': 'Botafogo-SP',
  'atletico-rio-negro-clube-amazonas': 'Rio Negro-AM',
  'esporte-clube-xv-de-novembro-jau': 'XV de Jaú',
  'operario-ferroviario-esporte-clube': 'Operário-PR',
  'associacao-desportiva-cabofriense': 'Cabofriense',
  'associacao-desportiva-sao-caetano': 'São Caetano',
  'manchete-futebol-clube-do-recife': 'Manchete',
  'uniao-sao-joao-esporte-clube': 'União São João',
  'guaratingueta-futebol-ltda': 'Guaratinguetá',
  'sao-bernardo-futebol-clube': 'São Bernardo',
  'brasiliense-futebol-clube': 'Brasiliense',
  'club-athletico-paranaense': 'Athletico-PR',
  'esporte-clube-santo-andre': 'Santo André',
  'nova-iguacu-futebol-clube': 'Nova Iguaçu',
  'bonsucesso-futebol-clube': 'Bonsucesso',
  'esporte-clube-agua-santa': 'Água Santa',
  'sobradinho-esporte-clube': 'Sobradinho',
  'tupynambas-futebol-clube': 'Tupynambás',
  'uberlandia-esporte-clube': 'Uberlândia',
  'clube-atletico-juventus': 'Juventus-SP',
  'democrata-futebol-clube': 'Democrata-SL',
  'esporte-clube-juventude': 'Juventude',
  'fortaleza-esporte-clube': 'Fortaleza',
  'goianesia-esporte-clube': 'Goianésia',
  'itumbiara-esporte-clube': 'Itumbiara',
  'anapolis-futebol-clube': 'Anápolis',
  'batatais-futebol-clube': 'Batatais',
  'clube-atletico-mineiro': 'Atlético-MG',
  'esporte-clube-sao-jose': 'São José-RS',
  'sao-jose-esporte-clube': 'São José-SP',
  'guarani-futebol-clube': 'Guarani',
  'olaria-atletico-clube': 'Olaria',
  'bangu-atletico-clube': 'Bangu',
  'murici-futebol-clube': 'Murici',
  'sinop-futebol-clube': 'Sinop',
  'brasil-de-pelotas': 'Brasil de Pelotas',
  'serrano-foot-ball-club': 'Serrano',
  'abc': 'ABC',

  // Inglaterra e Escócia
  'bradford-city-association-football-club': 'Bradford City',
  'milton-keynes-dons-football-club': 'MK Dons',
  'preston-north-end-football-club': 'Preston',
  'blackburn-rovers-football-club': 'Blackburn',
  'bolton-wanderers-football-club': 'Bolton',
  'rotherham-united-football-club': 'Rotherham',
  'carlisle-united-football-club': 'Carlisle United',
  'darlington-football-club-1883': 'Darlington',
  'shrewsbury-town-football-club': 'Shrewsbury',
  'stocksbridge-park-steels-f-c': 'Stocksbridge',
  'tranmere-rovers-football-club': 'Tranmere',
  'fleetwood-town-football-club': 'Fleetwood',
  'alfreton-town-football-club': 'Alfreton Town',
  'burton-albion-football-club': 'Burton Albion',
  'leyton-orient-football-club': 'Leyton Orient',
  'oxford-united-football-club': 'Oxford United',
  'cardiff-city-football-club': 'Cardiff',
  'derby-county-football-club': 'Derby County',
  'football-club-halifax-town': 'Halifax Town',
  'swindon-town-football-club': 'Swindon Town',
  'stoke-city-football-club': 'Stoke City',
  'blackpool-football-club': 'Blackpool',
  'wolverhampton-wanderers': 'Wolverhampton',
  'barnsley-football-club': 'Barnsley',
  'millwall-football-club': 'Millwall',
  'rangers-football-club': 'Rangers',
  'celtic-football-club': 'Celtic',

  'portsmouth-football-club': 'Portsmouth',
  'swansea-city-association-football-club': 'Swansea',
  'west-bromwich-albion-football-club': 'West Brom',

  // resto da Europa
  'l-r-vicenza': 'Vicenza',
  'malaga': 'Málaga',
  'associazione-calcio-reggiana-1919': 'Reggiana',
  'associazione-calcio-mantova': 'Mantova',
  'associazione-calcio-cesena': 'Cesena',
  'palermo-football-club': 'Palermo',
  'siracusa-calcio-1924': 'Siracusa',
  'us-salernitana-1919': 'Salernitana',
  'u-s-livorno-1915': 'Livorno',
  'marseille': 'Marselha',
  'rennais': 'Rennes',
  'psg': 'PSG',
  'estrela-vermelha-de-belgrado': 'Estrela Vermelha',
  'fk-partizan-belgrade': 'Partizan',
  'fc-zenit-sao-petersburgo': 'Zenit',
  'fc-anji-makhachkala': 'Anzhi',
  'istanbul-buyuksehir-belediyespor': 'Başakşehir',
  'vestel-manisaspor': 'Manisaspor',
  'enosi-neon-ypsona-digenis-ipsona': 'Krasava ENY',
  'fc-twente-enschede': 'Twente',
  'olympiacos-piraeus': 'Olympiacos',
  'paok-thessaloniki': 'PAOK',
  'gnk-dinamo-zagreb': 'Dinamo Zagreb',
  'nk-inter-zapresic': 'Inter Zaprešić',
  'vit-guimaraes': 'Vitória de Guimarães',

  // Américas
  'club-atletico-talleres-remedios-de-escalada': 'Talleres de Escalada',
  'club-social-y-deportivo-dorados-de-sinaloa': 'Dorados',
  'club-deportivo-guadalajara': 'Chivas',
  'club-universidad-nacional': 'Pumas',
  'los-angeles-football-club': 'Los Angeles FC',
  'toros-neza-futbol-club': 'Toros Neza',
  // a fonte deu o nome em minúscula, igual ao id: o Junior de Barranquilla do
  // Garrincha, e os uruguaios e mexicanos de Suárez, Forlán, Cavani e Ronaldinho
  'junior': 'Atlético Junior',
  'penarol': 'Peñarol',
  'nacional': 'Nacional',
  'danubio': 'Danubio',
  'america': 'América do México',
  'queretaro': 'Querétaro',
  'tigres': 'Tigres',
  'toluca': 'Toluca',
  'emelec': 'Emelec',
  'millonarios': 'Millonarios',
  // os clubes que entraram com a reposição de setembro
  'club-alianza-lima': 'Alianza Lima',
  'club-deportivo-universidad-cesar-vallejo': 'César Vallejo',
  'club-plaza-colonia-de-deportes': 'Plaza Colonia',
  'liga-deportiva-universitaria-quito': 'LDU Quito',

  // Ásia, África e Oceania
  'adelaide-united-football-club': 'Adelaide United',
  'football-club-bunyodkor': 'Bunyodkor',
  'kabuscorp-sport-clube-do-palanca': 'Kabuscorp',
  'henan-songshan-longmen-football-club': 'Henan',
  'hangzhou-greentown-football-club': 'Hangzhou Greentown',
  'wuhan-three-towns-football-club': 'Wuhan Three Towns',
  'tianjin-tianhai-football-club': 'Tianjin Tianhai',
  'beijing-guoan-football-club': 'Beijing Guoan',
  'hebei-football-club': 'Hebei',
  'kerala-blaster-football-club': 'Kerala Blasters',
  'mumbai-city-football-club': 'Mumbai City',
  'chennaiyin-football-club': 'Chennaiyin',
  'western-sydney-wanderers-football-club': 'Western Sydney',
  'sydney-united-58-football-club': 'Sydney United',
  'melbourne-city-football-club': 'Melbourne City',
  'sydney-football-club': 'Sydney FC',
  // três Al-Ahli em uso: o saudita fica com o nome sozinho
  'al-ahli-emirados-arabes-unidos': 'Al-Ahli Dubai',
  'al-ahli-sports-club': 'Al-Ahli Doha',
  'al-nasr-sports-club': 'Al-Nasr Dubai',
  'al-wahda-sports-cultural-club': 'Al-Wahda',
  'al-rayyan-sports-club': 'Al-Rayyan',
  'al-wakrah-sports-club': 'Al-Wakrah',
  'al-arabi-sports-club': 'Al-Arabi',
  'al-khor-sports-club': 'Al-Khor',
  'al-sadd-sports-club': 'Al-Sadd',
  'qatar-sports-club': 'Qatar SC',
  'al-jaish-qatar': 'Al-Jaish',
  // o clube se chama Al-Duhail desde 2017, e é esse o escudo; Coutinho e Verratti jogaram depois
  'lekhwiya-sports-club': 'Al-Duhail',
}

/** O nome para mostrar: o curto quando existe, senão o do catálogo. */
export const nomeCurto = (id, nome) => NOME_CURTO[id] ?? nome
