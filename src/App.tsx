import { useCallback, useEffect, useMemo, useState } from 'react'
import { NIVEIS } from './dados/tipos'
import type { Jogador, Nivel } from './dados/tipos'
import { chaveDoDia, jogadorDoDia, numeroDoDia, PALPITES_AMBIGUOS } from './logica/diario'
import { formasDerivadas, formasExatas, normalizar, pareceIgual } from './logica/texto'
import { carregar, partidaNova, registrarResultado, salvar, TENTATIVAS } from './logica/armazenamento'
import { textoDeCompartilhamento } from './logica/compartilhar'
import { TelaInicial } from './componentes/TelaInicial'
import { TelaPartida } from './componentes/TelaPartida'
import type { ResultadoChute } from './componentes/TelaPartida'

export function App() {
  const [agora, setAgora] = useState(() => new Date())
  const chave = chaveDoDia(agora)
  const dia = numeroDoDia(agora)

  const [estado, setEstado] = useState(() => carregar(chave))
  const [nivelAtivo, setNivelAtivo] = useState<Nivel | null>(null)

  // a aba pode ficar aberta durante a virada do dia
  useEffect(() => {
    const id = setInterval(() => {
      const hoje = new Date()
      if (chaveDoDia(hoje) !== chave) {
        setAgora(hoje)
        setEstado(carregar(chaveDoDia(hoje)))
        setNivelAtivo(null)
      }
    }, 20_000)
    return () => clearInterval(id)
  }, [chave])

  useEffect(() => {
    salvar(estado)
  }, [estado])

  const jogadores = useMemo(
    () => Object.fromEntries(NIVEIS.map((n) => [n, jogadorDoDia(n, dia)])) as Record<Nivel, Jogador>,
    [dia],
  )

  const partidaDe = useCallback((nivel: Nivel) => estado.partidas[nivel] ?? partidaNova(), [estado.partidas])

  const aoChutar = useCallback(
    (nivel: Nivel, texto: string): ResultadoChute => {
      const limpo = texto.trim().replace(/\s+/g, ' ')
      if (!limpo) return 'vazio'

      const palpite = normalizar(limpo)
      if (!palpite) return 'vazio'
      const jogador = jogadores[nivel]

      /**
       * O nome canônico e os apelidos declarados ganham direto: se o palpite é
       * o nome do jogador, acertou, mesmo que outro jogador da biblioteca se
       * chame igual. O desempate só faz sentido para pedaço de nome.
       */
      const exato = formasExatas(jogador.nome, jogador.apelidos)
        .some((alvo) => pareceIgual(palpite, alvo))
      if (!exato && PALPITES_AMBIGUOS.has(palpite)) return 'ambiguo'

      const acertou = exato ||
        formasDerivadas(jogador.nome, jogador.apelidos).some((alvo) => pareceIgual(palpite, alvo))

      let resultado: ResultadoChute = 'errou'

      setEstado((anterior) => {
        const atual = anterior.partidas[nivel] ?? partidaNova()
        if (atual.status !== 'jogando') return anterior

        // o mesmo palpite repetido não consome chute
        if (atual.palpites.some((p) => normalizar(p) === palpite)) {
          resultado = 'errou'
          return anterior
        }

        const palpites = [...atual.palpites, limpo]
        const status = acertou ? 'ganhou' : palpites.length >= TENTATIVAS ? 'perdeu' : 'jogando'
        resultado = acertou ? 'acertou' : 'errou'

        const partidas = { ...anterior.partidas, [nivel]: { ...atual, palpites, status } }
        if (status === 'jogando') return { ...anterior, partidas }

        return {
          ...anterior,
          partidas,
          estatisticas: {
            ...anterior.estatisticas,
            [nivel]: registrarResultado(anterior.estatisticas[nivel], acertou, palpites.length, dia),
          },
        }
      })

      return resultado
    },
    [jogadores, dia],
  )

  const aoPedirDica = useCallback((nivel: Nivel) => {
    setEstado((anterior) => {
      const atual = anterior.partidas[nivel] ?? partidaNova()
      if (atual.usouDica || atual.status !== 'jogando') return anterior
      return { ...anterior, partidas: { ...anterior.partidas, [nivel]: { ...atual, usouDica: true } } }
    })
  }, [])

  if (nivelAtivo) {
    const restantes = NIVEIS.filter((n) => n !== nivelAtivo && partidaDe(n).status === 'jogando')
    return (
      <TelaPartida
        nivel={nivelAtivo}
        jogador={jogadores[nivelAtivo]}
        partida={partidaDe(nivelAtivo)}
        textoCompartilhar={textoDeCompartilhamento(dia, estado.partidas)}
        proximoNivel={restantes[0] ?? null}
        aoChutar={(texto) => aoChutar(nivelAtivo, texto)}
        aoPedirDica={() => aoPedirDica(nivelAtivo)}
        aoVoltar={() => setNivelAtivo(null)}
        aoIrPara={setNivelAtivo}
      />
    )
  }

  return (
    <TelaInicial
      dia={dia}
      data={agora}
      partidas={estado.partidas}
      estatisticas={estado.estatisticas}
      aoEscolher={setNivelAtivo}
    />
  )
}
