import { mesmoClube, cabeNoNome } from './nomes-clube.mjs'
import { ehCategoriaDeBase } from './transfermarkt.mjs'
const deveCasar = [
  ['Coritiba', 'Coritiba Foot Ball Club'],
  ['Sporting', 'Sporting Clube de Portugal'],
  ['PSV', 'PSV Eindhoven'],
  ['Inter de Milão', 'Football Club Internazionale Milano'],
  ['Inter Miami', 'Club Internacional de Fútbol Miami'],
  ['Boca Juniors', 'Club Atlético Boca Juniors'],
  ['LA Galaxy', 'Los Angeles Galaxy'],
  ['Atlético Mineiro', 'Clube Atlético Mineiro'],
  ['Grêmio', 'Grêmio Foot-Ball Porto Alegrense'],
  ['Sport Recife', 'Sport Club do Recife'],
  ['Bayer Leverkusen', 'Bayer 04 Leverkusen'],
  ['Santos', 'Santos Futebol Clube'],
  ['São Caetano', 'Associação Desportiva São Caetano'],
  ['Juventude', 'Esporte Clube Juventude'],
  ['Sevilla', 'Sevilha'],
  ['Burnley', 'Burnley Football Club'],
]
const naoDeveCasar = [
  ['Bayern', 'Bayer 04 Leverkusen'],
  ['Atlético Mineiro', 'Atlético Goianiense'],
  ['América Mineiro', 'Atlético Mineiro'],
  ['Vasco da Gama', 'Vitória'],
  ['Sporting', 'Sport Club do Recife'],
  ['Inter de Milão', 'Internacional'],
  ['LA Galaxy', 'Los Angeles FC'],
  ['Botafogo', 'Botafogo-SP'],
  // o Western United da Austrália virou o West Ham do Mascherano no jogo
  ['Western United', 'West Ham United Football Club'],
  ['West Ham United', 'Western United FC'],
  ['Newcastle United', 'New England Revolution'],
  ['Real Madrid', 'Real Sociedad'],
  // uma palavra de cada lado, a uma ou duas letras: o catálogo deu ao Burnley
  // o código do Barnsley, e o John Stones começou a carreira no clube errado
  ['Burnley', 'Barnsley Football Club'],
  ['Watford FC', 'Dartford Football Club'],
  ['Parma', 'La Palma'],
  ['Celta', 'AD Ceuta FC'],
  ['Santos', 'Esporte Clube de Patos'],
  ['NK Istra', 'NK Bistra'],
  ['Alanyaspor', 'Adanaspor'],
]
/**
 * O nome do Transfermarkt abrevia, mas não acrescenta: o que ele diz tem que
 * estar no nome do clube. Os de baixo são os homônimos que chegaram ao jogo.
 */
const cabe = [
  ['Sao Paulo', 'São Paulo'],
  ['PSV', 'PSV Eindhoven'],
  ['Boca Juniors', 'Club Atlético Boca Juniors'],
  ['F.C. Tokyo', 'FC Tokyo'],
]
const naoCabe = [
  ['Quick Boys', 'Sport Boys Association'],
  ['Miami United', 'United Football Club'],
  ['Atl. Dallas', 'FC Dallas'],
  ['Yokohama Flüg.', 'Yokohama FC'],
]

/** Categoria de base e time B saem da carreira; clube de verdade com nome parecido, não. */
const deBase = [
  'OB Juventude', 'Newells Jv', 'As Monaco Juven', 'Real Madrid Castilla', 'Real Madrid S19', 'Man City For',
  'Sevilla FC Juve', 'Albacete F.base', 'Barcelona C', 'Jong Ajax', 'Seiryo HS', 'Portimonense 15', 'RCD Mallorca B ',
  'V. Mestalla', 'Sporting Atl.', 'Dynamo-2 Kiew',
]
const naoEBase = [
  'Esporte Clube Juventude', 'Juve Stabia', 'Boca Juniors', 'Argentinos Jrs.', 'Willem II', 'Talleres RE',
  'Académica', 'Céres Futebol Clube', 'Esporte Clube Primavera', 'Schalke 04', 'Hannover 96', 'Remo',
]

let falhas = 0
for (const [a, b] of deveCasar) if (!mesmoClube(a, b)) { console.log(`FALHOU (devia casar)     ${a}  |  ${b}`); falhas++ }
for (const [a, b] of naoDeveCasar) if (mesmoClube(a, b)) { console.log(`FALHOU (não devia casar) ${a}  |  ${b}`); falhas++ }
for (const [a, b] of cabe) if (!cabeNoNome(a, b)) { console.log(`FALHOU (devia caber)     ${a}  |  ${b}`); falhas++ }
for (const [a, b] of naoCabe) if (cabeNoNome(a, b)) { console.log(`FALHOU (não devia caber) ${a}  |  ${b}`); falhas++ }
for (const n of deBase) if (!ehCategoriaDeBase(n)) { console.log(`FALHOU (é base)          ${n}`); falhas++ }
for (const n of naoEBase) if (ehCategoriaDeBase(n)) { console.log(`FALHOU (não é base)      ${n}`); falhas++ }
const total = deveCasar.length + naoDeveCasar.length + cabe.length + naoCabe.length + deBase.length + naoEBase.length
console.log(falhas ? `\n${falhas} falha(s)` : `\ntodos os ${total} casos passaram`)

// o deploy roda este teste; sem código de saída, uma falha passava calada
if (falhas) process.exitCode = 1
