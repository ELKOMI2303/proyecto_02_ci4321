# Proyecto 03

**Curso:** CI4321 (2024)  
**Puntuación Total:** 20 puntos  
**Alumnos:** Felix Arnos y Jonathan Bautista  
**Carnets:** 15-10088 y 16-10109  
**Fecha:** 2024-12-11

## Sistema Operativo

Este proyecto fue desarrollado en **Windows 11**.

## Dependencias

Este proyecto utiliza las siguientes dependencias:

- **Three.js**: Biblioteca de JavaScript para renderizado 3D.
- **Vite**: Herramienta de desarrollo rápida.

### Instalación de dependencias

Antes de ejecutar el proyecto, asegúrate de que tienes **Node.js** instalado en tu sistema. Si no lo tienes, puedes descargarlo desde [Node.js](https://nodejs.org/).

Luego, instala las dependencias ejecutando los siguientes comandos:

- **Three.js**:

  ```bash
  npm install --save three
  ```

- **Vite**:

  ```bash
  npm install --save-dev vite
  ```

### Instrucciones para ejecutar el proyecto

Instalar Node.js:
Asegúrate de tener Node.js instalado.

Inicializar el proyecto:

Ejecuta el siguiente comando en la terminal para inicializar un proyecto Node.js:

```bash
    npm init -y
```

### Instalar dependencias

Instala las dependencias ejecutando:

```bash
npm install --save three
```

```bash
npm install --save-dev vite
```

### Scripts personalizados

Se agregaron los siguientes scripts al archivo package.json para facilitar el desarrollo y la ejecución del proyecto:

```json
    "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
    }
```

- **npm run dev**: Ejecuta el servidor de desarrollo de Vite y abre el proyecto localmente.
- **npm run build**: Genera la versión optimizada para producción.
- **npm run preview**: Previsualiza la versión compilada del proyecto.

### Correr el proyecto en modo desarrollo

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

### Abrir el proyecto en el navegador

Abre tu navegador y visita la dirección local que aparece en la terminal (por defecto suele ser <http://localhost:5173>).

## Descripción de la Tarea

El objetivo de este proyecto es desarrollar un programa de manera **individual** o **en pareja** sobre las bases del Proyecto 01. El programa debe simular un vehículo que interactúa con diversos tipos de obstáculos en un espacio 3D. Los obstáculos pueden ser eliminados mediante proyectiles disparados desde el vehículo, que debe ser controlado por teclado. Es fundamental incluir las instrucciones de control en el archivo README o en la pantalla del programa.

### APIs a Utilizar

Puedes elegir entre **OpenGL**, **WebGL**, o **Three.js**. Si decides usar Three.js, solo se permitirá el uso de las APIs básicas para construcción manual de primitivas y operaciones matemáticas. No se permite el uso de módulos o funciones de Three.js que proporcionen ventajas significativas sobre OpenGL.

## Evaluación

1. **Iluminación  (10 pts):**

   - Utilizar al menos dos (2) tipo de luz extra a la luz direccional que ya existe en el proyecto: spot light, point light, hemisphere light, rectarea light (estas dos últimas soportadas por Three.js y WebGL, no OpenGL 3).
   - Ejemplos:
     - Utilizar un botón que apague/reduzca la luz direccional y encienda una o dos spotlights en el vehículo.
     - Tener point lights como fogatas o lámparas (no es necesario el fuego real, ojo).
     - Instanciar point lights durante explosiones y apagarlas después de X segundos.

2. **Partículas (10 pt):**
   - Crear un pequeño sistema de partículas sencillo para darle vida a la escena.
   - Ejemplos:
     - Una cascada o río con partículas azules fluyendo en una dirección.
     - Efecto de lluvia que siempre esté sobre la cámara (on/off).
     - Efecto thruster en el vehículo al moverse.
     - Instanciar una pequeña explosión al destruir los obstáculos.

## Consideraciones

- **Fecha tope de entrega:** Miércoles, 11 de Diciembre, a las 4:59 pm.
- **Formato del repositorio GitHub:** `proyecto_03_ci4321.git`
- **Envío por correo electrónico a:**
  - <10-87970@usb.ve>
  - Con copia a: <depci-invitado2@usb.ve>
- **Asunto del correo:** `[ci4321] Proyecto 03`
- **Contenido del correo:**
  - Saludo con los **nombres** y **carnets** del equipo.
  - Enlace al **repositorio GitHub**.
  - Enlace a un **video en YouTube** mostrando el funcionamiento del proyecto. Es importante hablar o agregar subtítulos explicando el proyecto como si fuera una presentación.

## Estructura del Repositorio

- El repositorio debe incluir un README que contenga:
  - **Nombres, Carnets y API utilizada.**
  - **Sistema operativo** en el que se desarrolló el proyecto.
  - **Lista de dependencias** e instrucciones para ejecutar el programa.
