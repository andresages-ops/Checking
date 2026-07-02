# Checador — Control de horas

App de control de horas (entrada, descanso, salida) con resúmenes semanales, quincenales y mensuales. No requiere build ni Node — son solo HTML/JS que corren directo en el navegador (React y Babel se cargan desde CDN).

## Publicar en GitHub Pages (2 minutos)

1. Crea un repositorio nuevo en GitHub (puede ser público o privado).
2. Sube **todo el contenido de esta carpeta** tal cual (`index.html`, `app.js`, `manifest.json`, `sw.js`, la carpeta `icons/`) a la raíz del repo.
3. Ve a **Settings → Pages**.
4. En "Build and deployment", selecciona **Deploy from a branch**, elige la rama `main` y la carpeta `/ (root)`. Guarda.
5. Espera 1–2 minutos y abre la URL que te da GitHub (algo como `https://tu-usuario.github.io/tu-repo/`).

Listo — ya puedes usarla. Desde el celular (Chrome/Edge/Safari) el navegador ofrecerá **"Agregar a pantalla de inicio" / "Instalar app"**.

## Almacenamiento

Los registros se guardan en el `localStorage` del navegador donde abras la app — es decir, quedan solo en ese dispositivo/navegador. No hay servidor ni base de datos.

Por eso la app incluye una sección de **Respaldo**:
- **Descargar reporte del periodo (CSV)** — para llevar tus horas a Excel/Sheets o guardarlas como comprobante.
- **Descargar respaldo completo (JSON)** — copia de todos tus registros, útil para restaurar si cambias de navegador, borras datos del sitio, o cambias de celular.
- **Restaurar respaldo** — carga un archivo JSON de respaldo previamente descargado (reemplaza los datos actuales).

Recomendación: descarga el respaldo JSON de vez en cuando (por ejemplo, al cierre de cada quincena).

## Estructura

```
index.html      → punto de entrada
app.js          → toda la lógica y la interfaz (JSX vía Babel, sin build)
manifest.json   → hace la app instalable
sw.js           → service worker (funciona sin conexión una vez cargada)
icons/          → íconos de la app
```
