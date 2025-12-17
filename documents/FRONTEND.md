# 🎨 Frontend - Documentación

Frontend de AutoNotiSocial construido con **React 19**, **Vite** y **CSS vanilla**.

## 📁 Estructura del Proyecto

```
frontend/
├── src/
│   ├── main.jsx              # Punto de entrada React
│   ├── App.jsx               # Componente principal con routing
│   ├── App.css               # Estilos del App
│   ├── index.css             # Estilos globales y variables CSS
│   ├── assets/               # Recursos estáticos
│   ├── components/           # Componentes reutilizables
│   │   ├── Sidebar.jsx       # Navegación lateral
│   │   ├── Toast.jsx         # Notificaciones
│   │   └── ...
│   ├── views/                # Páginas principales
│   │   ├── Dashboard.jsx     # Panel principal
│   │   ├── Sources.jsx       # Gestión de fuentes
│   │   ├── Articles.jsx      # Listado de artículos
│   │   ├── Summaries.jsx     # Gestión de resúmenes
│   │   ├── Publications.jsx  # Publicaciones en RRSS
│   │   ├── Scheduler.jsx     # Programador de tareas
│   │   ├── Settings.jsx      # Configuración
│   │   └── Logs.jsx          # Visor de logs
│   ├── services/
│   │   └── api.js            # Cliente HTTP para la API
│   └── utils/
│       └── ...               # Funciones utilitarias
├── public/
├── index.html
├── vite.config.js
└── package.json
```

## 🖥️ Vistas

### 📊 Dashboard
Panel principal con estadísticas y resumen del sistema:
- Total de fuentes activas
- Artículos pendientes de procesar
- Resúmenes generados
- Publicaciones programadas
- Estado del scheduler
- Actividad reciente

### 📡 Sources (Fuentes)
Gestión de fuentes de noticias:
- Crear/Editar/Eliminar fuentes
- Configurar tipo (RSS, Web, API)
- Definir selectores CSS para scraping
- Activar/Desactivar fuentes
- Ejecutar scraping manual

### 📰 Articles (Artículos)
Listado de artículos extraídos:
- Filtrar por fuente, estado, fecha
- Ver contenido completo
- Generar resumen con IA
- Marcar como procesado

### 📝 Summaries (Resúmenes)
Gestión de resúmenes generados:
- Ver/Editar resúmenes
- Información del modelo IA usado
- Crear publicación desde resumen
- Regenerar resumen

### 📤 Publications (Publicaciones)
Gestión de publicaciones en redes sociales:
- Estado: borrador, programado, publicado, fallido
- Programar fecha de publicación
- Historial de publicaciones
- Estadísticas por plataforma

### ⏰ Scheduler (Programador)
Control del programador automático:
- Iniciar/Detener scheduler
- Ver estado actual
- Configurar intervalos
- Ejecutar ciclo manualmente
- Ver próxima ejecución

### ⚙️ Settings (Configuración)
Configuración del sistema:
- Proveedor de IA (Ollama/Gemini)
- Modelo de IA
- Credenciales de redes sociales
- Opciones de scraping

### 📋 Logs
Visor de logs del sistema:
- Filtrar por nivel (info, warn, error)
- Búsqueda en logs
- Actualización en tiempo real

---

## 🎨 Sistema de Diseño

### Variables CSS

```css
:root {
    /* Colores principales */
    --color-primary: #6366f1;
    --color-primary-hover: #4f46e5;
    --color-secondary: #64748b;
    
    /* Colores de estado */
    --color-success: #22c55e;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-info: #3b82f6;
    
    /* Fondos */
    --bg-primary: #0f172a;
    --bg-secondary: #1e293b;
    --bg-tertiary: #334155;
    
    /* Texto */
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --text-muted: #64748b;
    
    /* Bordes */
    --border-color: #334155;
    --border-radius: 8px;
    
    /* Sombras */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.3);
    
    /* Espaciado */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
}
```

### Componentes CSS

#### Botones
```css
.btn { /* Botón base */ }
.btn-primary { /* Azul/Púrpura principal */ }
.btn-secondary { /* Gris secundario */ }
.btn-success { /* Verde éxito */ }
.btn-danger { /* Rojo peligro */ }
.btn-ghost { /* Transparente */ }
```

#### Cards
```css
.card {
    background: var(--bg-secondary);
    border-radius: var(--border-radius);
    border: 1px solid var(--border-color);
    padding: var(--spacing-lg);
}
```

#### Formularios
```css
.form-group { /* Contenedor de campo */ }
.form-label { /* Etiqueta */ }
.form-input { /* Input/Textarea */ }
.form-select { /* Select dropdown */ }
```

---

## 🔌 Servicio API

### Configuración

```javascript
// src/services/api.js
const API_BASE = '/api';  // Proxy a través de Nginx

export const api = {
    // GET request
    get: (endpoint) => fetch(`${API_BASE}${endpoint}`).then(r => r.json()),
    
    // POST request
    post: (endpoint, data) => fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json()),
    
    // PUT request
    put: (endpoint, data) => fetch(`${API_BASE}${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    }).then(r => r.json()),
    
    // DELETE request
    delete: (endpoint) => fetch(`${API_BASE}${endpoint}`, {
        method: 'DELETE'
    }).then(r => r.json())
};
```

### Uso en Componentes

```jsx
import { api } from '../services/api';

function Sources() {
    const [sources, setSources] = useState([]);
    
    useEffect(() => {
        api.get('/sources').then(data => setSources(data));
    }, []);
    
    const handleCreate = async (newSource) => {
        const created = await api.post('/sources', newSource);
        setSources([...sources, created]);
    };
    
    return (/* ... */);
}
```

---

## 🏃 Ejecución Local

```bash
cd frontend

# Instalar dependencias
npm install

# Desarrollo (hot-reload en puerto 5173)
npm run dev

# Build de producción
npm run build

# Preview del build
npm run preview

# Lint
npm run lint
```

### Proxy en Desarrollo

El `vite.config.js` configura un proxy para redirigir `/api` al backend:

```javascript
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'http://localhost:3000',
                changeOrigin: true
            }
        }
    }
});
```

---

## 📦 Dependencias

| Paquete | Versión | Descripción |
|---------|---------|-------------|
| react | ^19.2.0 | Librería UI |
| react-dom | ^19.2.0 | Renderizado DOM |
| vite | ^7.2.4 | Build tool |
| @vitejs/plugin-react | ^5.1.1 | Plugin React para Vite |
