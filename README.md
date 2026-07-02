# WebExpress - Pikkup (Sistema de Rastreo de Envíos)

¡Bienvenido al repositorio de **WebExpress**! Este proyecto es una aplicación web interactiva para el rastreo y seguimiento de envíos llamada **Pikkup**. 

El propósito principal de este repositorio es simular y demostrar el ciclo de vida y la evolución incremental de un producto de software, desde un prototipo estático inicial hasta una aplicación web premium completamente funcional con mapas dinámicos y simulación en tiempo real.

---

## 📈 Evolución y Versiones del Software

Para simular cómo cambia el software a lo largo del tiempo, el repositorio está estructurado para ser visualizado de dos formas complementarias:
1. **Simulador Interactivo en Vivo (Rama `main`):** Una barra de herramientas integrada en el entorno de desarrollo que permite alternar y probar las 4 versiones directamente desde el navegador de manera visual.
2. **Ramas Históricas de Git (Código Limpio):** Ramas dedicadas donde el código fuente de la aplicación refleja *únicamente* el código correspondiente a esa etapa, ideal para auditorías de calidad o revisión de la evolución del código fuente.

### Las 4 Etapas del Desarrollo:

1. **📁 Código Base (Versión Estática):**
   - Representa el diseño visual inicial (Mockup).
   - Formulario de búsqueda estático (inactivo) y advertencias para el usuario.
   - Sin lógica de estados de React compleja ni servicios externos.

2. **🔍 Versión 1 (Búsqueda de Guías e Historial Simple):**
   - Implementa estados reactivos de búsqueda (`useState`).
   - Conexión y consulta de datos simulados (Mock data) para números de guía.
   - Muestra el estado del paquete e historial detallado en una lista textual estándar.

3. **🗺️ Versión 2 (Integración de Mapa Interactivo):**
   - Incorpora la biblioteca cartográfica **Leaflet** mediante CDN.
   - Renderiza un mapa interactivo dinámico que posiciona un marcador en las coordenadas de latitud/longitud del paquete.
   - Sincronización del mapa con las búsquedas realizadas.

4. **⚡ Versión 3 (Premium - Interfaz Avanzada, Simulación y Modo Oscuro):**
   - Línea de tiempo estilizada con iconos dinámicos y animaciones de pulso.
   - **Simulación en Tiempo Real (Live Tracking):** Permite simular el movimiento físico del paquete en el mapa a lo largo de una ruta de entrega en Lima (de Callao a Miraflores), actualizando el mapa e historial dinámicamente.
   - **Modo Oscuro (Dark Theme):** Switch de apariencia con transiciones de color suaves y mapas con estilos personalizados oscuros.

---

## 🛠️ Estructura del Proyecto

El repositorio está organizado de la siguiente manera:

```text
WebExpress/
├── .github/workflows/       # Pipelines de CI/CD para GitHub Actions
│   ├── ci.yml               # Integración Continua (ESLint y Build)
│   └── cd.yml               # Despliegue Continuo (Generación de Artefactos)
├── public/                  # Favicons y recursos estáticos
├── src/
│   ├── assets/              # Logos e imágenes del sistema
│   ├── versions/            # Código fuente de las versiones evolutivas
│   │   ├── base/            # Código inicial estático
│   │   ├── v1/              # Versión con búsqueda y texto plano
│   │   ├── v2/              # Versión con mapas Leaflet
│   │   └── v3/              # Versión Premium, Modo Oscuro y Simulación
│   ├── App.css              # Hoja de estilos global y temas
│   ├── App.jsx              # Panel principal / Selector de versiones
│   ├── index.css            # Estilos de inicialización
│   └── main.jsx             # Punto de entrada de React
├── .gitignore               # Configuración de exclusiones de Git
├── eslint.config.js         # Reglas de calidad y formato de código (ESLint)
├── index.html               # Archivo HTML principal de montaje
├── package.json             # Dependencias y scripts de desarrollo
└── vite.config.js           # Configuración del compilador Vite
```

---

## 🚀 Instalación y Uso Local

Para ejecutar la aplicación localmente y ver el simulador en acción:

1. **Clona este repositorio:**
   ```bash
   git clone https://github.com/xLicht27/WebExpress.git
   cd WebExpress
   ```

2. **Instala las dependencias necesarias:**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   *Abre en tu navegador la dirección que se muestre en consola (usualmente `http://localhost:5173`).*

4. **Alterna entre Versiones:**
   En la parte superior de la página, utiliza la barra de control para alternar dinámicamente entre el *Código Base*, *Versión 1*, *Versión 2* y *Versión 3*.

---

## 🔀 Gestión de Versiones mediante Ramas de Git

Si deseas inspeccionar el código de una versión específica de forma aislada (sin el selector superior y con el punto de entrada configurado únicamente para esa versión), puedes cambiar de rama en Git utilizando los siguientes comandos:

* **Para ver el Código Base:**
  ```bash
  git checkout version/base
  ```
* **Para ver la Versión 1 (Búsqueda):**
  ```bash
  git checkout version/v1
  ```
* **Para ver la Versión 2 (Mapa):**
  ```bash
  git checkout version/v2
  ```
* **Para ver la Versión 3 (Premium / Final):**
  ```bash
  git checkout version/v3
  ```
* **Para regresar al Simulador de Evolución completo:**
  ```bash
  git checkout main
  ```

*(Nota: Al cambiar a una rama de versión, la aplicación compilará de forma independiente mostrando solo la funcionalidad de esa fase).*

---

## 🧪 Pruebas y Construcción

El proyecto está configurado para pasar controles automáticos de calidad en cada Pull Request y Push a las ramas `main` o `develop`:

* **Verificar reglas de calidad (ESLint):**
  ```bash
  npm run lint
  ```
* **Compilar para producción:**
  ```bash
  npm run build
  ```
  *La compilación se realiza con Vite y genera los archivos optimizados dentro del directorio `dist/`, el cual está ignorado en Git para mantener limpio el repositorio.*
