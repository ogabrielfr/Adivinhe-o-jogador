/**
 * Países que o catálogo quer cobrir, além dos que os repositórios de escudo já
 * trazem, e o QID de cada um no Wikidata.
 *
 * A ordem importa pouco; o agrupamento é só para leitura. O peso está em:
 *
 * - Brasil, porque o escudo é a informação principal do jogo e carreira
 *   brasileira começa e termina em clube pequeno.
 * - Ásia e Golfo, destino comum de fim de carreira e quase ausentes das
 *   fontes atuais.
 */
export const PAISES = {
  // --- Brasil
  BR: { qid: 'Q155', nome: 'Brasil' },

  // --- Ásia e Golfo: fim de carreira
  CN: { qid: 'Q148', nome: 'China' },
  KR: { qid: 'Q884', nome: 'Coreia do Sul' },
  TH: { qid: 'Q869', nome: 'Tailândia' },
  JP: { qid: 'Q17', nome: 'Japão' },
  VN: { qid: 'Q881', nome: 'Vietnã' },
  ID: { qid: 'Q252', nome: 'Indonésia' },
  MY: { qid: 'Q833', nome: 'Malásia' },
  IN: { qid: 'Q668', nome: 'Índia' },
  SA: { qid: 'Q851', nome: 'Arábia Saudita' },
  AE: { qid: 'Q878', nome: 'Emirados Árabes Unidos' },
  QA: { qid: 'Q846', nome: 'Catar' },
  KW: { qid: 'Q817', nome: 'Kuwait' },
  BH: { qid: 'Q398', nome: 'Bahrein' },
  OM: { qid: 'Q842', nome: 'Omã' },
  IR: { qid: 'Q794', nome: 'Irã' },
  UZ: { qid: 'Q265', nome: 'Uzbequistão' },
  KZ: { qid: 'Q232', nome: 'Cazaquistão' },
  AZ: { qid: 'Q227', nome: 'Azerbaijão' },

  // --- Américas
  AR: { qid: 'Q414', nome: 'Argentina' },
  UY: { qid: 'Q77', nome: 'Uruguai' },
  CL: { qid: 'Q298', nome: 'Chile' },
  CO: { qid: 'Q739', nome: 'Colômbia' },
  PY: { qid: 'Q733', nome: 'Paraguai' },
  PE: { qid: 'Q419', nome: 'Peru' },
  EC: { qid: 'Q736', nome: 'Equador' },
  BO: { qid: 'Q750', nome: 'Bolívia' },
  VE: { qid: 'Q717', nome: 'Venezuela' },
  MX: { qid: 'Q96', nome: 'México' },
  US: { qid: 'Q30', nome: 'Estados Unidos' },
  CA: { qid: 'Q16', nome: 'Canadá' },

  // --- Europa e arredores pouco cobertos pelos repositórios
  TR: { qid: 'Q43', nome: 'Turquia' },
  RU: { qid: 'Q159', nome: 'Rússia' },
  UA: { qid: 'Q212', nome: 'Ucrânia' },
  GR: { qid: 'Q41', nome: 'Grécia' },
  CY: { qid: 'Q229', nome: 'Chipre' },
  RS: { qid: 'Q403', nome: 'Sérvia' },
  BG: { qid: 'Q219', nome: 'Bulgária' },
  RO: { qid: 'Q218', nome: 'Romênia' },
  HR: { qid: 'Q224', nome: 'Croácia' },
  IL: { qid: 'Q801', nome: 'Israel' },
  AU: { qid: 'Q408', nome: 'Austrália' },
  ZA: { qid: 'Q258', nome: 'África do Sul' },
  EG: { qid: 'Q79', nome: 'Egito' },
  MA: { qid: 'Q1028', nome: 'Marrocos' },
  AO: { qid: 'Q916', nome: 'Angola' },
}
