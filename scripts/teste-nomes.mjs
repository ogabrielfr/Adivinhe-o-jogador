import { mesmoClube } from './nomes-clube.mjs'
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
]
let falhas = 0
for (const [a, b] of deveCasar) if (!mesmoClube(a, b)) { console.log(`FALHOU (devia casar)     ${a}  |  ${b}`); falhas++ }
for (const [a, b] of naoDeveCasar) if (mesmoClube(a, b)) { console.log(`FALHOU (não devia casar) ${a}  |  ${b}`); falhas++ }
console.log(falhas ? `\n${falhas} falha(s)` : `\ntodos os ${deveCasar.length + naoDeveCasar.length} casos passaram`)

// o deploy roda este teste; sem código de saída, uma falha passava calada
if (falhas) process.exitCode = 1
