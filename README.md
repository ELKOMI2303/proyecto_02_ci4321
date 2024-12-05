**Proyecto 03**  
**Curso:** CI4321 (2024)  
**Puntuación Total:** 10 puntos  
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
`bash
    npm init -y
    `

### Instalar dependencias:

Instala las dependencias ejecutando:

```bash
npm install --save three
```

```bash
npm install --save-dev vite
```

### Scripts personalizados:

Se agregaron los siguientes scripts al archivo package.json para facilitar el desarrollo y la ejecución del proyecto:

    "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
    }

- **npm run dev**: Ejecuta el servidor de desarrollo de Vite y abre el proyecto localmente.
- **npm run build**: Genera la versión optimizada para producción.
- **npm run preview**: Previsualiza la versión compilada del proyecto.

### Correr el proyecto en modo desarrollo:

Para iniciar el servidor de desarrollo, ejecuta:

```bash
npm run dev
```

### Abrir el proyecto en el navegador:

Abre tu navegador y visita la dirección local que aparece en la terminal (por defecto suele ser http://localhost:5173).

## Descripción de la Tarea

El objetivo de este proyecto es desarrollar un programa de manera **individual** o **en pareja** sobre las bases del Proyecto 01. El programa debe simular un vehículo que interactúa con diversos tipos de obstáculos en un espacio 3D. Los obstáculos pueden ser eliminados mediante proyectiles disparados desde el vehículo, que debe ser controlado por teclado. Es fundamental incluir las instrucciones de control en el archivo README o en la pantalla del programa.

### APIs a Utilizar:

Puedes elegir entre **OpenGL**, **WebGL**, o **Three.js**. Si decides usar Three.js, solo se permitirá el uso de las APIs básicas para construcción manual de primitivas y operaciones matemáticas. No se permite el uso de módulos o funciones de Three.js que proporcionen ventajas significativas sobre OpenGL.

## Evaluación:

1. **Mapa de Texturas (8 pts):**

   - Presentar al menos dos (2) elementos que tengan no sólo su textura mapeada correctamente con UVs, sino que también incluya su mapa de normales.
   - Se recomienda utilizar un cubo u obstáculo que ya tengan avanzado para optimizar su tiempo, el otro tipo de objeto es de libre elección (no paralelogramo).
   - Se recomienda cambiar ligeramente la rotación de la luz direccional en el tiempo para que sea obvio en el video y para la evaluación.
     - Énfasis en ligeramente, no queremos que a nadie le dé un ataque de epilepsia o mareo por movimiento (motion sickness) xD

2. **Interfaz gráfica sencilla (7 pt):**
   - Presentar al menos dos (2) elementos en una interfaz gráfica de tipo Overlay.
   - Uno de los elementos puede ser estático o dinámico, según la necesidad del programa o juego. Ejm:
     - Barra de energía (dinámica con cambio de largo o masking).
     - Repetir imágenes según algún contador como número de vidas (estático).
   - Uno de los elementos debe estar basado en tipografía y creación/importación de mapa de sprites (también conocidos como atlas). Ejm:
     - Número de vidas, obstáculos o proyectiles restantes.
     - Mostrar grados del pitch del cañón.
     - Pueden utilizar atlas ya existentes en Internet, pero la implementación de carga y rendering debe venir de ustedes o del helper de la tecnología del proyecto (Three.js / OpenGL / OGRE).

## Consideraciones

- **Fecha tope de entrega:** Lunes, 25 de Noviembre, a las 4:59 pm.
- **Formato del repositorio GitHub:** `proyecto_02_ci4321.git`
- **Envío por correo electrónico a:**
  - 10-87970@usb.ve
  - Con copia a: depci-invitado2@usb.ve
- **Asunto del correo:** `[ci4321] Proyecto 02`
- **Contenido del correo:**
  - Saludo con los **nombres** y **carnets** del equipo.
  - Enlace al **repositorio GitHub**.
  - Enlace a un **video en YouTube** mostrando el funcionamiento del proyecto. Es importante hablar o agregar subtítulos explicando el proyecto como si fuera una presentación.

## Estructura del Repositorio

- El repositorio debe incluir un README que contenga:
  - **Nombres, Carnets y API utilizada.**
  - **Sistema operativo** en el que se desarrolló el proyecto.
  - **Lista de dependencias** e instrucciones para ejecutar el programa.
