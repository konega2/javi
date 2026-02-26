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

const formatearAnio = (anioClave) => {
  if (!anioClave || !/^\d{4}$/.test(String(anioClave))) return textoSeguro(anioClave)
  return String(anioClave)
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

export const descargarPlantaPDFPorAnios = ({ nombrePlanta, puntosAgua, registrosPorAnio = {}, aniosSeleccionados = [] }) => {
  const aniosValidos = (aniosSeleccionados || []).filter(anio => registrosPorAnio[anio])
  if (aniosValidos.length === 0) return

  const doc = new jsPDF('p', 'mm', 'a4')
  const fechaHoy = new Date().toLocaleDateString('es-ES')
  const nombre = nombrePlanta || 'PLANTA'

  aniosValidos.forEach((anio, indexAnio) => {
    if (indexAnio > 0) doc.addPage()

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text(`Listado de Tareas - ${nombre}`, 14, 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Año: ${formatearAnio(anio)}`, 14, 22)
    doc.text(`Generado el: ${fechaHoy}`, 14, 27)

    renderRegistros({
      doc,
      puntosAgua,
      registros: registrosPorAnio[anio] || {},
      yInicial: 35
    })
  })

  const nombreArchivo = `registro-${nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-')}-anios-${new Date().toISOString().split('T')[0]}.pdf`

  doc.save(nombreArchivo)
}

export const descargarPlantaPDFPorMeses = ({ nombrePlanta, puntosAgua, registrosPorMes = {}, mesesSeleccionados = [] }) => {
  descargarPlantaPDFPorAnios({
    nombrePlanta,
    puntosAgua,
    registrosPorAnio: registrosPorMes,
    aniosSeleccionados: mesesSeleccionados
  })
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

export const descargarMensualPDFPorMeses = ({ registrosPorMes = {}, mesesSeleccionados = [] }) => {
  const mesesValidos = (mesesSeleccionados || []).filter((mes) => registrosPorMes[mes])
  if (mesesValidos.length === 0) return

  const doc = new jsPDF('p', 'mm', 'a4')
  const fechaHoy = new Date().toLocaleDateString('es-ES')

  const formatearMes = (mesClave) => {
    const [year, month] = mesClave.split('-').map(Number)
    return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  }

  mesesValidos.forEach((mes, index) => {
    if (index > 0) doc.addPage()

    const registroMes = registrosPorMes[mes] || {}
    const elevacion = registroMes.elevacion || registroMes
    const purga = registroMes.purga || {}

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Registro Mensual', 14, 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Mes: ${formatearMes(mes)}`, 14, 22)
    doc.text(`Generado el: ${fechaHoy}`, 14, 27)

    let y = 38

    const renderSeccion = (titulo, filas) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(12)
      doc.text(titulo, 14, y)
      y += 8

      filas.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(10)
        doc.text(`${label}:`, 14, y)
        doc.setFont('helvetica', 'normal')

        const lineas = doc.splitTextToSize(value, 145)
        doc.text(lineas, 62, y)
        y += Math.max(8, lineas.length * 5)

        if (y > 275) {
          doc.addPage()
          y = 18
        }
      })

      y += 4
    }

    renderSeccion('1) Elevar Tª acumuladores > 70°C', [
      ['Fecha', textoSeguro(elevacion.fecha)],
      ['Tª alcanza acumulador 1', textoSeguro(elevacion.temperaturaAlcanza)],
      ['Tiempo elevada', textoSeguro(elevacion.tiempoElevada)],
      ['Observaciones / Acciones correctoras', textoSeguro(elevacion.observacionesAcciones)],
      ['Firmado', textoSeguro(elevacion.firmado)],
      ['Verificado por', textoSeguro(elevacion.verificadoPor)],
      ['Fecha verificación', textoSeguro(elevacion.fechaVerificacion)]
    ])

    renderSeccion('2) Purga a través de válvulas de drenaje', [
      ['Fecha', textoSeguro(purga.fecha)],
      ['Punto de purga', textoSeguro(purga.puntoPurga)],
      ['Observaciones', textoSeguro(purga.observaciones)],
      ['Firmado', textoSeguro(purga.firmado)],
      ['Verificado por', textoSeguro(purga.verificadoPor)],
      ['Fecha verificación', textoSeguro(purga.fechaVerificacion)]
    ])
  })

  const nombreArchivo = `registro-mensual-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}

export const descargarTrimestralPDFPorTrimestres = ({ registrosPorTrimestre = {}, trimestresSeleccionados = [] }) => {
  const trimestresValidos = (trimestresSeleccionados || []).filter((trimestre) => registrosPorTrimestre[trimestre])
  if (trimestresValidos.length === 0) return

  const doc = new jsPDF('p', 'mm', 'a4')
  const fechaHoy = new Date().toLocaleDateString('es-ES')

  const formatearTrimestre = (clave) => {
    const [year, quarterRaw] = clave.split('-T')
    const quarter = Number(quarterRaw)
    const labels = {
      1: 'T1 (ene-mar)',
      2: 'T2 (abr-jun)',
      3: 'T3 (jul-sep)',
      4: 'T4 (oct-dic)'
    }
    return `${labels[quarter] || `T${quarter}`} ${year}`
  }

  const formatEstado = (estado, opcionA, opcionB) => {
    if (!estado) return '-'
    return estado === 'ok' ? opcionA : opcionB
  }

  const formatAccion = (accion, detalle) => {
    if (!accion) return '-'
    if (accion === 'no_precisa') return 'No se precisa'
    return detalle ? `Acción realizada: ${detalle}` : 'Acción realizada'
  }

  const renderInstalacion = (registro, titulo, yInicio) => {
    let y = yInicio

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.text(titulo, 14, y)
    y += 7

    const filas = [
      ['Fecha', textoSeguro(registro?.fecha)],
      ['Funcionamiento', `${formatEstado(registro?.funcionamientoEstado, 'No se observan anomalías', 'Se observan elementos defectuosos')} | ${formatAccion(registro?.funcionamientoAccion, registro?.funcionamientoAccionDetalle)}`],
      ['Incrustaciones', `${formatEstado(registro?.incrustacionesEstado, 'Ausencia de incrustaciones', 'Presencia de incrustaciones')} | ${formatAccion(registro?.incrustacionesAccion, registro?.incrustacionesAccionDetalle)}`],
      ['Corrosión', `${formatEstado(registro?.corrosionEstado, 'Ausencia de procesos de corrosión', 'Presencia de elementos de corrosión')} | ${formatAccion(registro?.corrosionAccion, registro?.corrosionAccionDetalle)}`],
      ['Suciedad', `${formatEstado(registro?.suciedadEstado, 'Ausencia', 'Presencia de sedimentos')} | ${formatAccion(registro?.suciedadAccion, registro?.suciedadAccionDetalle)}`],
      ['Limpieza y desinfección', `${formatEstado(registro?.limpiezaDesinfeccionEstado, 'Se realiza la limpieza y desinfección', 'No se realiza la limpieza y desinfección')} | ${formatAccion(registro?.limpiezaDesinfeccionAccion, registro?.limpiezaDesinfeccionAccionDetalle)}`],
      ['Observaciones', textoSeguro(registro?.observaciones)],
      ['Firma J. Torres e Hijos', textoSeguro(registro?.firmado)],
      ['Firma responsable', textoSeguro(registro?.firmaResponsable)]
    ]

    filas.forEach(([label, value]) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${label}:`, 14, y)
      doc.setFont('helvetica', 'normal')
      const lineas = doc.splitTextToSize(value, 140)
      doc.text(lineas, 65, y)
      y += Math.max(7, lineas.length * 5)

      if (y > 274) {
        doc.addPage()
        y = 18
      }
    })

    return y + 3
  }

  trimestresValidos.forEach((trimestre, index) => {
    if (index > 0) doc.addPage()

    const registro = registrosPorTrimestre[trimestre] || {}

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Registro Trimestral - ACU + Depósito', 14, 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Trimestre: ${formatearTrimestre(trimestre)}`, 14, 22)
    doc.text(`Generado el: ${fechaHoy}`, 14, 27)

    let y = 35
    y = renderInstalacion(registro.acumulador1, '1) ACUMULADOR 1', y)
    y = renderInstalacion(registro.acumulador2, '2) ACUMULADOR 2', y)
    renderInstalacion(registro.depositoAfs, '3) DEPÓSITO AFS', y)
  })

  const nombreArchivo = `registro-trimestral-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}

export const descargarAnualPDFPorAnios = ({ registrosPorAnio = {}, aniosSeleccionados = [] }) => {
  const aniosValidos = (aniosSeleccionados || []).filter((anio) => registrosPorAnio[anio])
  if (aniosValidos.length === 0) return

  const doc = new jsPDF('p', 'mm', 'a4')
  const fechaHoy = new Date().toLocaleDateString('es-ES')

  const formatEstado = (estado) => {
    const textos = {
      anomalias: 'Se observan anomalías',
      sin_anomalias: 'No se observan anomalías',
      satisfactorio: 'Satisfactorio',
      insatisfactorio: 'Insatisfactorio',
      consiguen_temperatura: 'Consiguen temperatura',
      no_consigue_temperatura: 'No consigue temperatura',
      presencia: 'Presencia',
      ausencia: 'Ausencia'
    }
    return textos[estado] || '-'
  }

  aniosValidos.forEach((anio, index) => {
    if (index > 0) doc.addPage()

    const registro = registrosPorAnio[anio] || {}
    const revisiones = registro.revisiones || {}

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(16)
    doc.text('Revisión General de los Sistemas de AFS - ACS', 14, 16)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.text(`Año: ${anio}`, 14, 22)
    doc.text(`Generado el: ${fechaHoy}`, 14, 27)

    let y = 36
    const filas = [
      ['Revisión general del funcionamiento', revisiones.funcionamiento],
      ['Estado mecánico general', revisiones.mecanicoGeneral],
      ['Estado higiénico general', revisiones.higienicoGeneral],
      ['Acumuladores - Temperatura', revisiones.acumuladoresTemperatura],
      ['Acumuladores y depósitos - Limpieza general', revisiones.acumuladoresDepositosLimpieza],
      ['Terminales - Corrosión/Incrustación', revisiones.terminalesCorrosionIncrustacion],
      ['Terminales - Anulados', revisiones.terminalesAnulados]
    ]

    filas.forEach(([titulo, revision]) => {
      const detalle = revision?.descripcionLocalizacion ? ` | Descripción: ${revision.descripcionLocalizacion}` : ''
      const accion = revision?.accionCorrectora ? ` | Acción: ${revision.accionCorrectora}` : ''
      const valor = `${formatEstado(revision?.estado)}${detalle}${accion}`

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.text(`${titulo}:`, 14, y)
      doc.setFont('helvetica', 'normal')

      const lineas = doc.splitTextToSize(valor, 130)
      doc.text(lineas, 70, y)
      y += Math.max(8, lineas.length * 5)

      if (y > 274) {
        doc.addPage()
        y = 18
      }
    })

    y += 4
    doc.setFont('helvetica', 'bold')
    doc.text('Observaciones:', 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(doc.splitTextToSize(textoSeguro(registro.observaciones), 170), 14, y + 6)

    y += 22
    doc.setFont('helvetica', 'bold')
    doc.text('Fecha:', 14, y)
    doc.setFont('helvetica', 'normal')
    doc.text(textoSeguro(registro.fecha), 30, y)

    doc.setFont('helvetica', 'bold')
    doc.text('Firma responsable:', 100, y)
    doc.setFont('helvetica', 'normal')
    doc.text(textoSeguro(registro.firmaResponsable), 142, y)
  })

  const nombreArchivo = `registro-anual-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}

export const descargarMuestrasAnualPDFPorAnios = ({ registrosPorAnio = {}, aniosSeleccionados = [] }) => {
  const aniosValidos = (aniosSeleccionados || []).filter((anio) => registrosPorAnio[anio])
  if (aniosValidos.length === 0) return

  const doc = new jsPDF('l', 'mm', 'a4')
  const fechaHoy = new Date().toLocaleDateString('es-ES')

  aniosValidos.forEach((anio, index) => {
    if (index > 0) doc.addPage()

    const registro = registrosPorAnio[anio] || {}
    const filas = Array.isArray(registro.filas) ? registro.filas : []

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(14)
    doc.text(`Recogido de Muestras Anual - ${anio}`, 10, 12)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Generado el: ${fechaHoy}`, 10, 17)

    const headers = ['Fecha', 'Punto muestreo', 'Analítica', 'Temp AFCH', 'Temp ACS', 'Cloro', 'Fecha resultado', 'Resultado', 'Empresa recoge', 'Persona recoge']
    const colWidths = [20, 38, 22, 22, 22, 16, 24, 28, 30, 28]
    let y = 24
    let x = 10

    doc.setFont('helvetica', 'bold')
    headers.forEach((h, i) => {
      doc.rect(x, y, colWidths[i], 8)
      doc.text(h, x + 1, y + 5)
      x += colWidths[i]
    })

    y += 8
    doc.setFont('helvetica', 'normal')

    const safeRows = filas.length > 0 ? filas : [{}]
    safeRows.forEach((fila) => {
      x = 10
      const values = [
        textoSeguro(fila.fecha),
        textoSeguro(fila.puntoMuestreo),
        textoSeguro(fila.analitica),
        textoSeguro(fila.temperaturaAfch),
        textoSeguro(fila.temperaturaAcs),
        textoSeguro(fila.cloro),
        textoSeguro(fila.fechaResultado),
        textoSeguro(fila.resultadoAnalitica),
        textoSeguro(fila.empresaRecoge),
        textoSeguro(fila.personaRecoge)
      ]

      values.forEach((value, i) => {
        doc.rect(x, y, colWidths[i], 8)
        const txt = doc.splitTextToSize(value, colWidths[i] - 2)
        doc.text(txt[0] || '-', x + 1, y + 5)
        x += colWidths[i]
      })

      y += 8
      if (y > 185) {
        doc.addPage()
        y = 20
      }
    })

    y += 6
    doc.setFont('helvetica', 'bold')
    doc.text('Observaciones:', 10, y)
    doc.setFont('helvetica', 'normal')
    doc.text(doc.splitTextToSize(textoSeguro(registro.observaciones), 260), 10, y + 5)

    y += 20
    doc.setFont('helvetica', 'bold')
    doc.text('Fecha:', 10, y)
    doc.setFont('helvetica', 'normal')
    doc.text(textoSeguro(registro.fecha), 22, y)
    doc.setFont('helvetica', 'bold')
    doc.text('Firma responsable:', 90, y)
    doc.setFont('helvetica', 'normal')
    doc.text(textoSeguro(registro.firmaResponsable), 126, y)
  })

  const nombreArchivo = `registro-muestras-anual-${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(nombreArchivo)
}
