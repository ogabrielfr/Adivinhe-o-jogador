import type { Clube } from './tipos'

/**
 * Catálogo de clubes. O `id` vira o nome do arquivo em public/escudos.
 * `cores` só aparece quando não existe escudo real para o clube — nesse caso
 * o jogo desenha um brasão de reserva com as cores e as iniciais.
 */
export const CLUBES: Clube[] = [
  // ---------------------------------------------------------------- Brasil
  { id: 'flamengo', nome: 'Flamengo', pais: 'BR', cores: ['#C52613', '#1A1A1A'] },
  { id: 'palmeiras', nome: 'Palmeiras', pais: 'BR', cores: ['#026733', '#FFFFFF'] },
  { id: 'corinthians', nome: 'Corinthians', pais: 'BR', cores: ['#1A1A1A', '#FFFFFF'] },
  { id: 'sao-paulo', nome: 'São Paulo', pais: 'BR', cores: ['#FE0000', '#FFFFFF'] },
  { id: 'santos', nome: 'Santos', pais: 'BR', cores: ['#1A1A1A', '#FFFFFF'] },
  { id: 'vasco', nome: 'Vasco da Gama', pais: 'BR', cores: ['#1A1A1A', '#FFFFFF'] },
  { id: 'fluminense', nome: 'Fluminense', pais: 'BR', cores: ['#870A28', '#0A5C36'] },
  { id: 'botafogo', nome: 'Botafogo', pais: 'BR', cores: ['#1A1A1A', '#FFFFFF'] },
  { id: 'gremio', nome: 'Grêmio', pais: 'BR', cores: ['#0D80BF', '#1A1A1A'] },
  { id: 'internacional', nome: 'Internacional', pais: 'BR', cores: ['#E5050F', '#FFFFFF'] },
  { id: 'cruzeiro', nome: 'Cruzeiro', pais: 'BR', cores: ['#2F529F', '#FFFFFF'] },
  { id: 'atletico-mg', nome: 'Atlético Mineiro', pais: 'BR', cores: ['#1A1A1A', '#FFFFFF'] },
  { id: 'athletico-pr', nome: 'Athletico Paranaense', pais: 'BR', cores: ['#E30613', '#1A1A1A'] },
  { id: 'coritiba', nome: 'Coritiba', pais: 'BR', cores: ['#005C36', '#FFFFFF'] },
  { id: 'bahia', nome: 'Bahia', pais: 'BR', cores: ['#0D5EAF', '#E30613'] },
  { id: 'sport', nome: 'Sport Recife', pais: 'BR', cores: ['#E30613', '#1A1A1A'] },
  { id: 'vitoria', nome: 'Vitória', pais: 'BR', cores: ['#E30613', '#1A1A1A'] },
  { id: 'figueirense', nome: 'Figueirense', pais: 'BR', cores: ['#1A1A1A', '#FFFFFF'] },
  { id: 'portuguesa', nome: 'Portuguesa', pais: 'BR', cores: ['#0D5EAF', '#E30613'] },

  // ------------------------------------------------------------- Argentina
  { id: 'boca-juniors', nome: 'Boca Juniors', pais: 'AR', cores: ['#0A4B8C', '#F2C300'] },
  { id: 'velez-sarsfield', nome: 'Vélez Sarsfield', pais: 'AR', cores: ['#FFFFFF', '#0A4B8C'] },

  // ----------------------------------------------------------------- Chile
  { id: 'colo-colo', nome: 'Colo-Colo', pais: 'CL', cores: ['#FFFFFF', '#1A1A1A'] },

  // --------------------------------------------------------------- Espanha
  { id: 'barcelona', nome: 'Barcelona', pais: 'ES', cores: ['#A50044', '#004D98'] },
  { id: 'real-madrid', nome: 'Real Madrid', pais: 'ES', cores: ['#FFFFFF', '#FEBE10'] },
  { id: 'atletico-madrid', nome: 'Atlético de Madrid', pais: 'ES', cores: ['#CB3524', '#FFFFFF'] },
  { id: 'valencia', nome: 'Valencia', pais: 'ES', cores: ['#FFFFFF', '#F18E00'] },
  { id: 'villarreal', nome: 'Villarreal', pais: 'ES', cores: ['#FFE667', '#005187'] },
  { id: 'real-betis', nome: 'Real Betis', pais: 'ES', cores: ['#00954C', '#FFFFFF'] },
  { id: 'espanyol', nome: 'Espanyol', pais: 'ES', cores: ['#0072C6', '#FFFFFF'] },
  { id: 'hercules', nome: 'Hércules', pais: 'ES', cores: ['#FFFFFF', '#0A3D91'] },

  // ---------------------------------------------------------------- Itália
  { id: 'milan', nome: 'Milan', pais: 'IT', cores: ['#FB090B', '#1A1A1A'] },
  { id: 'inter', nome: 'Inter de Milão', pais: 'IT', cores: ['#0068A8', '#1A1A1A'] },
  { id: 'juventus', nome: 'Juventus', pais: 'IT', cores: ['#1A1A1A', '#FFFFFF'] },
  { id: 'roma', nome: 'Roma', pais: 'IT', cores: ['#8E1F2F', '#F0BC42'] },
  { id: 'fiorentina', nome: 'Fiorentina', pais: 'IT', cores: ['#592C82', '#FFFFFF'] },
  { id: 'parma', nome: 'Parma', pais: 'IT', cores: ['#FFD700', '#004C99'] },
  { id: 'brescia', nome: 'Brescia', pais: 'IT', cores: ['#0A3D91', '#FFFFFF'] },
  { id: 'monza', nome: 'Monza', pais: 'IT', cores: ['#E30613', '#FFFFFF'] },

  // ------------------------------------------------------------ Inglaterra
  { id: 'manchester-united', nome: 'Manchester United', pais: 'EN', cores: ['#DA291C', '#FBE122'] },
  { id: 'manchester-city', nome: 'Manchester City', pais: 'EN', cores: ['#6CABDD', '#1C2C5B'] },
  { id: 'liverpool', nome: 'Liverpool', pais: 'EN', cores: ['#C8102E', '#00B2A9'] },
  { id: 'chelsea', nome: 'Chelsea', pais: 'EN', cores: ['#034694', '#FFFFFF'] },
  { id: 'arsenal', nome: 'Arsenal', pais: 'EN', cores: ['#EF0107', '#FFFFFF'] },
  { id: 'tottenham', nome: 'Tottenham', pais: 'EN', cores: ['#FFFFFF', '#132257'] },
  { id: 'everton', nome: 'Everton', pais: 'EN', cores: ['#003399', '#FFFFFF'] },
  { id: 'aston-villa', nome: 'Aston Villa', pais: 'EN', cores: ['#95BFE5', '#670E36'] },
  { id: 'sunderland', nome: 'Sunderland', pais: 'EN', cores: ['#EB172B', '#FFFFFF'] },
  { id: 'birmingham-city', nome: 'Birmingham City', pais: 'EN', cores: ['#0000FF', '#FFFFFF'] },
  { id: 'nottingham-forest', nome: 'Nottingham Forest', pais: 'EN', cores: ['#DD0000', '#FFFFFF'] },
  { id: 'reading', nome: 'Reading', pais: 'EN', cores: ['#004494', '#FFFFFF'] },
  { id: 'sheffield-wednesday', nome: 'Sheffield Wednesday', pais: 'EN', cores: ['#0066B3', '#FFFFFF'] },

  // ---------------------------------------------------------------- França
  { id: 'psg', nome: 'Paris Saint-Germain', pais: 'FR', cores: ['#004170', '#DA291C'] },
  { id: 'marseille', nome: 'Olympique de Marseille', pais: 'FR', cores: ['#2FAEE0', '#FFFFFF'] },
  { id: 'lyon', nome: 'Olympique Lyonnais', pais: 'FR', cores: ['#FFFFFF', '#0A3D91'] },
  { id: 'monaco', nome: 'Monaco', pais: 'FR', cores: ['#E63329', '#FFFFFF'] },
  { id: 'bordeaux', nome: 'Bordeaux', pais: 'FR', cores: ['#000033', '#8B2942'] },
  { id: 'nice', nome: 'Nice', pais: 'FR', cores: ['#E30613', '#1A1A1A'] },

  // -------------------------------------------------------------- Alemanha
  { id: 'bayern', nome: 'Bayern de Munique', pais: 'DE', cores: ['#DC052D', '#0066B2'] },
  { id: 'bayer-leverkusen', nome: 'Bayer Leverkusen', pais: 'DE', cores: ['#E32221', '#1A1A1A'] },
  { id: 'werder-bremen', nome: 'Werder Bremen', pais: 'DE', cores: ['#1D9053', '#FFFFFF'] },
  { id: 'wolfsburg', nome: 'Wolfsburg', pais: 'DE', cores: ['#65B32E', '#FFFFFF'] },
  { id: 'hamburgo', nome: 'Hamburgo', pais: 'DE', cores: ['#0A3D91', '#FFFFFF'] },
  { id: 'schalke', nome: 'Schalke 04', pais: 'DE', cores: ['#004D9D', '#FFFFFF'] },
  { id: 'hoffenheim', nome: 'Hoffenheim', pais: 'DE', cores: ['#1C63B7', '#FFFFFF'] },

  // -------------------------------------------------------------- Portugal
  { id: 'porto', nome: 'Porto', pais: 'PT', cores: ['#00428C', '#FFFFFF'] },
  { id: 'benfica', nome: 'Benfica', pais: 'PT', cores: ['#E00000', '#FFFFFF'] },
  { id: 'sporting-cp', nome: 'Sporting', pais: 'PT', cores: ['#008057', '#FFFFFF'] },
  { id: 'vitoria-guimaraes', nome: 'Vitória de Guimarães', pais: 'PT', cores: ['#FFFFFF', '#1A1A1A'] },

  // ------------------------------------------------------------- Holanda
  { id: 'ajax', nome: 'Ajax', pais: 'NL', cores: ['#D2122E', '#FFFFFF'] },
  { id: 'psv', nome: 'PSV', pais: 'NL', cores: ['#EE2223', '#FFFFFF'] },
  { id: 'feyenoord', nome: 'Feyenoord', pais: 'NL', cores: ['#E30613', '#FFFFFF'] },

  // ----------------------------------------------------------- Outras UEFA
  { id: 'galatasaray', nome: 'Galatasaray', pais: 'TR', cores: ['#A90432', '#FDB912'] },
  { id: 'fenerbahce', nome: 'Fenerbahçe', pais: 'TR', cores: ['#FFED00', '#004B93'] },
  { id: 'besiktas', nome: 'Beşiktaş', pais: 'TR', cores: ['#1A1A1A', '#FFFFFF'] },
  { id: 'kayserispor', nome: 'Kayserispor', pais: 'TR', cores: ['#FFD700', '#E30613'] },
  { id: 'basel', nome: 'Basel', pais: 'CH', cores: ['#E30613', '#0A3D91'] },
  { id: 'olympiacos', nome: 'Olympiacos', pais: 'GR', cores: ['#E30613', '#FFFFFF'] },
  { id: 'shakhtar', nome: 'Shakhtar Donetsk', pais: 'UA', cores: ['#F58220', '#1A1A1A'] },
  { id: 'zenit', nome: 'Zenit', pais: 'RU', cores: ['#0A3D91', '#87CEEB'] },
  { id: 'cska-moscow', nome: 'CSKA Moscou', pais: 'RU', cores: ['#0A3D91', '#E30613'] },
  { id: 'lokomotiv-moscow', nome: 'Lokomotiv Moscou', pais: 'RU', cores: ['#008B45', '#E30613'] },
  { id: 'rosenborg', nome: 'Rosenborg', pais: 'NO', cores: ['#FFFFFF', '#1A1A1A'] },
  { id: 'copenhagen', nome: 'Copenhague', pais: 'DK', cores: ['#FFFFFF', '#0A3D91'] },

  // ------------------------------------------------------------------ MLS
  { id: 'inter-miami', nome: 'Inter Miami', pais: 'US', cores: ['#F7B5CD', '#1A1A1A'] },
  { id: 'la-galaxy', nome: 'LA Galaxy', pais: 'US', cores: ['#00245D', '#FFD200'] },
  { id: 'orlando-city', nome: 'Orlando City', pais: 'US', cores: ['#633492', '#FFFFFF'] },
  { id: 'new-york-red-bulls', nome: 'New York Red Bulls', pais: 'US', cores: ['#E32221', '#FFD200'] },

  // ------------------------------------------------------------------ Ásia
  { id: 'al-nassr', nome: 'Al-Nassr', pais: 'SA', cores: ['#FFD700', '#0A3D91'] },
  { id: 'al-hilal', nome: 'Al-Hilal', pais: 'SA', cores: ['#0A3D91', '#FFFFFF'] },
  { id: 'al-ahli-saudi', nome: 'Al-Ahli', pais: 'SA', cores: ['#00A651', '#FFFFFF'] },
  { id: 'al-gharafa', nome: 'Al-Gharafa', pais: 'QA', cores: ['#1A1A1A', '#FFD700'] },
  { id: 'al-jazira', nome: 'Al-Jazira', pais: 'AE', cores: ['#F58220', '#FFFFFF'] },
  { id: 'kawasaki-frontale', nome: 'Kawasaki Frontale', pais: 'JP', cores: ['#0A3D91', '#87CEEB'] },
  { id: 'tokyo-verdy', nome: 'Tokyo Verdy', pais: 'JP', cores: ['#00A651', '#FFFFFF'] },
  { id: 'nagoya-grampus', nome: 'Nagoya Grampus', pais: 'JP', cores: ['#E30613', '#FFD700'] },
  { id: 'shanghai-shenhua', nome: 'Shanghai Shenhua', pais: 'CN', cores: ['#0A3D91', '#FFFFFF'] },
  { id: 'shanghai-sipg', nome: 'Shanghai Port', pais: 'CN', cores: ['#E30613', '#1A1A1A'] },
  { id: 'shandong-luneng', nome: 'Shandong Taishan', pais: 'CN', cores: ['#F58220', '#1A1A1A'] },
  { id: 'guangzhou-evergrande', nome: 'Guangzhou Evergrande', pais: 'CN', cores: ['#E30613', '#FFD700'] },
]

export const CLUBE_POR_ID = new Map(CLUBES.map((c) => [c.id, c]))
