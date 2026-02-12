import { jsPDF } from 'jspdf'

const textoSeguro = (valor) => {
  if (valor === null || valor === undefined || valor === '') return '-'
  return String(valor)
}

const esRegistroCompleto = (registro) => {
  if (!registro) return false
  return Boolean(registro.fecha && registro.clr && registro.ph && registro.tAcu && registro.retorno && registro.firma)
}

const obtenerFormatoImagen = (dataUrl) => {
  if (!dataUrl || typeof dataUrl !== 'string') return 'JPEG'
  if (dataUrl.includes('image/png')) return 'PNG'
  if (dataUrl.includes('image/webp')) return 'WEBP'
  return 'JPEG'
}

export const descargarPlantaPDF = ({ nombrePlanta, puntosAgua, registros }) => {
  const doc = new jsPDF('p', 'mm', 'a4')
  const fechaHoy = new Date().toLocaleDateString('es-ES')
  const nombre = nombrePlanta || 'PLANTA'

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.text(`Listado de Tareas - ${nombre}`, 14, 16)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Generado el: ${fechaHoy}`, 14, 22)

  let y = 30

  puntosAgua.forEach((punto, index) => {
    const registro = registros?.[punto.id] || registros?.[String(punto.id)] || {}
    const tieneFoto = Boolean(registro.foto)
    const bloqueAlto = tieneFoto ? 52 : 34

    if (y + bloqueAlto > 285) {
      doc.addPage()
      y = 16
    }

    doc.setDrawColor(210, 210, 210)
    doc.rect(10, y - 4, 190, bloqueAlto)

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    const titulo = `${index + 1}. ${textoSeguro(punto.zona)} | ${textoSeguro(punto.tipoTerminal)} | Nº Grifo: ${textoSeguro(punto.numGrifo)}`
    doc.text(titulo, 14, y + 2)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const estado = esRegistroCompleto(registro) ? 'Completada' : 'Pendiente'
    doc.text(`Estado: ${estado}`, 14, y + 8)
    doc.text(`Fecha: ${textoSeguro(registro.fecha)}   CLR: ${textoSeguro(registro.clr)}   pH: ${textoSeguro(registro.ph)}`, 14, y + 14)
    doc.text(`Tª ACU: ${textoSeguro(registro.tAcu)}   Retorno: ${textoSeguro(registro.retorno)}   Firma: ${textoSeguro(registro.firma)}`, 14, y + 20)

    if (registro.observaciones) {
      const observaciones = doc.splitTextToSize(`Obs: ${textoSeguro(registro.observaciones)}`, 130)
      doc.text(observaciones.slice(0, 2), 14, y + 26)
    }

    if (tieneFoto) {
      try {
        const formato = obtenerFormatoImagen(registro.foto)
        doc.setFontSize(8)
        doc.text('Imagen', 152, y + 2)
        doc.addImage(registro.foto, formato, 150, y + 4, 46, 40)
      } catch {
        doc.setFontSize(8)
        doc.text('Imagen no disponible', 150, y + 10)
      }
    }

    y += bloqueAlto + 4
  })

  const nombreArchivo = `registro-${nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`

  doc.save(nombreArchivo)
}
