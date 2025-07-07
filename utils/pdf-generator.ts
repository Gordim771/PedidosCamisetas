import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { Pedido } from "../types/pedido"

export async function gerarPDF(pedido: Pedido, resumo: Array<{ tamanho: string; quantidade: number }>) {
  // Criar elemento temporário para captura
  const elementoCaptura = document.createElement("div")
  elementoCaptura.style.position = "absolute"
  elementoCaptura.style.left = "-9999px"
  elementoCaptura.style.top = "0"
  elementoCaptura.style.width = "800px"
  elementoCaptura.style.backgroundColor = "white"
  elementoCaptura.style.padding = "40px"
  elementoCaptura.style.fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"

  // Criar conteúdo HTML para o PDF
  elementoCaptura.innerHTML = `
    <div style="text-align: center; margin-bottom: 40px; padding: 30px; background: linear-gradient(135deg, #1e40af 0%, #3730a3 100%); border-radius: 16px; color: white;">
      <div style="display: inline-flex; align-items: center; justify-content: center; width: 80px; height: 80px; background: rgba(255,255,255,0.2); border-radius: 50%; margin-bottom: 20px;">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23Z"/>
        </svg>
      </div>
      <h1 style="margin: 0; font-size: 32px; font-weight: 800; margin-bottom: 8px;">UMADCLI Store</h1>
      <p style="margin: 0; font-size: 18px; opacity: 0.9;">Pedido de Camisetas</p>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 40px;">
      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; border-left: 4px solid #3b82f6;">
        <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #1e40af; font-weight: 700;">📍 Informações da Congregação</h2>
        <div style="space-y: 12px;">
          <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #374151;">Congregação:</strong> <span style="color: #1f2937;">${pedido.congregacao.nome}</span></p>
          <p style="margin: 8px 0; font-size: 16px;"><strong style="color: #374151;">Líder/WhatsApp:</strong> <span style="color: #1f2937;">${pedido.congregacao.lider}</span></p>
        </div>
      </div>
      
      <div style="background: #f0fdf4; padding: 25px; border-radius: 12px; border-left: 4px solid #22c55e;">
        <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #16a34a; font-weight: 700;">📊 Resumo Rápido</h2>
        <div style="text-align: center;">
          <div style="font-size: 36px; font-weight: 800; color: #16a34a; margin-bottom: 8px;">${resumo.reduce((total, item) => total + item.quantidade, 0)}</div>
          <div style="font-size: 16px; color: #374151; font-weight: 600;">Total de Camisetas</div>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 40px;">
      <h2 style="margin-bottom: 20px; font-size: 24px; color: #1e40af; font-weight: 700; display: flex; align-items: center;">
        🛍️ Detalhes do Pedido
      </h2>
      <div style="background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: linear-gradient(90deg, #3b82f6 0%, #1d4ed8 100%); color: white;">
              <th style="padding: 16px; text-align: left; font-weight: 700; font-size: 16px;">Tamanho</th>
              <th style="padding: 16px; text-align: center; font-weight: 700; font-size: 16px;">Quantidade</th>
              <th style="padding: 16px; text-align: right; font-weight: 700; font-size: 16px;">Categoria</th>
            </tr>
          </thead>
          <tbody>
            ${resumo
              .map(
                (item, index) => `
              <tr style="background: ${index % 2 === 0 ? "#f8fafc" : "white"}; border-bottom: 1px solid #e2e8f0;">
                <td style="padding: 16px; font-weight: 600; color: #374151;">${item.tamanho}</td>
                <td style="padding: 16px; text-align: center;">
                  <span style="background: #dbeafe; color: #1e40af; padding: 6px 12px; border-radius: 20px; font-weight: 700; font-size: 14px;">
                    ${item.quantidade}
                  </span>
                </td>
                <td style="padding: 16px; text-align: right; color: #6b7280; font-size: 14px;">
                  ${item.tamanho.includes("Nº") ? "Infantil" : "Adulto"}
                </td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </div>

    ${
      pedido.observacoes
        ? `
      <div style="margin-bottom: 40px;">
        <h2 style="margin-bottom: 15px; font-size: 20px; color: #ea580c; font-weight: 700;">📝 Observações Especiais</h2>
        <div style="background: #fff7ed; padding: 20px; border-radius: 12px; border-left: 4px solid #ea580c;">
          <p style="margin: 0; white-space: pre-wrap; color: #9a3412; font-size: 15px; line-height: 1.6;">${pedido.observacoes}</p>
        </div>
      </div>
    `
        : ""
    }

    <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; border-radius: 16px; color: #92400e; margin-bottom: 30px;">
      <h2 style="margin: 0 0 25px 0; font-size: 24px; font-weight: 800; color: #92400e; display: flex; align-items: center;">
        💳 Instruções de Pagamento
      </h2>
      
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin-bottom: 25px;">
        <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #92400e;">🏦 Chave PIX</h3>
          <p style="margin: 0; font-family: 'Courier New', monospace; font-size: 16px; font-weight: 600; color: #1f2937; background: #f3f4f6; padding: 8px; border-radius: 6px;">${pedido.instrucoesPagamento.pixCnpj}</p>
        </div>
        
        <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 12px;">
          <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #92400e;">📱 Enviar Comprovante</h3>
          <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${pedido.instrucoesPagamento.whatsappComprovante}</p>
        </div>
      </div>
      
      <div style="background: rgba(255,255,255,0.9); padding: 20px; border-radius: 12px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; text-align: center;">
          <div>
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #92400e;">📅 Prazo Limite</h4>
            <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1f2937;">${pedido.instrucoesPagamento.dataLimite}</p>
          </div>
          <div>
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #16a34a;">✅ Até o Prazo</h4>
            <p style="margin: 0; font-size: 18px; font-weight: 800; color: #16a34a;">${pedido.instrucoesPagamento.valorAntes}</p>
          </div>
          <div>
            <h4 style="margin: 0 0 8px 0; font-size: 14px; font-weight: 700; color: #dc2626;">⚠️ Após o Prazo</h4>
            <p style="margin: 0; font-size: 18px; font-weight: 800; color: #dc2626;">${pedido.instrucoesPagamento.valorApos}</p>
          </div>
        </div>
      </div>
    </div>

    <div style="text-align: center; padding: 20px; background: #f8fafc; border-radius: 12px; border: 2px dashed #cbd5e1;">
      <p style="margin: 0; color: #64748b; font-size: 14px; font-weight: 600;">
        📄 Pedido gerado em ${new Date().toLocaleDateString("pt-BR")} às ${new Date().toLocaleTimeString("pt-BR")}
      </p>
      <p style="margin: 8px 0 0 0; color: #64748b; font-size: 12px;">
        UMADCLI Store - Sistema de Pedidos de Camisetas
      </p>
    </div>
  `

  // Adicionar ao DOM temporariamente
  document.body.appendChild(elementoCaptura)

  try {
    // Capturar como imagem
    const canvas = await html2canvas(elementoCaptura, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      width: 800,
      height: elementoCaptura.scrollHeight,
    })

    // Criar PDF
    const pdf = new jsPDF("p", "mm", "a4")
    const imgData = canvas.toDataURL("image/png")

    // Calcular dimensões para caber na página
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height

    const ratio = Math.min((pdfWidth - 20) / imgWidth, (pdfHeight - 20) / imgHeight)
    const finalWidth = imgWidth * ratio
    const finalHeight = imgHeight * ratio

    // Centralizar na página
    const x = (pdfWidth - finalWidth) / 2
    const y = 10

    pdf.addImage(imgData, "PNG", x, y, finalWidth, finalHeight)

    // Salvar PDF
    const nomeArquivo = `pedido-${pedido.congregacao.nome.toLowerCase().replace(/\\s+/g, "-")}.pdf`
    pdf.save(nomeArquivo)
  } finally {
    // Remover elemento temporário
    document.body.removeChild(elementoCaptura)
  }
}
