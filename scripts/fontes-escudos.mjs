/**
 * De onde vem o escudo de cada clube.
 *
 * O resolvedor tenta casar o nome do clube automaticamente contra o índice de
 * cada repositório. Este mapa cobre os casos em que o nome do arquivo não
 * lembra o nome pelo qual o clube é conhecido no Brasil.
 *
 *   br: <id do símbolo no sprite de escudos brasileiros>
 *   eu: <caminho dentro de logos/ ou history/ do repositório europeu>
 *   fc: <federação/pasta do clube no FCLOGO>
 *   db: <caminho no football.db.logos>
 */
export const FONTES = {
  // --- repositórios de origem
  REPOS: {
    br: 'https://github.com/hugomiura/escudos-times-brasil-svg.git',
    eu: 'https://github.com/luukhopman/football-logos.git',
    fc: 'https://github.com/FCLOGO/fclogo.top.git',
    db: 'https://github.com/sportlogos/football.db.logos.git',
  },

  // --- nomes alternativos usados só para o casamento automático
  ALIASES: {
    'milan': 'AC Milan',
    'inter': 'Inter Milan',
    'psg': 'Paris Saint-Germain',
    'bayern': 'Bayern Munich',
    'bayer-leverkusen': 'Bayer 04 Leverkusen',
    'werder-bremen': 'Werder Bremen',
    'hamburgo': 'Hamburger SV',
    'schalke': 'Schalke 04',
    'hoffenheim': 'TSG Hoffenheim',
    'wolfsburg': 'VfL Wolfsburg',
    'marseille': 'Olympique Marseille',
    'lyon': 'Olympique Lyon',
    'monaco': 'AS Monaco',
    'bordeaux': 'Girondins Bordeaux',
    'nice': 'OGC Nice',
    'real-madrid': 'Real Madrid',
    'barcelona': 'FC Barcelona',
    'atletico-madrid': 'Atletico de Madrid',
    'real-betis': 'Real Betis Balompie',
    'espanyol': 'RCD Espanyol Barcelona',
    'valencia': 'Valencia CF',
    'villarreal': 'Villarreal CF',
    'hercules': 'Hercules CF',
    'tottenham': 'Tottenham Hotspur',
    'manchester-city': 'Manchester City',
    'manchester-united': 'Manchester United',
    'arsenal': 'Arsenal FC',
    'chelsea': 'Chelsea FC',
    'liverpool': 'Liverpool FC',
    'everton': 'Everton FC',
    'aston-villa': 'Aston Villa',
    'sunderland': 'Sunderland AFC',
    'birmingham-city': 'Birmingham City',
    'nottingham-forest': 'Nottingham Forest',
    'sheffield-wednesday': 'Sheffield Wednesday',
    'reading': 'Reading FC',
    'porto': 'FC Porto',
    'benfica': 'SL Benfica',
    'sporting-cp': 'Sporting CP',
    'vitoria-guimaraes': 'Vitoria Guimaraes',
    'ajax': 'Ajax Amsterdam',
    'psv': 'PSV Eindhoven',
    'feyenoord': 'Feyenoord Rotterdam',
    'galatasaray': 'Galatasaray',
    'fenerbahce': 'Fenerbahce',
    'besiktas': 'Besiktas',
    'kayserispor': 'Kayserispor',
    'basel': 'FC Basel',
    'olympiacos': 'Olympiacos Piraeus',
    'shakhtar': 'Shakhtar Donetsk',
    'zenit': 'Zenit St. Petersburg',
    'cska-moscow': 'CSKA Moscow',
    'lokomotiv-moscow': 'Lokomotiv Moscow',
    'rosenborg': 'Rosenborg BK',
    'copenhagen': 'FC Copenhagen',
    'juventus': 'Juventus FC',
    'roma': 'AS Roma',
    'fiorentina': 'ACF Fiorentina',
    'parma': 'Parma Calcio',
    'brescia': 'Brescia Calcio',
    'monza': 'AC Monza',
  },

  // --- clubes cujo caminho é fixado à mão (o casamento automático erra ou não acha)
  FIXOS: {
    // brasileiros: ids do sprite SVG
    'flamengo': 'br:flamengo',
    'palmeiras': 'br:palmeiras',
    'corinthians': 'br:corinthians',
    'sao-paulo': 'br:sao-paulo',
    'santos': 'br:santos',
    'vasco': 'br:vasco',
    'fluminense': 'br:fluminense',
    'botafogo': 'br:botafogo',
    'gremio': 'br:gremio',
    'internacional': 'br:internacional',
    'cruzeiro': 'br:cruzeiro',
    'atletico-mg': 'br:atletico-mg',
    'athletico-pr': 'br:atletico-pr',
    'coritiba': 'br:coritiba',
    'bahia': 'br:bahia',
    'sport': 'br:sport',
    'vitoria': 'br:vitoria',
    'figueirense': 'br:figueirense',
    'portuguesa': 'db:south-america/br-brazil/portuguesa.gif',

    // sul-americanos
    'boca-juniors': 'db:south-america/ar-argentina/bocajuniors.png',
    'velez-sarsfield': 'db:south-america/ar-argentina/velez.gif',

    // europeus fora das divisões cobertas pela temporada atual
    'bordeaux': 'eu:history/2021-22/France - Ligue 1/G. Bordeaux.png',

    // MLS
    'inter-miami': 'fc:USSF/clubs/013_Inter Miami CF',
    'la-galaxy': 'fc:USSF/clubs/011_LA Galaxy',
    'orlando-city': 'fc:USSF/clubs/020_Orlando City SC',
    'new-york-red-bulls': 'fc:USSF/clubs/019_New York Red Bulls',

    // Golfo
    'al-nassr': 'fc:SAFF/clubs/11-Al-Nassr',
    'al-hilal': 'fc:SAFF/clubs/06-Al Hilal',
    'al-ahli-saudi': 'fc:SAFF/clubs/01-Al-Ahli',

    // Japão
    'kawasaki-frontale': 'fc:JFA/clubs/003_Kawasaki Frontale',
    'tokyo-verdy': 'fc:JFA/clubs/012_Tokyo Verdy',
    'nagoya-grampus': 'fc:JFA/clubs/013_Nagoya Grampus',
  },
}
