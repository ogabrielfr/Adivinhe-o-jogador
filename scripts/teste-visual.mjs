import { chromium } from 'playwright'
const OUT = process.env.SAIDA ?? 'capturas'
await import('node:fs').then((fs) => fs.mkdirSync(OUT, { recursive: true }))
const URL = 'http://127.0.0.1:4173/'

const navegador = await chromium.launch(
  process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {},
)
const ctx = await navegador.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'pt-BR' })
const p = await ctx.newPage()
const erros = []
p.on('console', (m) => m.type() === 'error' && erros.push(m.text()))
p.on('pageerror', (e) => erros.push('PAGE: ' + e.message))
p.on('requestfailed', (r) => erros.push('REQ: ' + r.url()))

await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(800)
await p.screenshot({ path: `${OUT}/1-inicial.png`, fullPage: true })

await p.getByRole('button', { name: /Difícil/ }).click()
await p.waitForTimeout(600)
await p.screenshot({ path: `${OUT}/2-partida.png`, fullPage: true })

// erra os três chutes para revelar quem era
for (const chute of ['fulano', 'beltrano da silva', 'ciclano de souza']) {
  await p.locator('#palpite').fill(chute)
  await p.getByRole('button', { name: 'Chutar' }).click()
  await p.waitForTimeout(350)
}
await p.waitForTimeout(1200)
const nomeRevelado = (await p.locator('h2').first().textContent())?.trim()
await p.screenshot({ path: `${OUT}/3-derrota.png`, fullPage: true })
console.log('jogador do dia (difícil):', nomeRevelado)

// recomeça e agora acerta, usando a dica
await p.evaluate(() => localStorage.clear())
await p.reload({ waitUntil: 'networkidle' })
await p.getByRole('button', { name: /Difícil/ }).click()
await p.waitForTimeout(400)
await p.getByRole('button', { name: 'Dica' }).click()
await p.waitForTimeout(400)
await p.screenshot({ path: `${OUT}/4-com-dica.png`, fullPage: true })

// tolerância a erro de digitação: tira uma letra do nome
const comErro = nomeRevelado.slice(0, -1)
await p.locator('#palpite').fill(comErro)
await p.getByRole('button', { name: 'Chutar' }).click()
await p.waitForTimeout(1500)
const ganhou = await p.getByText(/acertou|De primeira/i).count()
console.log(`acerto com typo ("${comErro}"):`, ganhou > 0 ? 'aceito' : 'RECUSADO')
await p.screenshot({ path: `${OUT}/5-vitoria.png`, fullPage: true })

// volta para a home já com o resultado registrado
await p.getByRole('button', { name: /Jogar o|Voltar aos níveis/ }).click().catch(() => {})
await p.waitForTimeout(500)
await p.evaluate(() => window.scrollTo(0, 0))
await p.goto(URL, { waitUntil: 'networkidle' })
await p.waitForTimeout(600)
await p.screenshot({ path: `${OUT}/6-home-com-resultado.png`, fullPage: true })

// desktop
const ctxD = await navegador.newContext({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 2, locale: 'pt-BR' })
const d = await ctxD.newPage()
await d.goto(URL, { waitUntil: 'networkidle' })
await d.waitForTimeout(700)
await d.screenshot({ path: `${OUT}/7-desktop.png` })
await d.getByRole('button', { name: /Intermediário/ }).click()
await d.waitForTimeout(600)
await d.screenshot({ path: `${OUT}/8-desktop-partida.png` })

// rolagem horizontal indevida?
const overflow = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
console.log('rolagem horizontal no celular:', overflow ? 'SIM (problema)' : 'não')
console.log('erros de console:', erros.length ? erros : 'nenhum')
await navegador.close()
