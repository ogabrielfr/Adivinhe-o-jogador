/**
 * Decide quando dois nomes descrevem o mesmo clube.
 *
 * O problema: cada fonte escreve o clube de um jeito. "Coritiba" e "Coritiba
 * Foot Ball Club", "Inter de Milão" e "Football Club Internazionale Milano",
 * "PSV" e "PSV Eindhoven". Comparar string com string perde quase tudo.
 *
 * A regra tem duas camadas porque nenhuma sozinha resolve:
 *
 * 1. Tira os tokens genéricos ("futebol", "clube", "esporte") e compara o que
 *    sobra. É o que faz "Coritiba" casar com "Coritiba Foot Ball Club".
 * 2. Quando tirar os genéricos esvazia um dos lados — "Sporting", "PSV",
 *    "Real" são clubes cujo nome inteiro é genérico — volta a comparar com os
 *    tokens completos.
 */

const semAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Tokens que aparecem no nome oficial e não distinguem clube nenhum. */
const GENERICOS = new Set([
  'fc','cf','ac','acf','sc','afc','ca','cd','ud','rcd','as','ss','ssc','bk','sk','if','fk','nk','hk',
  'jk','sv','vfl','vfb','tsg','sl','bv','rc','us','ogc','cr','ec','se','aa','ad','fk','ko',
  'club','clube','futbol','football','foot','ball','futebol','soccer','esporte','esportes','esportivo',
  'sportivo','sportiva','sporting','sport','sports','associazione','associacao','association','associacao',
  'sociedade','societa','calcio','spor','kulubu','kulube','regatas','recreativo','deportivo','deportes','desportivo','desportiva','desportos',
  'de','do','da','das','dos','e','and','the','of','y','la','el','los','las',
  // "united" e "city" separam Manchester United de Manchester City; "real"
  // separa Real Madrid de Madrid. Genérico de verdade é só o que não
  // distingue clube nenhum.
  'team','klub','futbolniy','boldklub',
])

const partir = (nome) =>
  semAcento(nome).toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim().split(' ').filter(Boolean)

/** distância de edição, limitada — só interessa saber se é pequena */
function distancia(a, b) {
  if (Math.abs(a.length - b.length) > 2) return 99
  let linha = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const nova = [i]
    for (let j = 1; j <= b.length; j++) {
      nova[j] = Math.min(linha[j] + 1, nova[j - 1] + 1, linha[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
    }
    linha = nova
  }
  return linha[b.length]
}

/**
 * O mesmo clube chega escrito na língua de cada fonte: "Inter" e
 * "Internazionale", "Milão" e "Milano".
 *
 * `estrito` desliga a comparação aproximada. Ela é necessária quando um dos
 * lados tem um único token, porque aí não há mais nada no nome para
 * desempatar: sem isso "Bayern" casaria com "Bayer 04 Leverkusen", que são
 * clubes diferentes separados por uma letra.
 */
function mesmoToken(a, b, estrito) {
  if (a === b) return true
  if (estrito) return false
  const [curto, longo] = a.length <= b.length ? [a, b] : [b, a]
  // prefixo só vale quando o resto é substancial: "inter" -> "internazionale"
  // passa, "bayer" -> "bayern" não.
  if (curto.length >= 4 && longo.startsWith(curto) && longo.length - curto.length >= 3) return true
  return curto.length >= 5 && distancia(a, b) <= 2
}

/** Um conjunto de tokens cabe no outro? */
function cabe(menor, maior, estrito) {
  return menor.every((t) => maior.some((o) => mesmoToken(t, o, estrito)))
}

/**
 * Brasil tem clubes homônimos separados só pela sigla do estado: Botafogo e
 * Botafogo-SP, América-MG e América-RN. Se um lado traz a sigla e o outro não,
 * ou se trazem siglas diferentes, não são o mesmo clube.
 */
const UFS = new Set(['ac','al','ap','am','ba','ce','df','es','go','ma','mt','ms','mg','pa','pb','pr',
  'pe','pi','rj','rn','rs','ro','rr','sc','sp','se','to'])

function ufDe(tokens) {
  return tokens.find((t) => UFS.has(t) && t.length === 2) ?? null
}

export function mesmoClube(a, b) {
  const distintivos = (n) => partir(n).filter((t) => !GENERICOS.has(t))
  const da = distintivos(a)
  const db = distintivos(b)

  if (ufDe(da) !== ufDe(db)) return false

  // camada 1: os dois lados têm parte distintiva
  if (da.length && db.length) {
    const [menor, maior] = da.length <= db.length ? [da, db] : [db, da]
    return cabe(menor, maior, menor.length === 1 && maior.length > 1)
  }

  // camada 2: um dos nomes é genérico inteiro ("Sporting", "PSV")
  const fa = partir(a)
  const fb = partir(b)
  const [menor, maior] = fa.length <= fb.length ? [fa, fb] : [fb, fa]
  return cabe(menor, maior, true)
}

export { partir as tokensDoNome }
