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

const formatearMes = (mesClave) => {
  if (!mesClave || !/^\d{4}-\d{2}$/.test(mesClave)) return textoSeguro(mesClave)
  const [year, month] = mesClave.split('-').map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
}

const renderRegistros = ({ doc, puntosAgua, registros, yInicial = 30 }) => {
  let y = yInicial

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

  renderRegistros({ doc, puntosAgua, registros, yInicial: 30 })

  const nombreArchivo = `registro-${nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`

  doc.save(nombreArchivo)
}

export const descargarPlantaPDFPorMeses = ({ nombrePlanta, puntosAgua, registrosPorMes = {}, mesesSeleccionados = [] }) => {
  const mesesValidos = (mesesSeleccionados || []).filter(m => registrosPorMes[m])
  if (mesesValidos.length === 0) return

  const doc = new jsPDF('p', 'mm', 'a4')
  const fechaHoy = new Date().toLocaleDateString('es-ES')
  const nombre = nombrePlanta || 'PLANTA'

  mesesValidos.forEach((mes, indexMes) => {
    if (indexMes > 0) doc.addPage()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(`Listado de Tareas - ${nombre}`, 14, 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Mes: ${formatearMes(mes)}`, 14, 22)
    doc.text(`Generado el: ${fechaHoy}`, 14, 27)

    renderRegistros({
      doc,
      puntosAgua,
      registros: registrosPorMes[mes] || {},
      yInicial: 35
    })
  })

  const nombreArchivo = `registro-${nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')}-meses-${new Date().toISOString().split('T')[0]}.pdf`

  doc.save(nombreArchivo)
}

export const descargarSemanalPDFPorSemanas = ({ registrosPorSemana = {}, semanasSeleccionadas = [] }) => {
  const semanasValidas = (semanasSeleccionadas || []).filter(semana => registrosPorSemana[semana])
  if (semanasValidas.length === 0) return

  const doc = new jsPDF('p', 'mm', 'a4')
  const fechaHoy = new Date().toLocaleDateString('es-ES')

  const formatearRangoSemana = (claveSemana) => {
    const [year, month, day] = claveSemana.split('-').map(Number)
    const inicio = new Date(year, month - 1, day)
    const fin = new Date(inicio)
    fin.setDate(inicio.getDate() + 6)
    const formato = (fecha) => fecha.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' })
    return `${formato(inicio)} - ${formato(fin)}`
  }

  semanasValidas.forEach((semana, index) => {
    if (index > 0) doc.addPage()

    const registro = registrosPorSemana[semana] || {}

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Registro Semanal - ACS + AFS', 14, 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Semana: ${formatearRangoSemana(semana)}`, 14, 22)
    doc.text(`Generado el: ${fechaHoy}`, 14, 27)

    let y = 38
    const filas = [
      ['Fecha', textoSeguro(registro.fecha)],
      ['Puntos de control', registro.puntosControlModo === 'especificar' ? textoSeguro(registro.puntosControlDetalle) : 'TODO EL EDIFICIO'],
      ['Observaciones', textoSeguro(registro.observaciones)],
      ['Incidencias', textoSeguro(registro.incidencias)],
      ['Firmado', textoSeguro(registro.firmado)]
    ]

    filas.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.text(`${label}:`, 14, y)
      doc.setFont('helvetica', 'normal')

      const lineas = doc.splitTextToSize(value, 145)
      doc.text(lineas, 52, y)
      y += Math.max(8, lineas.length * 5)

      if (y > 275) {
        doc.addPage()
        y = 18
      }
    })
  })

  const nombreArchivo = `registro-semanal-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}
