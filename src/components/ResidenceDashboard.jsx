import { useState } from 'react'
import Header from './Header'
import Registros from './Registros'

function ResidenceDashboard({ residence, onBack, userName, onLogout }) {
  const [currentSection, setCurrentSection] = useState('home') // 'home' | 'registros'

  // Secciones del dashboard
  const sections = [
    {
      id: 'registros',
      title: 'Registros',
      description: 'Gestión de registros diarios, semanales y mensuales',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600'
    }
    // Aquí se añadirán más secciones después
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

  // Vista principal del dashboard de la residencia
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header 
        userName={userName} 
        onLogout={onLogout}
        onSettings={() => alert('Configuración próximamente')}
      />
      
      {/* Contenido con padding-top para el header fijo */}
      <div className="pt-20">
      {/* Header de la residencia */}
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <button
            onClick={onBack}
            className="group flex items-center gap-2 text-gray-600 hover:text-white bg-gray-100 hover:bg-gradient-to-r hover:from-vitalia-purple hover:to-vitalia-purple-light px-4 py-2 rounded-xl transition-all duration-300 mb-4 shadow-sm hover:shadow-md"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Volver a residencias</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-vitalia-purple to-vitalia-purple-light flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">{residence.name}</h1>
              <p className="text-gray-600 flex items-center gap-2 mt-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {residence.address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Panel de Gestión</h2>
          <p className="text-gray-600">Selecciona un apartado para comenzar</p>
        </div>

        {/* Grid de secciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                <p className="text-gray-600 mb-4">
                  {section.description}
                </p>
                
                {/* Flecha */}
                <div className="flex items-center text-vitalia-purple opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-semibold mr-2">Acceder</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
      </div>
    </div>
  )
}

export default ResidenceDashboard
