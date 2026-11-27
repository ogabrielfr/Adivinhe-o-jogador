/**
 * A letra com que começa o nome do jogador, para o fim da segunda dica.
 *
 * O cliente pediu que a segunda dica direcionasse mais (novembro de 2026), e a
 * opção escolhida termina a dica com "O nome começa com R.". É o único dado
 * que vale para os 900 e que leva direto à resposta; sozinho, corta para cerca
 * de um décimo dos nomes (A abre 97, R 85, M 84).
 *
 * A letra sai do nome que o jogo mostra na revelação, sem acento: "Édson"
 * começa com E. Letra que a decomposição Unicode não desmonta (o Ł do
 * Fabiański, o Ø dinamarquês) vira a latina mais próxima.
 *
 * Fica fora de dicas.mjs porque o `validar-dados` também usa: a frase da dica
 * tem que bater com o nome, e um nome trocado em `nomes-fixos.mjs` sem refazer
 * as dicas deixaria a letra errada.
 */
const ESPECIAIS = { Ł: 'L', ł: 'L', Ø: 'O', ø: 'O', Æ: 'A', æ: 'A', Œ: 'O', œ: 'O', Đ: 'D', đ: 'D', ß: 'S', Þ: 'T', þ: 'T', ı: 'I' }

/** "Édson Arantes" -> "E"; "Łukasz Fabiański" -> "L"; sem letra -> null */
export function inicialDoNome(nome) {
  for (const ch of String(nome ?? '').trim()) {
    const base = (ESPECIAIS[ch] ?? ch).normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (/^[A-Za-z]$/.test(base)) return base.toUpperCase()
  }
  return null
}

/** A frase que fecha a segunda dica: "O nome começa com R." */
export function fraseDaLetra(nome) {
  const letra = inicialDoNome(nome)
  return letra ? `O nome começa com ${letra}.` : null
}

/** A segunda dica sem a frase da letra: é o que precisa ser único entre os jogadores. */
export const semALetra = (dica) => String(dica ?? '').replace(/\s*O nome começa com [A-Z]\.$/, '')
