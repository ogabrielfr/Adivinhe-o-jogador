import { useEffect, useState } from 'react'
import { msAteAmanha } from '../logica/diario'

function formatar(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  if (h > 0) return `${h}h ${String(m).padStart(2, '0')}min`
  if (m > 0) return `${m} min`
  return 'menos de um minuto'
}

export function ContagemRegressiva({ prefixo }: { prefixo: string }) {
  const [restante, setRestante] = useState(() => msAteAmanha())

  useEffect(() => {
    const id = setInterval(() => setRestante(msAteAmanha()), 30_000)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      {prefixo} {formatar(restante)}
    </>
  )
}
