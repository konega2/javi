// Utilidades para gestión de tareas diarias

// Obtener la fecha de hoy en formato YYYY-MM-DD
export const obtenerFechaHoy = () => {
  return new Date().toISOString().split('T')[0]
}

const obtenerInicioSemanaISO = (fecha = new Date()) => {
  const fechaUTC = new Date(Date.UTC(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()))
  const dia = fechaUTC.getUTCDay() || 7
  fechaUTC.setUTCDate(fechaUTC.getUTCDate() + 1 - dia)
  return fechaUTC
}

export const obtenerClaveSemanaActual = () => {
  const inicioSemana = obtenerInicioSemanaISO(new Date())
  const year = inicioSemana.getUTCFullYear()
  const month = String(inicioSemana.getUTCMonth() + 1).padStart(2, '0')
  const day = String(inicioSemana.getUTCDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export const tareaSemanalCompletadaSemanaActual = () => {
  const registrosSemanales = JSON.parse(localStorage.getItem('vitalia.semanal.registros') || '{}')
  const claveSemanaActual = obtenerClaveSemanaActual()
  const registro = registrosSemanales[claveSemanaActual]

  if (!registro) return false

  const tienePuntosControl = Boolean(
    registro.puntosControlModo === 'todo_edificio' ||
    (registro.puntosControlModo === 'especificar' && registro.puntosControlDetalle)
  )

  return Boolean(registro.fecha && tienePuntosControl && registro.firmado)
}

export const obtenerClaveMesActual = () => {
  const fecha = new Date()
  const year = fecha.getFullYear()
  const month = String(fecha.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

export const tareaMensualCompletadaMesActual = () => {
  const registrosMensuales = JSON.parse(localStorage.getItem('vitalia.mensual.registros') || '{}')
  const claveMesActual = obtenerClaveMesActual()
  const registro = registrosMensuales[claveMesActual]

  if (!registro) return false

  const elevacion = registro.elevacion || registro
  const purga = registro.purga

  const elevacionCompleta = Boolean(
    elevacion?.fecha &&
    elevacion?.temperaturaAlcanza &&
    elevacion?.tiempoElevada &&
    elevacion?.firmado
  )

  const purgaCompleta = Boolean(
    purga?.fecha &&
    (
      purga?.puntoPurgaModo === 'todo_edificio' ||
      Boolean(purga?.puntoPurgaDetalle || purga?.puntoPurga)
    ) &&
    purga?.firmado
  )

  return elevacionCompleta && purgaCompleta
}

export const obtenerClaveTrimestreActual = () => {
  const fecha = new Date()
  const year = fecha.getFullYear()
  const quarter = Math.floor(fecha.getMonth() / 3) + 1
  return `${year}-T${quarter}`
}

const revisionTrimestralCompleta = (registro, prefijo) => {
  const estado = registro?.[`${prefijo}Estado`]
  const accion = registro?.[`${prefijo}Accion`]
  const detalle = registro?.[`${prefijo}AccionDetalle`]

  if (!estado || !accion) return false
  if (accion === 'accion_realizada') return Boolean(detalle && String(detalle).trim())
  return true
}

const instalacionTrimestralCompleta = (registro) => {
  if (!registro) return false

  return Boolean(
    registro.fecha &&
    registro.firmado &&
    revisionTrimestralCompleta(registro, 'funcionamiento') &&
    revisionTrimestralCompleta(registro, 'incrustaciones') &&
    revisionTrimestralCompleta(registro, 'corrosion') &&
    revisionTrimestralCompleta(registro, 'suciedad') &&
    revisionTrimestralCompleta(registro, 'limpiezaDesinfeccion')
  )
}

export const tareaTrimestralCompletadaTrimestreActual = () => {
  const registrosTrimestrales = JSON.parse(localStorage.getItem('vitalia.trimestral.registros') || '{}')
  const claveTrimestreActual = obtenerClaveTrimestreActual()
  const registro = registrosTrimestrales[claveTrimestreActual]

  if (!registro) return false

  return (
    instalacionTrimestralCompleta(registro.acumulador1) &&
    instalacionTrimestralCompleta(registro.acumulador2) &&
    instalacionTrimestralCompleta(registro.depositoAfs)
  )
}

export const obtenerClaveAnioActual = () => {
  return String(new Date().getFullYear())
}

const requiereDetalleAnual = (claveRevision, estado) => {
  const reglas = {
    funcionamiento: 'anomalias',
    mecanicoGeneral: 'insatisfactorio',
    higienicoGeneral: 'insatisfactorio',
    acumuladoresTemperatura: 'no_consigue_temperatura',
    acumuladoresDepositosLimpieza: 'insatisfactorio',
    terminalesCorrosionIncrustacion: 'insatisfactorio',
    terminalesAnulados: 'ausencia'
  }

  return reglas[claveRevision] === estado
}

export const tareaAnualCompletadaAnioActual = () => {
  const registrosAnuales = JSON.parse(localStorage.getItem('vitalia.anual.registros') || '{}')
  const claveAnio = obtenerClaveAnioActual()
  const registro = registrosAnuales[claveAnio]

  if (!registro) return false

  const revisiones = registro.revisiones || {}
  const claves = [
    'funcionamiento',
    'mecanicoGeneral',
    'higienicoGeneral',
    'acumuladoresTemperatura',
    'acumuladoresDepositosLimpieza',
    'terminalesCorrosionIncrustacion',
    'terminalesAnulados'
  ]

  const revisionesCompletas = claves.every((clave) => {
    const revision = revisiones[clave]
    if (!revision?.estado) return false

    if (requiereDetalleAnual(clave, revision.estado)) {
      return Boolean(revision.descripcionLocalizacion?.trim() && revision.accionCorrectora?.trim())
    }

    return true
  })

  return Boolean(registro.fecha && registro.firmaResponsable && revisionesCompletas)
}

const clavesRegistrosPorPlanta = {
  'sotano': 'vitalia.sotano.registros',
  'plantabaja': 'vitalia.plantabaja.registros',
  'primera_planta': 'vitalia.primeraplanta.registros',
  'segunda_planta': 'vitalia.segundaplanta.registros',
  'tercera_planta': 'vitalia.terceraplanta.registros',
  'cuarta_planta': 'vitalia.cuartaplanta.registros',
  'quinta_planta': 'vitalia.quintaplanta.registros'
}

const esRegistroCompleto = (registro) => {
  if (!registro) return false
  return Boolean(registro.fecha && registro.clr && registro.ph && registro.tAcu && registro.retorno && registro.firma)
}

const estaPlantaCompletadaHistoricamente = (planta, totalPuntos) => {
  if (totalPuntos <= 0) return false

  const clave = clavesRegistrosPorPlanta[planta]
  if (!clave) return false

  const registros = JSON.parse(localStorage.getItem(clave) || '{}')
  const completados = Object.values(registros).filter(esRegistroCompleto).length

  return completados >= totalPuntos
}

// Actualizar tarea diaria para una planta específica
export const actualizarTareaDiariaPlanta = (planta, puntoId, fecha, completada) => {
  const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
  
  if (!tareasDiarias[fecha]) {
    tareasDiarias[fecha] = {}
  }
  if (!tareasDiarias[fecha][planta]) {
    tareasDiarias[fecha][planta] = {}
  }
  
  tareasDiarias[fecha][planta][puntoId] = completada
  localStorage.setItem('vitalia.tareas.diarias', JSON.stringify(tareasDiarias))
}

// Verificar si una tarea se hizo hoy en una planta específica
export const seTareaHechaHoyPlanta = (planta, puntoId) => {
  const hoy = obtenerFechaHoy()
  const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
  return tareasDiarias[hoy]?.[planta]?.[puntoId] || false
}

// Contar tareas del día para una planta específica
export const contarTareasHoyPlanta = (planta, totalPuntos) => {
  const hoy = obtenerFechaHoy()
  const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
  const tareasHoy = tareasDiarias[hoy]?.[planta] || {}
  
  const completadasReales = Object.values(tareasHoy).filter(Boolean).length
  const completadaHistorica = estaPlantaCompletadaHistoricamente(planta, totalPuntos)
  const completadas = completadasReales > 0 || completadaHistorica ? 1 : 0
  const total = totalPuntos > 0 ? 1 : 0
  const pendientes = total > 0 ? total - completadas : 0
  
  return { completadas, total, pendientes, completadaHistorica }
}

// Contar todas las tareas pendientes del día (todas las plantas)
export const contarTodasTareasPendientesHoy = () => {
  const hoy = obtenerFechaHoy()
  const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
  const tareasHoy = tareasDiarias[hoy] || {}
  
  // Configuración de puntos por planta (esto se puede expandir)
  const configuracionPlantas = {
    'sotano': 20,
    'plantabaja': 13,
    'primera_planta': 31,
    'segunda_planta': 31,
    'tercera_planta': 29,
    'cuarta_planta': 31,
    'quinta_planta': 1
  }
  
  let algunRegistroCompletado = false
  
  Object.entries(configuracionPlantas).forEach(([planta, puntos]) => {
    if (puntos > 0) { // Solo contar plantas implementadas
      const tareasPlanta = tareasHoy[planta] || {}
      const completadasReales = Object.values(tareasPlanta).filter(Boolean).length
      const completadaHistorica = estaPlantaCompletadaHistoricamente(planta, puntos)
      const completadas = completadasReales > 0 || completadaHistorica ? 1 : 0
      if (completadas > 0) {
        algunRegistroCompletado = true
      }
    }
  })

  const totalCompletadas = algunRegistroCompletado ? 1 : 0
  const totalPuntos = 1
  const totalPendientes = totalPuntos - totalCompletadas
  
  return {
    completadas: totalCompletadas,
    pendientes: totalPendientes, 
    total: totalPuntos,
    porPlanta: Object.fromEntries(
      Object.entries(configuracionPlantas).map(([planta, puntos]) => {
        if (puntos > 0) {
          const tareasPlanta = tareasHoy[planta] || {}
          const completadasReales = Object.values(tareasPlanta).filter(Boolean).length
          const completadaHistorica = estaPlantaCompletadaHistoricamente(planta, puntos)
          const completadas = completadasReales > 0 || completadaHistorica ? 1 : 0
          return [planta, {
            completadas,
            total: 1,
            pendientes: 1 - completadas,
            completadaHistorica
          }]
        }
        return [planta, { completadas: 0, total: 0, pendientes: 0 }]
      })
    )
  }
}

// Obtener estadísticas de una planta para mostrar en las cards del diario
export const obtenerEstadisticasPlanta = (planta, totalPuntos = 0) => {
  const stats = contarTareasHoyPlanta(planta, totalPuntos)
  const porcentaje = stats.total > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0
  
  // Nueva lógica: verde si al menos 1 tarea completada
  let estado = 'pendiente' // 'pendiente', 'completo'
  let color = 'red' // 'red', 'green'
  
  if (stats.completadas >= 1) {
    estado = 'completo'
    color = 'green'
  }
  
  return {
    ...stats,
    porcentaje,
    estado,
    color
  }
}

// Verificar si todos los pisos activos tienen al menos 1 tarea completada
export const verificarTodosLosPisosCompletos = () => {
  const hoy = obtenerFechaHoy()
  const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
  const tareasHoy = tareasDiarias[hoy] || {}
  
  const pisosActivos = ['sotano', 'plantabaja', 'primera_planta', 'segunda_planta', 'tercera_planta', 'cuarta_planta', 'quinta_planta']
  
  for (const piso of pisosActivos) {
    const tareasPlanta = tareasHoy[piso] || {}
    const completadasReales = Object.values(tareasPlanta).filter(Boolean).length
    const completadaHistorica = estaPlantaCompletadaHistoricamente(piso, configuracionPuntosPorPlanta[piso] || 0)
    const completadas = completadasReales > 0 || completadaHistorica ? 1 : 0

    if (completadas > 0) {
      return true
    }
  }

  return false
}

const configuracionPuntosPorPlanta = {
  'sotano': 20,
  'plantabaja': 13,
  'primera_planta': 31,
  'segunda_planta': 31,
  'tercera_planta': 29,
  'cuarta_planta': 31,
  'quinta_planta': 1
}

// Reiniciar tareas específicas de una planta
export const reiniciarTareasPlanta = (planta, tareasIds = []) => {
  const hoy = obtenerFechaHoy()
  const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
  
  if (!tareasDiarias[hoy]) {
    tareasDiarias[hoy] = {}
  }
  if (!tareasDiarias[hoy][planta]) {
    tareasDiarias[hoy][planta] = {}
  }
  
  // Si tareasIds está vacío, reiniciar todas
  if (tareasIds.length === 0) {
    tareasDiarias[hoy][planta] = {}
  } else {
    // Reiniciar solo las seleccionadas
    tareasIds.forEach(id => {
      delete tareasDiarias[hoy][planta][id]
    })
  }
  
  localStorage.setItem('vitalia.tareas.diarias', JSON.stringify(tareasDiarias))
}

// Verificar si cambió el día y necesita reinicio automático
export const verificarYReiniciarDia = () => {
  const ultimoDiaGuardado = localStorage.getItem('vitalia.ultimo.dia')
  const hoy = obtenerFechaHoy()
  
  // Si es un día diferente, no hacer nada (las tareas se mantienen por día)
  // Solo actualizar el último día conocido
  if (ultimoDiaGuardado !== hoy) {
    localStorage.setItem('vitalia.ultimo.dia', hoy)
  }
  
  return hoy
}

const obtenerMesActual = () => {
  const fecha = new Date()
  return String(fecha.getFullYear())
}

export const rotarRegistrosPorMes = (plantaStorageKey) => {
  if (!plantaStorageKey) return { mesActual: obtenerMesActual(), rotado: false }

  const mesActual = obtenerMesActual()
  const claveMesActual = `vitalia.${plantaStorageKey}.registros.mes.actual`
  const claveRegistrosActuales = `vitalia.${plantaStorageKey}.registros`
  const claveHistoricoMensual = `vitalia.${plantaStorageKey}.registros.anuales`

  const mesGuardado = localStorage.getItem(claveMesActual)

  if (!mesGuardado) {
    localStorage.setItem(claveMesActual, mesActual)
    return { mesActual, rotado: false }
  }

  if (mesGuardado === mesActual) {
    return { mesActual, rotado: false }
  }

  const registrosMesAnterior = JSON.parse(localStorage.getItem(claveRegistrosActuales) || '{}')
  const historicoMensual = JSON.parse(localStorage.getItem(claveHistoricoMensual) || '{}')

  if (Object.keys(registrosMesAnterior).length > 0) {
    historicoMensual[mesGuardado] = {
      fechaArchivo: new Date().toISOString(),
      registros: registrosMesAnterior
    }
    localStorage.setItem(claveHistoricoMensual, JSON.stringify(historicoMensual))
  }

  localStorage.setItem(claveRegistrosActuales, JSON.stringify({}))
  localStorage.setItem(claveMesActual, mesActual)

  return { mesActual, rotado: true }
}