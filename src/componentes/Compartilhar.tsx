import { useState } from 'react'

export function Compartilhar({ texto }: { texto: string }) {
  const [estado, setEstado] = useState<'pronto' | 'copiado' | 'falhou'>('pronto')

  async function compartilhar() {
    // no celular o menu nativo leva direto ao WhatsApp; no desktop cai na área de transferência
    if (navigator.share) {
      try {
        await navigator.share({ text: texto })
        return
      } catch (erro) {
        if (erro instanceof DOMException && erro.name === 'AbortError') return
      }
    }
    try {
      await navigator.clipboard.writeText(texto)
      setEstado('copiado')
      setTimeout(() => setEstado('pronto'), 2200)
    } catch {
      setEstado('falhou')
      setTimeout(() => setEstado('pronto'), 3000)
    }
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={compartilhar}
        className="cursor-pointer rounded-xl bg-cal px-7 py-3 text-[16px] text-relva-900 transition-opacity hover:opacity-90"
        style={{ fontStretch: '100%', fontWeight: 700 }}
      >
        {estado === 'copiado' ? 'Copiado' : 'Compartilhar resultado'}
      </button>
      {estado === 'copiado' && <span className="text-xs text-cal-700">Cole onde quiser.</span>}
      {estado === 'falhou' && <span className="text-xs text-erro">Não consegui copiar. Selecione o texto à mão.</span>}
    </div>
  )
}
