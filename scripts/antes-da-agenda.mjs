/**
 * Quem saiu no jogo antes de a agenda existir, de 15 a 21/09/2026.
 *
 * Reconstruído rodando o sorteio de cada versão publicada nas horas em que
 * ela ficou no ar, no horário de Brasília. Há dias com dois ou três nomes no
 * mesmo nível porque uma publicação no meio do dia mudava a lista — foi esse
 * o problema que levou à agenda.
 *
 * Serve só para `npm run agenda` não repetir essa gente nos 90 dias seguintes;
 * o jogo não lê este arquivo. O id é o da biblioteca de hoje quando o jogador
 * continua nela. Os que saíram da biblioteca ficaram com o id da época, e
 * três deles voltam na lista dos grandes nomes: quem os trouxer deve usar
 * `messi`, `ronaldo-fenomeno` e `juninho-pernambucano`, senão a regra não os
 * reconhece.
 */
export const ANTES_DA_AGENDA = {
  '2026-09-15': ['cristiano-ronaldo', 'dzeko', 'nicolas-otamendi', 'keirrison', 'drenthe'],
  '2026-09-16': ['ronaldo-fenomeno', 'philippe-coutinho', 'bendtner'],
  '2026-09-17': ['messi', 'felipe-anderson', 'juninho-pernambucano', 'david-de-gea', 'quaresma', 'lucas-lima'],
  '2026-09-18': ['ronaldinho-gaucho', 'vitor-roque', 'aleksandar-mitrovic'],
  '2026-09-19': ['javier-mascherano', 'andres-iniesta', 'lucas-paqueta', 'marc-andre-ter-stegen', 'zagallo', 'kenny-dalglish', 'leroy-sane', 'joel-santana', 'ademilson'],
  '2026-09-20': ['roger-machado', 'luis-suarez', 'ivan-rakitic', 'takashi-usami', 'anderson-polga'],
  '2026-09-21': ['andres-iniesta', 'mesut-ozil', 'belletti', 'frederico-rodrigues-santos', 'fabao', 'jenilson-angelo-de-souza'],
}
