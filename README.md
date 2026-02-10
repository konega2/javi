# Panel de Gestión Vitalia

Sistema completo de gestión para Vitalia (Residencias de Mayores), desarrollado con React (Vite) y Tailwind CSS.

## 🎨 Características

### Panel de Inicio de Sesión
- ✅ Diseño moderno y profesional con colores corporativos de Vitalia (morado y verde)
- ✅ Formulario de inicio de sesión con validación básica
- ✅ Campo de usuario (texto libre)
- ✅ Campo de contraseña con botón mostrar/ocultar
- ✅ Checkbox "Recordarme"
- ✅ Modal para recuperación de contraseña
- ✅ Animaciones suaves y efectos glassmorphism

### Dashboard de Residencias
- ✅ **Header fijo** con logo, perfil de usuario y menú desplegable
- ✅ **Menú de usuario** con opciones de configuración y cerrar sesión
- ✅ **Cartas flip** de residencias con animación 3D:
  - Frente: Imagen de la residencia con nombre y ubicación
  - Reverso: Información detallada (dirección, teléfono, capacidad, servicios)
  - Botón "Entrar a la residencia"
- ✅ **Sistema de filtros avanzado**:
  - **Búsqueda** por nombre, ciudad o provincia
  - **Filtro por Comunidad Autónoma** (prevalece sobre todo)
  - **Ordenación múltiple** (se aplica después del filtro de comunidad):
    - Nombre (A-Z / Z-A)
    - Más cercanas (usa geolocalización real)
    - Más visitadas
    - Mayor/Menor capacidad
  - Muestra la distancia en kilómetros cuando se ordena por proximidad
  - Contador de resultados en tiempo real con indicador de ordenación activa
- ✅ **Diseño responsive** para mobile, tablet y desktop
- ✅ **Flip automático** en hover (desktop) o click/tap (mobile/tablet)

### Residencias Incluidas
- Vitalia Favara (Favara, Valencia)
- Vitalia Gandía (Gandía, Valencia)

## 🚀 Instalación

1. Instala las dependencias:

```bash
npm install
```

## 💻 Desarrollo

Para ejecutar el proyecto en modo desarrollo:

```bash
npm run dev
```

El proyecto estará disponible en `http://localhost:5173`

## 📦 Build para Producción

Para crear una versión optimizada para producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/`

## 🌐 Desplegar en Vercel

### Opción 1: Desde la línea de comandos

1. Instala Vercel CLI (si no lo tienes):

```bash
npm install -g vercel
```

2. Despliega el proyecto:

```bash
vercel
```

3. Para producción:

```bash
vercel --prod
```

### Opción 2: Desde la interfaz web de Vercel

1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "Add New Project"
3. Importa tu repositorio de Git (GitHub, GitLab o Bitbucket)
4. Vercel detectará automáticamente que es un proyecto Vite
5. Haz clic en "Deploy"

¡Listo! Tu aplicación estará desplegada en unos segundos.

### Opción 3: Deploy directo desde carpeta local

Si no tienes el proyecto en Git:

```bash
vercel --prod
```

Vercel subirá los archivos directamente desde tu carpeta local.

## 📝 Estructura del Proyecto

```
vitalia/
├── src/
│   ├── components/
│   │   ├── Dashboard.jsx      # Panel principal de residencias
│   │   ├── Header.jsx          # Barra superior con menú de usuario
│   │   └── ResidenceCard.jsx   # Carta de residencia con flip
│   ├── App.jsx                 # Componente principal (Login + Dashboard)
│   ├── main.jsx                # Punto de entrada de React
│   └── index.css               # Estilos globales con Tailwind + animaciones
├── public/
│   └── vitalia.png             # Logo corporativo
├── index.html                  # HTML base
├── package.json                # Dependencias
├── vite.config.js              # Configuración de Vite
├── tailwind.config.js          # Configuración de Tailwind CSS
└── postcss.config.js           # Configuración de PostCSS
```

## 🎯 Uso

1. **Iniciar sesión**: Introduce cualquier usuario y contraseña para acceder
2. **Ver residencias**: Pasa el cursor (desktop) o toca (mobile) una carta para voltearla
3. **Filtrar y ordenar**: 
   - Usa la **búsqueda** para encontrar por nombre, ciudad o provincia
   - Selecciona una **Comunidad Autónoma** para filtrar (este filtro prevalece)
   - Elige cómo **ordenar** las residencias filtradas:
     - Por nombre (alfabéticamente A-Z o Z-A)
     - Por proximidad (más cercanas primero - requiere tu ubicación)
     - Por visitas (más visitadas primero)
     - Por capacidad (mayor o menor)
4. **Ordenar por proximidad**: 
   - Selecciona "Más cercanas" en el filtro de ordenación
   - El navegador pedirá permiso para acceder a tu ubicación
   - Las residencias se ordenarán de más cerca a más lejos
   - Se mostrará la distancia en kilómetros en cada carta
5. **Perfil**: Haz clic en tu avatar (arriba derecha) para ver opciones
6. **Cerrar sesión**: Usa el menú de usuario para salir

> **Nota**: La función de proximidad requiere que permitas el acceso a tu ubicación en el navegador. Si no otorgas permiso, automáticamente se ordenará por nombre.

## 🎨 Colores Corporativos

- **Morado Principal**: `#7C3AED`
- **Morado Oscuro**: `#6D28D9`
- **Morado Claro**: `#8B5CF6`
- **Verde Suave**: `#86EFAC`
- **Verde Claro**: `#BBF7D0`

## 📱 Contacto para Recuperación de Contraseña

Para restablecer la contraseña o conocer la actual, contacta al: **653 26 53 48**

## 🛠️ Tecnologías Utilizadas

- React 18
- Vite 5
- Tailwind CSS 3
- PostCSS
- Autoprefixer

## 📝 Estructura del Proyecto

```
vitalia/
├── src/
│   ├── App.jsx          # Componente principal con el login
│   ├── main.jsx         # Punto de entrada de React
│   └── index.css        # Estilos globales con Tailwind
├── index.html           # HTML base
├── package.json         # Dependencias
├── vite.config.js       # Configuración de Vite
├── tailwind.config.js   # Configuración de Tailwind CSS
└── postcss.config.js    # Configuración de PostCSS
```

## 📄 Licencia

© 2026 Vitalia - Residencias de Mayores
