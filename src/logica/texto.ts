/** Remove acento, caixa e pontuação para comparar palpites. */
export function normalizar(texto: string): string {
  return texto
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

/** Palavras que não identificam ninguém sozinhas e não valem como palpite. */
const SEM_VALOR = new Set(['de', 'da', 'do', 'dos', 'das', 'del', 'van', 'von', 'dos', 'jr'])

/**
 * Todas as formas que contam como acerto para um jogador.
 *
 * Além do nome e dos apelidos declarados, aceita a primeira e a última palavra
 * do nome canônico. É o que faltava quando "Ronaldo Fenômeno" recusava
 * "ronaldo": o palpite mais provável do país inteiro caía fora, e a tolerância
 * a digitação não cobre porque ela mede distância de edição — "ronaldo" está a
 * oito caracteres de "ronaldo fenomeno", não a um erro de digitação.
 *
 * Manter isto aqui, e não na lista de apelidos de cada jogador, é o que faz a
 * regra valer para os trezentos sem ninguém ter que lembrar caso a caso. Quando
 * a palavra serve a mais de um jogador, `PALPITES_AMBIGUOS` a recusa e pede
 * desempate — o tratamento que já existia.
 */
export function formasAceitas(nome: string, apelidos: readonly string[]): string[] {
  const formas = new Set([nome, ...apelidos].map(normalizar))
  const palavras = normalizar(nome).split(' ').filter(Boolean)
  if (palavras.length > 1) {
    for (const p of [palavras[0], palavras[palavras.length - 1]]) {
      if (p.length >= 4 && !SEM_VALOR.has(p)) formas.add(p)
    }
  }
  return [...formas]
}
