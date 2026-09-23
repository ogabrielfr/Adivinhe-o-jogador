/**
 * Gera `public/previa.png`, a imagem que o WhatsApp, o Telegram e as redes
 * mostram quando alguém cola o link do jogo.
 *
 * Sem ela, quem recebia um resultado compartilhado via um link cru, sem os
 * escudos nem o nome do jogo — e o compartilhamento é o principal jeito de um
 * jogo diário chegar a gente nova. A imagem repete a abertura do próprio jogo:
 * a parede de escudos e o título, nas mesmas cores e na mesma fonte.
 *
 * Roda à mão (`npm run previa`) quando a identidade mudar; o arquivo gerado vai
 * para o repositório, porque a publicação não abre navegador.
 */
import { chromium } from 'playwright'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { CLUBES } from '../src/dados/clubes.ts'

const raiz = new URL('..', import.meta.url)
const caminho = (rel) => fileURLToPath(new URL(rel, raiz))

// clubes que o torcedor reconhece de longe, alternando Brasil e fora
const NOMES = [
  'Flamengo', 'Real Madrid', 'Palmeiras', 'Barcelona', 'Corinthians', 'Milan', 'São Paulo',
  'Juventus', 'Santos', 'Bayern de Munique', 'Grêmio', 'Manchester United', 'Internacional',
  'Boca Juniors', 'Cruzeiro', 'Inter de Milão', 'Vasco da Gama', 'PSG', 'Atlético-MG', 'Liverpool',
  'Fluminense', 'Chelsea', 'Botafogo', 'River Plate', 'Porto', 'Arsenal', 'Benfica', 'Roma',
  'Bahia', 'Ajax', 'Sport Recife', 'Dortmund', 'Athletico-PR', 'Lazio', 'Coritiba', 'Napoli',
  'Atlético de Madrid', 'Sevilla', 'Marselha', 'Valencia', 'Galatasaray', 'Sporting',
]
const escudos = NOMES.map((nome) => CLUBES.find((c) => c.nome === nome)?.escudo).filter(Boolean)
if (escudos.length !== NOMES.length) throw new Error('algum clube da prévia sumiu do catálogo')

const fonte = readFileSync(caminho('node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2'))
  .toString('base64')
const embutir = (arquivo) => {
  const bytes = readFileSync(caminho(`public/escudos/${arquivo}`))
  const tipo = arquivo.endsWith('.svg') ? 'image/svg+xml' : 'image/png'
  return `data:${tipo};base64,${bytes.toString('base64')}`
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: 'Archivo'; src: url(data:font/woff2;base64,${fonte}) format('woff2');
  font-weight: 100 900; font-stretch: 62% 125%; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0c1711; color: #f2f0e9; font-family: 'Archivo';
  position: relative; overflow: hidden; }
.parede { position: absolute; inset: 0 0 auto 0; height: 360px; display: flex; flex-wrap: wrap;
  justify-content: center; gap: 18px; padding: 22px 16px 0;
  -webkit-mask-image: linear-gradient(to bottom, #000 0%, rgba(0,0,0,.45) 55%, transparent 92%); }
.parede img { width: 76px; height: 76px; object-fit: contain; opacity: .6; }
h1 { position: absolute; left: 72px; bottom: 96px; font-size: 92px; font-stretch: 125%; font-weight: 800;
  letter-spacing: -0.02em; line-height: .88; text-transform: uppercase; }
p { position: absolute; left: 76px; bottom: 50px; font-size: 26px; font-stretch: 100%; color: #8fa096; }
.traco { position: absolute; left: 72px; right: 72px; bottom: 30px; height: 2px; background: #1b2e25; }
</style></head><body>
<div class="parede">${escudos.map((e) => `<img src="${embutir(e)}">`).join('')}</div>
<h1>Acerte o jogador<br>pela carreira</h1>
<p>Jogo diário · descubra quem é pelos escudos dos clubes</p>
<div class="traco"></div>
</body></html>`

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {},
)
const pagina = await navegador.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
await pagina.setContent(html, { waitUntil: 'load' })
await pagina.evaluate(() => document.fonts.ready)
await pagina.screenshot({ path: caminho('public/previa.png') })
await navegador.close()
console.log('public/previa.png gerada')
