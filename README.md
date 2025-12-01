# 🗳️ Frontend App de Elecciones Municipales Escolares

Este repositorio contiene el código fuente del frontend para la aplicación de **Elecciones Municipales Escolares**. La aplicación permite a los estudiantes, docentes y personal administrativo gestionar y participar en el proceso electoral de manera digital, asegurando **transparencia y eficiencia en la votación**.

Desarrollado con **Vue.js**, este proyecto utiliza un enfoque de componentes reactivos para construir una interfaz de usuario **moderna, rápida y escalable**.

---

## 🛠️ Tecnologías Principales

* **Vue 3:** Framework progresivo de JavaScript para construir interfaces de usuario.
* **Vue Router:** Para la navegación y el manejo de rutas.
* **Pinia (o Vuex):** Gestión de estado centralizada (adaptar si se usa Pinia).
* **Axios/Fetch API:** Para la comunicación con el backend (API REST).
* **Tailwind CSS (o Bootstrap/otro CSS framework):** Para el diseño y la estilización responsiva.

---

## 🚀 Requisitos del Sistema

Para ejecutar este proyecto en local, necesitarás tener instalado **Node.js** (versión recomendada: **18.x o superior**) y **npm** (Node Package Manager) o **Yarn**.

## ⚙️ Configuración e Instalación Local

Sigue estos pasos para poner en marcha el proyecto en tu entorno local:

1.  **Clonar el repositorio:**
    ```bash
    git clone [URL_DE_TU_REPOSITORIO] cd frontend-elecciones
    ```
2.  **Instalar dependencias:** Utiliza tu gestor de paquetes preferido:
    * Usando npm:
        ```bash
        npm install
        ```
    * O usando Yarn:
        ```bash
        yarn install
        ```
3.  **Configuración de Variables de Entorno:**
    * Crea un archivo llamado **`.env`** en la raíz del proyecto (si no existe).
    * Define la URL base de tu backend (API).
    ```bash
    # Ejemplo de archivo .env
    VITE_API_BASE_URL="[URL_DE_TU_API_BACKEND]"
    ```
    * Asegúrate de que la URL de tu backend esté correctamente configurada y accesible.
4.  **Ejecutar el Servidor de Desarrollo:**
    * Inicia la aplicación en modo de desarrollo. Esto levantará un servidor local (generalmente en `http://localhost:5173`) con **Hot Module Replacement (HMR)**.
    * Usando npm:
        ```bash
        npm run dev
        ```
    * O usando Yarn:
        ```bash
        yarn dev
        ```

---

## 💻 Comandos Disponibles

En la raíz del proyecto, puedes ejecutar los siguientes comandos:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev` | Inicia el servidor de desarrollo local con HMR. |
| `npm run build` | Compila y minifica la aplicación para producción en la carpeta `dist/`. |
| `npm run preview` | Previsualiza la build de producción localmente. |
| `npm run lint` | Ejecuta ESLint para revisar y corregir problemas de código. |
| `npm run test:unit` | Ejecuta las pruebas unitarias (si se usan Vitest, Jest, etc.). |

---

## 📂 Estructura del Proyecto

La estructura de carpetas sigue las convenciones estándar de un proyecto Vue.js:

* `src/`
    * `assets/` 🖼️ Archivos estáticos (imágenes, iconos, CSS base)
    * `components/` 🧩 Componentes reutilizables (Botones, Tarjetas, Menús)
    * `views/` / `pages/` 📄 Componentes de página (Votacion, Resultados, Admin Dashboard)
    * `router/` 🧭 Configuración de Vue Router
    * `stores/` 💾 Módulos de Pinia/Vuex para la gestión de estado
    * `services/` 📡 Lógica para la comunicación con la API (Axios/Fetch)
    * `main.js` ➡️ Punto de entrada de la aplicación

