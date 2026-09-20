/**
 * Letras gregas e cirílicas que são desenhadas igual a uma latina.
 *
 * Existe porque o nome do Arda Güler chegou do Transfermarkt com um alfa
 * grego (U+0391) no lugar do A: idêntico na tela, outro caractere para o
 * computador. Sem isto, `normalizar` jogava o alfa fora junto com a
 * pontuação e quem digitasse "arda" comparava contra " rda".
 *
 * O critério é semelhança visual, não transliteração: aqui o ni grego vale
 * "v" porque é assim que ele aparece num nome escrito em alfabeto latino,
 * ainda que transliterar grego de verdade daria "n".
 */
const SOSIAS: Record<string, string> = {
  // grego maiúsculo
  '\u0391': 'A', '\u0392': 'B', '\u0395': 'E', '\u0396': 'Z', '\u0397': 'H',
  '\u0399': 'I', '\u039A': 'K', '\u039C': 'M', '\u039D': 'N', '\u039F': 'O',
  '\u03A1': 'P', '\u03A4': 'T', '\u03A5': 'Y', '\u03A7': 'X',
  // grego minúsculo
  '\u03B1': 'a', '\u03B5': 'e', '\u03B9': 'i', '\u03BA': 'k',
  '\u03BD': 'v', '\u03BF': 'o', '\u03C1': 'p', '\u03C5': 'u',
  // cirílico maiúsculo
  '\u0410': 'A', '\u0412': 'B', '\u0415': 'E', '\u041A': 'K', '\u041C': 'M',
  '\u041D': 'H', '\u041E': 'O', '\u0420': 'P', '\u0421': 'C', '\u0422': 'T',
  '\u0423': 'Y', '\u0425': 'X', '\u0408': 'J', '\u0405': 'S', '\u0406': 'I',
  // cirílico minúsculo
  '\u0430': 'a', '\u0432': 'b', '\u0435': 'e', '\u043A': 'k', '\u043C': 'm',
  '\u043D': 'h', '\u043E': 'o', '\u0440': 'p', '\u0441': 'c', '\u0442': 't',
  '\u0443': 'y', '\u0445': 'x', '\u0458': 'j', '\u0455': 's', '\u0456': 'i',
}

const SOSIA = new RegExp(`[${Object.keys(SOSIAS).join('')}]`, 'g')

/** Troca sósia por letra latina. O resto do texto passa intacto. */
export function latinizar(texto: string): string {
  return texto.replace(SOSIA, (c) => SOSIAS[c] ?? c)
}

/** Remove sósia, acento, caixa e pontuação para comparar palpites. */
export function normalizar(texto: string): string {
  return latinizar(texto)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Distância de edição, limitada por `teto` para sair cedo em strings distantes. */
export function distancia(a: string, b: string, teto = 3): number {
  if (a === b) return 0
  if (Math.abs(a.length - b.length) > teto) return teto + 1

  let anterior = Array.from({ length: b.length + 1 }, (_, i) => i)
  for (let i = 1; i <= a.length; i++) {
    const atual = [i]
    let menorNaLinha = i
    for (let j = 1; j <= b.length; j++) {
      const custo = a[i - 1] === b[j - 1] ? 0 : 1
      const v = Math.min(anterior[j] + 1, atual[j - 1] + 1, anterior[j - 1] + custo)
      atual.push(v)
      if (v < menorNaLinha) menorNaLinha = v
    }
    if (menorNaLinha > teto) return teto + 1
    anterior = atual
  }
  return anterior[b.length]
}

/**
 * Aceita o palpite se bater exatamente ou se estiver a um erro de digitação de
 * distância. A folga cresce com o tamanho da palavra: "pato" precisa ser exato,
 * "ibrahimovic" tolera dois deslizes.
 */
export function pareceIgual(palpite: string, alvo: string): boolean {
  if (palpite === alvo) return true
  if (alvo.length < 6) return false
  const folga = alvo.length >= 12 ? 2 : 1
  return distancia(palpite, alvo, folga) <= folga
}

/**
 * Partículas de sobrenome. Não identificam ninguém sozinhas, mas fazem parte
 * do sobrenome quando vêm antes dele: o mundo chama Marc-André ter Stegen de
 * "ter Stegen", não de "Stegen".
 */
const PARTICULAS = new Set([
  'de', 'da', 'do', 'das', 'dos', 'del', 'dela', 'della', 'di', 'du',
  'van', 'von', 'ter', 'ten', 'der', 'den', 'dos', 'la', 'le', 'el',
  'al', 'bin', 'ibn', 'y', 'e', 'jr', 'junior', 'filho', 'neto',
])

/**
 * Todas as formas que contam como acerto para um jogador.
 *
 * Ninguém digita o nome completo. Digita o pedaço pelo qual conhece o jogador,
 * e esse pedaço é quase sempre uma sequência de palavras do nome: "ter Stegen"
 * de "Marc-André ter Stegen", "Lucas Lima" de "Lucas Lima", "ronaldo" de
 * "Ronaldo Fenômeno". Então vale qualquer sequência contígua de duas ou mais
 * palavras, mais as palavras isoladas que identificam sozinhas.
 *
 * Uma palavra só vale sozinha se tiver ao menos quatro letras e não for
 * partícula — "ter" e "de" não dizem nada. E quando a mesma forma serve a mais
 * de um jogador, `PALPITES_AMBIGUOS` a recusa e pede desempate, o tratamento
 * que já existia.
 *
 * Manter a regra aqui, e não na lista de apelidos de cada jogador, é o que faz
 * ela valer para os trezentos sem ninguém ter que lembrar caso a caso.
 */
/** O nome canônico e os apelidos declarados, exatamente como estão. */
export function formasExatas(nome: string, apelidos: readonly string[]): string[] {
  return [nome, ...apelidos].map(normalizar)
}

/**
 * Os pedaços do nome que também contam: sequências contíguas de palavras e as
 * palavras que identificam sozinhas. Ficam separadas das exatas porque só
 * estas passam pelo teste de ambiguidade — ver `formasAceitas`.
 */
export function formasDerivadas(nome: string, apelidos: readonly string[]): string[] {
  const formas = new Set<string>()

  for (const base of [nome, ...apelidos]) {
    const palavras = normalizar(base).split(' ').filter(Boolean)

    // sequências contíguas de duas ou mais palavras
    for (let i = 0; i < palavras.length; i++) {
      for (let j = i + 2; j <= palavras.length; j++) {
        formas.add(palavras.slice(i, j).join(' '))
      }
    }

    for (const p of palavras) {
      if (p.length >= 4 && !PARTICULAS.has(p)) formas.add(p)
    }
  }

  for (const exata of formasExatas(nome, apelidos)) formas.delete(exata)
  return [...formas]
}

/** Tudo que conta como acerto, exatas e derivadas. */
export function formasAceitas(nome: string, apelidos: readonly string[]): string[] {
  return [...formasExatas(nome, apelidos), ...formasDerivadas(nome, apelidos)]
}
