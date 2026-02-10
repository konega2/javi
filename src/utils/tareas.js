// Utilidades para gestión de tareas diarias

// Obtener la fecha de hoy en formato YYYY-MM-DD
export const obtenerFechaHoy = () => {
  return new Date().toISOString().split('T')[0]
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
  
  const completadas = Object.values(tareasHoy).filter(Boolean).length
  const total = totalPuntos
  const pendientes = total - completadas
  
  return { completadas, total, pendientes }
}

// Contar todas las tareas pendientes del día (todas las plantas)
export const contarTodasTareasPendientesHoy = () => {
  const hoy = obtenerFechaHoy()
  const tareasDiarias = JSON.parse(localStorage.getItem('vitalia.tareas.diarias') || '{}')
  const tareasHoy = tareasDiarias[hoy] || {}
  
  // Configuración de puntos por planta (esto se puede expandir)
  const configuracionPlantas = {
    'sotano': 20,
    'planta_baja': 0,      // Aún no implementado
    'primera_planta': 0,   // Aún no implementado
    'segunda_planta': 0,   // Aún no implementado
    'tercera_planta': 0,   // Aún no implementado
    'cuarta_planta': 0,    // Aún no implementado
    'quinta_planta': 0     // Aún no implementado
  }
  
  let totalPendientes = 0
  let totalCompletadas = 0
  let totalPuntos = 0
  
  Object.entries(configuracionPlantas).forEach(([planta, puntos]) => {
    if (puntos > 0) { // Solo contar plantas implementadas
      const tareasPlanta = tareasHoy[planta] || {}
      const completadas = Object.values(tareasPlanta).filter(Boolean).length
      
      totalCompletadas += completadas
      totalPuntos += puntos
      totalPendientes += (puntos - completadas)
    }
  })
  
  return {
    completadas: totalCompletadas,
    pendientes: totalPendientes, 
    total: totalPuntos,
    porPlanta: Object.fromEntries(
      Object.entries(configuracionPlantas).map(([planta, puntos]) => {
        if (puntos > 0) {
          const tareasPlanta = tareasHoy[planta] || {}
          const completadas = Object.values(tareasPlanta).filter(Boolean).length
          return [planta, {
            completadas,
            total: puntos,
            pendientes: puntos - completadas
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
  const porcentaje = totalPuntos > 0 ? Math.round((stats.completadas / stats.total) * 100) : 0
  
  let estado = 'pendiente' // 'pendiente', 'progreso', 'completo'
  let color = 'red' // 'red', 'yellow', 'green'
  
  if (stats.completadas === stats.total && stats.total > 0) {
    estado = 'completo'
    color = 'green'
  } else if (stats.completadas > 0) {
    estado = 'progreso'
    color = 'yellow'
  }
  
  return {
    ...stats,
    porcentaje,
    estado,
    color
  }
}