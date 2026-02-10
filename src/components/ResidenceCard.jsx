import { useState } from 'react'

function ResidenceCard({ residence, onEnter }) {
  const [isFlipped, setIsFlipped] = useState(false)

  return (
    <div 
      className="residence-card-container h-80 perspective-1000"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className={`residence-card relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
        {/* Frente de la carta */}
        <div className="residence-card-face absolute w-full h-full backface-hidden rounded-2xl overflow-hidden shadow-xl">
          <img 
            src={residence.image} 
            alt={residence.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6">
            <h3 className="text-2xl font-bold text-white mb-1">{residence.name}</h3>
            <p className="text-white/90 text-sm flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {residence.city}, {residence.province}
            </p>
          </div>
        </div>

        {/* Parte trasera de la carta */}
        <div className="residence-card-face residence-card-back absolute w-full h-full backface-hidden rotate-y-180 rounded-2xl bg-white shadow-xl p-6 flex flex-col">
          <h3 className="text-2xl font-bold bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light bg-clip-text text-transparent mb-4">
            {residence.name}
          </h3>
          
          <div className="flex-1 space-y-3 overflow-y-auto">
            <div className="flex items-start gap-2 text-sm">
              <svg className="w-5 h-5 text-vitalia-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-700">Dirección</p>
                <p className="text-gray-600">{residence.address}</p>
                <p className="text-gray-600">{residence.city}, {residence.province}</p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <svg className="w-5 h-5 text-vitalia-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-700">Teléfono</p>
                <a href={`tel:${residence.phone}`} className="text-vitalia-purple hover:text-vitalia-purple-dark">
                  {residence.phone}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <svg className="w-5 h-5 text-vitalia-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <div>
                <p className="font-semibold text-gray-700">Capacidad</p>
                <p className="text-gray-600">{residence.capacity} plazas</p>
              </div>
            </div>

            {residence.services && (
              <div className="flex items-start gap-2 text-sm">
                <svg className="w-5 h-5 text-vitalia-purple flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="font-semibold text-gray-700">Servicios</p>
                  <p className="text-gray-600 text-xs">{residence.services.join(', ')}</p>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onEnter?.(residence)
            }}
            className="mt-4 w-full bg-gradient-to-r from-vitalia-purple to-vitalia-purple-light hover:from-vitalia-purple-dark hover:to-vitalia-purple text-white font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            Entrar a la residencia
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResidenceCard
