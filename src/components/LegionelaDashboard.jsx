import { useState } from 'react'
import Header from './Header'
import Registros from './Registros'

function LegionelaDashboard({ onBack, userName, onLogout }) {
  const [currentSection, setCurrentSection] = useState('home') // 'home' | 'registros'

  // Secciones del dashboard de Legionela
  const sections = [
    {
      id: 'registros',
      title: 'Registros',
      description: 'Control de registros diarios, semanales, mensuales y anuales',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600'
    }
    // Más secciones se añadirán en el futuro
  ]

  const handleSectionClick = (sectionId) => {
    setCurrentSection(sectionId)
  }

  const handleBackToHome = () => {
    setCurrentSection('home')
  }

  // Si estamos en la sección de registros, mostrar ese componente
  if (currentSection === 'registros') {
    return <Registros onBack={handleBackToHome} userName={userName} onLogout={onLogout} />
  }

  // Si estamos en otras secciones, mostrar mensaje temporial
  if (currentSection !== 'home') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header 
          userName={userName} 
          onLogout={onLogout}
          onSettings={() => alert('Configuración próximamente')}
        />
        
        <div className="pt-20 p-6">
          <div className="max-w-7xl mx-auto">
            <button
              onClick={handleBackToHome}
              className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Volver a Legionela</span>
            </button>
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Sección en desarrollo</h2>
              <p className="text-gray-600">Esta funcionalidad estará disponible próximamente.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Vista principal del dashboard de Legionela
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        userName={userName} 
        onLogout={onLogout}
        onSettings={() => alert('Configuración próximamente')}
      />
      
      {/* Contenido con padding-top para el header fijo */}
      <div className="pt-20 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={onBack}
              className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2.5 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
            >
              <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="font-medium">Volver a gestión</span>
            </button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
              Control de Legionela
            </h1>
            <p className="text-gray-600 mt-2">Sistema integral de prevención y control de Legionela</p>
          </div>

          {/* Grid de secciones */}
          <div className="flex justify-center">
            <div className="w-full max-w-md">
              {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => handleSectionClick(section.id)}
                className="group relative bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 text-left overflow-hidden transform hover:-translate-y-2"
              >
                {/* Fondo degradado */}
                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${section.color} opacity-10 rounded-bl-full transition-all duration-300 group-hover:w-full group-hover:h-full group-hover:opacity-20`}></div>
                
                {/* Contenido */}
                <div className="relative z-10">
                  <div className={`inline-flex p-4 rounded-xl bg-gradient-to-br ${section.color} text-white mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {section.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-3 group-hover:text-vitalia-purple transition-colors">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{section.description}</p>

                  {/* Flecha */}
                  <div className="mt-6 flex items-center text-vitalia-purple opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-semibold mr-2">Acceder</span>
                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LegionelaDashboard