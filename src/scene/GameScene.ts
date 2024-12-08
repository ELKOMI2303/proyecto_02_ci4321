import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Vector3,
  PointLight,
  SphereGeometry,
  SpotLight,
  HemisphereLight,
  Mesh,
  OrthographicCamera,
  CanvasTexture,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  TextureLoader,
  SpriteMaterial,
  Sprite,
  BufferGeometry,
  BufferAttribute,
  PointsMaterial,
  Points,
  ShaderMaterial,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Vehicle from "../entyties/Vehicle";
import cube from "../shapes/Cube";
import skybox from "../shapes/Skybox";
import plane from "../shapes/plane";
import cone from "../shapes/Cone";
import cylinder from "../shapes/Cylinder";

class GameScene {
  private static _instance = new GameScene();
  public static get instance() {
    return this._instance;
  }

  private _width: number = window.innerWidth;
  private _height: number = window.innerHeight;
  private _renderer: WebGLRenderer = new WebGLRenderer({
    alpha: true,
    antialias: true,
  });
  private _camera: PerspectiveCamera;
  private readonly _scene = new Scene();
  private _vehicle: Vehicle;
  private _controls: OrbitControls;
  private lastTime: number = 0;
  private cameraDistance: number = 50; // Distancia detrás del vehículo
  private cameraHeight: number = 25; // Altura de la cámara sobre el vehículo
  private isThirdPerson: boolean = false; // Estado para la cámara en tercera persona
  private cubeLives: number = 3;
  private coneLives: number = 3;
  private cylinderLives: number = 3;
  private obstaclesRemaining: number = 3;
  private _overlayCamera: OrthographicCamera;
  private _overlayScene: Scene;

  private _lights: Record<string, any> = {};

  // Elementos de la interfaz
  private cubeLivesText!: Mesh;
  private coneLivesText!: Mesh;
  private cylinderLivesText!: Mesh;
  private obstaclesRemainingText!: Mesh;
  private cubeEnergyBar!: Mesh;
  private coneEnergyBar!: Mesh;
  private cylinderEnergyBar!: Mesh;
  private map = new TextureLoader().load("/Numeros.png");
  private material = new SpriteMaterial({ map: this.map });
  private sprite = new Sprite(this.material);
  private currentNumber: number = 0;

  private timeSinceLastChange: number = 0; // Variable para contar el tiempo transcurrido
  private changeInterval: number = 1000; // Intervalo de cambio en milisegundos (puedes ajustarlo a la velocidad que desees)

  // Estado para el modo de disparo
  private shootMode: "rectilinear" | "parabolic" = "rectilinear";

  private constructor() {
    this._renderer.setPixelRatio(window.devicePixelRatio);
    this._renderer.setSize(this._width, this._height);

    const targetElement = document.querySelector<HTMLDivElement>("#app");
    if (!targetElement) {
      throw "Unable to find target element";
    }

    targetElement.appendChild(this._renderer.domElement);

    const aspectRatio = this._width / this._height;
    this._camera = new PerspectiveCamera(45, aspectRatio, 0.1, 30000);
    this._camera.position.set(10, 10, 10); // Posición inicial de la cámara
    this._camera.lookAt(0, 0, 0);

    window.addEventListener("resize", this.resize);
    window.addEventListener("keydown", this.onKeyDown);

    this.addLights();
    this.setupControls();

    // Configurar la cámara ortográfica para el overlay (2D)
    this._overlayCamera = new OrthographicCamera(
      -this._width / 2,
      this._width / 2,
      this._height / 2,
      -this._height / 2,
      1,
      10
    );
    this._overlayCamera.position.z = 5;

    this._overlayScene = new Scene();

    this.createOverlayElements();
    window.addEventListener("resize", this.onResize);

    this._vehicle = new Vehicle();
    this._scene.add(this._vehicle.group);
  }

  private createOverlayElements() {
    this.obstaclesRemainingText = this.createTextMesh(
      `Obstáculos Restantes: ${this.obstaclesRemaining}`
    );
    this.obstaclesRemainingText.position.set(
      -this._width / 2 + 200,
      this._height / 2 - 90,
      0
    );

    // Crear los textos para "Vida del Cubo" y "Obstáculos Restantes"
    this.cubeLivesText = this.createTextMesh(
      `Vida del Cubo: ${this.cubeLives}`
    );
    this.cubeLivesText.position.set(
      -this._width / 2 + 200,
      this._height / 2 - 120,
      0
    );

    this.coneLivesText = this.createTextMesh(
      `Vida del Cono: ${this.coneLives}`
    );
    this.coneLivesText.position.set(
      -this._width / 2 + 200,
      this._height / 2 - 150,
      0
    );

    this.cylinderLivesText = this.createTextMesh(
      `Vida del Cilindro: ${this.cylinderLives}`
    );
    this.cylinderLivesText.position.set(
      -this._width / 2 + 200,
      this._height / 2 - 180,
      0
    );

    // Crear barras de energía
    this.cubeEnergyBar = this.createEnergyBar();
    this.cubeEnergyBar.position.set(
      -this._width / 2 + 420,
      this._height / 2 - 70,
      0
    );

    this.coneEnergyBar = this.createEnergyBar();
    this.coneEnergyBar.position.set(
      -this._width / 2 + 420,
      this._height / 2 - 100,
      0
    );

    this.cylinderEnergyBar = this.createEnergyBar();
    this.cylinderEnergyBar.position.set(
      -this._width / 2 + 420,
      this._height / 2 - 130,
      0
    );

    this.map.repeat.set(1 / 4, 1 / 3);

    this.sprite.position.y = this._height / 2 - 100;
    this.sprite.position.x = this._width / 2 - 100;
    this.sprite.scale.set(100, 100, 100);

    // Añadir los elementos a la escena del overlay
    this._overlayScene.add(
      this.obstaclesRemainingText,
      this.cubeLivesText,
      this.coneLivesText,
      this.cylinderLivesText,
      this.cubeEnergyBar,
      this.coneEnergyBar,
      this.cylinderEnergyBar,
      this.sprite
    );
  }

  private updateNumber(newNumber: number) {
    // Validar que el número está en el rango permitido (0-9)
    if (newNumber < 0 || newNumber > 9) {
      console.warn("Número fuera de rango: ", newNumber);
      return;
    }

    // Establecer la posición de la textura en función del número proporcionado
    const numberPositions = [
      { x: 1 / 31, y: 1 - 1 / 3 }, // 0
      { x: 1 / 1.28, y: 1 - 1 / 3 }, // 1
      { x: 1 / 3.55, y: 1 - 1 / 3 }, // 2
      { x: 1 / 1.88, y: 1 - 1 / 3 }, // 3
      { x: 1 / 31, y: 1 - 1 / 1.5 }, // 4
      { x: 1 / 3.55, y: 1 - 1 / 1.5 }, // 5
      { x: 1 / 1.88, y: 1 - 1 / 1.5 }, // 6
      { x: 1 / 31, y: 1 - 1 / 1.001 }, // 7
      { x: 1 / 3.55, y: 1 - 1 / 1.001 }, // 8
      { x: 1 / 1.88, y: 1 - 1 / 1.001 }, // 9
    ];

    // Actualizar la posición de la textura en el atlas según el número proporcionado
    this.map.offset.x = numberPositions[newNumber].x;
    this.map.offset.y = numberPositions[newNumber].y;
  }

  private incrementNumber() {
    this.currentNumber = (this.currentNumber + 1) % 10; // Incrementar y reiniciar al llegar a 10
    this.updateNumber(this.currentNumber); // Llamar a la función con el número actual
  }

  private createTextMesh(text: string): Mesh {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.font = "20px Arial";
    context.fillStyle = "black";
    context.fillText(text, 10, 30);

    const texture = new CanvasTexture(canvas);
    const material = new MeshBasicMaterial({ map: texture, transparent: true });
    const geometry = new PlaneGeometry(canvas.width, canvas.height);
    return new Mesh(geometry, material);
  }

  private createEnergyBar(): Mesh {
    const geometry = new PlaneGeometry(200, 20);
    const material = new MeshBasicMaterial({ color: "green" });
    return new Mesh(geometry, material);
  }

  private addLights() {
    // Luz ambiental
    const ambientLight = new AmbientLight(0x808080); // Luz ambiental más intensa
    this._scene.add(ambientLight);

    // Luz emisférica (siempre visible)
    const hemisphereLight = new HemisphereLight(0x87ceeb, 0x4a2c2c, 0.8); // Cielo azul claro, suelo marrón rojizo, intensidad 0.8
    hemisphereLight.position.set(0, 50, 0);
    hemisphereLight.visible = false;
    this._scene.add(hemisphereLight);

    // Luz direccional (prendida por defecto)
    const directionalLight = new DirectionalLight(0xffffff, 1.5);
    directionalLight.position.set(15, 100, -100);
    directionalLight.target.position.set(0, 0, 0);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    directionalLight.visible = true; // Prendida por defecto
    this._scene.add(directionalLight);
    this._scene.add(directionalLight.target);

    // Luz puntual (simulando fogata)
    const pointLight = new PointLight(0xff4500, 4, 100); // Mayor intensidad y alcance
    pointLight.position.set(15, 1, 15);
    pointLight.visible = false; // Apagada por defecto
    this._scene.add(pointLight);

    // Material para la punta de la antorcha (esfera)
    const torchTipMaterial = new MeshStandardMaterial({
      color: 0xffa500, // Color inicial anaranjado tenue
      emissive: 0x000000, // Sin emisión inicial
      emissiveIntensity: 0,
      roughness: 0.4,
      metalness: 0.1,
    });

    // Geometría de la esfera
    const torchTipGeometry = new SphereGeometry(0.4, 16, 16);
    const torchTip = new Mesh(torchTipGeometry, torchTipMaterial);
    torchTip.position.set(15, 1, 15);
    torchTip.visible = true; // Siempre visible
    this._scene.add(torchTip);

    // Guardar referencias para controlarlas dinámicamente
    this._lights = { directionalLight, pointLight, hemisphereLight, torchTip };

    // Simulación de parpadeo para la luz puntual
    setInterval(() => {
      if (pointLight.visible) {
        pointLight.intensity = 3 + Math.random() * 2; // Intensidad entre 3 y 5
      }
    }, 200); // Parpadeo cada 200ms
  }

  private onKeyDown = (event: KeyboardEvent) => {
    const delta = 0.016;

    switch (event.key.toLowerCase()) {
      case "arrowup":
        this._vehicle.rotateCannonPitch(-0.1);
        break;
      case "arrowdown":
        this._vehicle.rotateCannonPitch(0.1);
        break;
      case "arrowleft":
        this._vehicle.rotateCannonYaw(0.1);
        break;
      case "arrowright":
        this._vehicle.rotateCannonYaw(-0.1);
        break;
      case "w":
        this._vehicle.moveForward(delta);
        break;
      case "s":
        this._vehicle.moveBackward(delta);
        break;
      case "a":
        this._vehicle.rotateLeft(delta);
        break;
      case "d":
        this._vehicle.rotateRight(delta);
        break;
      case " ":
        this._vehicle.shoot(this.shootMode);
        break;
      case "1":
        this.shootMode = "rectilinear";
        console.log("Shoot Mode: Rectilinear");
        break;
      case "2":
        this.shootMode = "parabolic";
        console.log("Shoot Mode: Parabolic");
        break;
      case "3": // Cambiar entre cámaras
        this.isThirdPerson = !this.isThirdPerson;
        console.log(
          `Camera Mode: ${this.isThirdPerson ? "Third Person" : "First Person"}`
        );
        break;
      case "l": // Alternar luces entre direccional y fogata
        this.toggleDirectionalAndPointLight();
        break;
      case "k": // Alternar luces entre direccional y emisférica
        this.toggleDirectionalAndHemisphereLight();
        break;
    }
  };

  private toggleDirectionalAndPointLight() {
    const { directionalLight, pointLight, torchTip } = this._lights;

    if (directionalLight.visible) {
      // Apagar la luz direccional y encender la fogata
      directionalLight.visible = false;
      pointLight.visible = true;

      // Cambiar la apariencia de la esfera para simular una fogata activa
      torchTip.material.color.set(0xffa500); // Naranja brillante
      torchTip.material.emissive.set(0xffffff); // Emisión blanca cálida
      torchTip.material.emissiveIntensity = 1.5; // Más brillo
    } else {
      // Encender la luz direccional y apagar la fogata
      directionalLight.visible = true;
      pointLight.visible = false;

      // Cambiar la apariencia de la esfera para simular inactividad
      torchTip.material.color.set(0xff4500); // Naranja apagado
      torchTip.material.emissive.set(0x000000); // Sin emisión
      torchTip.material.emissiveIntensity = 0; // Sin brillo
    }

    console.log(
      `Directional Light: ${directionalLight.visible}, Point Light: ${
        pointLight.visible ? "On" : "Off"
      }`
    );
  }

  private toggleDirectionalAndHemisphereLight() {
    const { directionalLight, hemisphereLight, torchTip } = this._lights;

    if (directionalLight.visible) {
      // Apagar la luz direccional y encender la emisférica
      directionalLight.visible = false;
      hemisphereLight.visible = true;

      // Cambiar la apariencia de la esfera para simular luz emisférica
      torchTip.material.color.set(0xff4500); // Naranja apagado
      torchTip.material.emissive.set(0x000000); // Sin emisión
      torchTip.material.emissiveIntensity = 0; // Sin brillo
    } else {
      // Encender la luz direccional y apagar la emisférica
      directionalLight.visible = true;
      hemisphereLight.visible = false;

      // No cambiar la apariencia de la esfera, ya que es decorativa
    }

    console.log(
      `Directional Light: ${directionalLight.visible}, Hemisphere Light: ${
        hemisphereLight.visible ? "On" : "Off"
      }`
    );
  }

  private setupControls() {
    this._controls = new OrbitControls(this._camera, this._renderer.domElement);
    this._controls.enableDamping = true;
    this._controls.dampingFactor = 0.05;
    this._controls.maxPolarAngle = Math.PI / 2;
    this._controls.minDistance = 5;
    this._controls.maxDistance = 50;
    this._controls.target.set(0, 0, 0); // Esto permite que la cámara se mueva libremente sin mirar un objetivo fijo
  }

  private resize = () => {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._renderer.setSize(this._width, this._height);
    this._camera.aspect = this._width / this._height;
    this._camera.updateProjectionMatrix();
  };

  private onResize = () => {
    this._width = window.innerWidth;
    this._height = window.innerHeight;
    this._renderer.setSize(this._width, this._height);

    this._overlayCamera.left = -this._width / 2;
    this._overlayCamera.right = this._width / 2;
    this._overlayCamera.top = this._height / 2;
    this._overlayCamera.bottom = -this._height / 2;
    this._overlayCamera.updateProjectionMatrix();
  };

  public load = () => {
    this._scene.add(skybox);
    skybox.position.set(0, 0, 0);

    this._scene.add(plane);

    // Añadir el cubo a la escena
    this._scene.add(cube);
    this._scene.add(cone);

    this._scene.add(cylinder);

    cone.position.set(30, 2.8, 10);

    cylinder.position.set(15, 2.8, 10);

    // Opcional: Ajustar la posición del cubo si es necesario
    cube.position.set(0, 2.8, 10); // Mueve el cubo en la escena según lo necesites
  };

  private distanceBetween = (v1: Vector3, v2: Vector3): number => {
    return v1.distanceTo(v2);
  };

  public render = (time: number) => {
    requestAnimationFrame(this.render);

    // Limitar a 30 FPS
    const fps = 30;
    const interval = 1000 / fps;
    const delta = time - this.lastTime;

    if (delta > interval) {
      this.lastTime = time - (delta % interval); // Ajustar el tiempo para evitar acumulación de retrasos

      if (this.isThirdPerson) {
        this.updateCameraPosition(); // Actualizar posición de la cámara en tercera persona
      } else {
        this._controls.update(); // Actualiza los controles si está en primera persona
      }

      // Calcular el tiempo transcurrido desde el último cambio
      this.timeSinceLastChange += delta;

      // Cambiar el sprite solo después de que haya pasado el intervalo de tiempo
      if (this.timeSinceLastChange >= this.changeInterval) {
        this.timeSinceLastChange = 0; // Resetear el contador de tiempo
        // Actualizar el número (contador)
        this.incrementNumber();
      }

      this._vehicle.update(delta / 1000); // Pasar delta en segundos
      this.checkCollisions();
      this._renderer.autoClear = true;
      this._renderer.render(this._scene, this._camera);

      // Renderizar la interfaz de usuario (overlay) encima
      this._renderer.autoClear = false;
      this._renderer.render(this._overlayScene, this._overlayCamera);
    }
  };

  // Método para actualizar la posición de la cámara en tercera persona
  private updateCameraPosition() {
    // Obtener la posición del vehículo
    const vehiclePosition = new Vector3();
    this._vehicle.group.getWorldPosition(vehiclePosition);

    // Calcular la nueva posición de la cámara
    const cameraOffset = new Vector3(
      0,
      this.cameraHeight,
      -this.cameraDistance
    );
    const cameraPosition = vehiclePosition
      .clone()
      .add(cameraOffset.applyQuaternion(this._vehicle.group.quaternion));

    // Establecer la posición de la cámara
    this._camera.position.copy(cameraPosition);
    this._camera.lookAt(vehiclePosition); // Asegúrate de que la cámara esté mirando al vehículo
  }

  // private createExplosion(position: Vector3) {
  //   const particleCount = 50;
  //   const particlesGeometry = new BufferGeometry();
  //   const positions = new Float32Array(particleCount * 3);
  //   const velocities = new Float32Array(particleCount * 3);
  //   const colors = new Float32Array(particleCount * 3);
  //   const sizes = new Float32Array(particleCount);

  //   const speedFactor = 0.3; // Controla la velocidad de las partículas

  //   for (let i = 0; i < particleCount; i++) {
  //     // Posiciones iniciales (centro de la explosión)
  //     positions[i * 3 + 0] = position.x;
  //     positions[i * 3 + 1] = position.y;
  //     positions[i * 3 + 2] = position.z;

  //     // Generar dirección aleatoria en una esfera
  //     const theta = Math.random() * 2 * Math.PI; // Ángulo en el plano XZ
  //     const phi = Math.acos(2 * Math.random() - 1); // Ángulo en el eje Y
  //     const x = Math.sin(phi) * Math.cos(theta);
  //     const y = Math.sin(phi) * Math.sin(theta);
  //     const z = Math.cos(phi);

  //     // Asignar velocidades escaladas
  //     velocities[i * 3 + 0] -= x * speedFactor;
  //     velocities[i * 3 + 1] -= y * speedFactor;
  //     velocities[i * 3 + 2] -= z * speedFactor;

  //     // Colores iniciales
  //     colors[i * 3 + 0] = 1.0; // Rojo
  //     colors[i * 3 + 1] = 0.6; // Verde
  //     colors[i * 3 + 2] = 0.0; // Azul

  //     // Tamaño aleatorio
  //     sizes[i] = Math.random() * 0.3 + 0.1;
  //   }

  //   particlesGeometry.setAttribute(
  //     "position",
  //     new BufferAttribute(positions, 3)
  //   );
  //   particlesGeometry.setAttribute(
  //     "velocity",
  //     new BufferAttribute(velocities, 3)
  //   );
  //   particlesGeometry.setAttribute("color", new BufferAttribute(colors, 3));
  //   particlesGeometry.setAttribute("size", new BufferAttribute(sizes, 3));

  //   const particlesMaterial = new PointsMaterial({
  //     vertexColors: true,
  //     size: 0.2,
  //     transparent: true,
  //     opacity: 1.0,
  //   });

  //   const particles = new Points(particlesGeometry, particlesMaterial);
  //   this._scene.add(particles);

  //   // Luz puntual en la explosión
  //   const light = new PointLight(0xffaa00, 1, 20);
  //   light.position.copy(position);
  //   this._scene.add(light);

  //   // Sonido de explosión
  //   const explosionSound = new Audio("/explosion.mp3");
  //   explosionSound.play();

  //   const lifetime = 2; // Segundos
  //   let elapsedTime = 0;

  //   const animateParticles = () => {
  //     elapsedTime += 0.016;

  //     const positions = particlesGeometry.attributes.position
  //       .array as Float32Array;
  //     const velocities = particlesGeometry.attributes.velocity
  //       .array as Float32Array;
  //     const colors = particlesGeometry.attributes.color.array as Float32Array;

  //     // Actualiza posiciones con velocidad y gravedad
  //     for (let i = 0; i < particleCount; i++) {
  //       positions[i * 3 + 0] += velocities[i * 3 + 0] * 0.1; // x
  //       positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.1; // y
  //       positions[i * 3 + 1] -= 0.01; // Gravedad
  //       positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.1; // z
  //     }

  //     // Cambiar colores a lo largo del tiempo
  //     for (let i = 0; i < particleCount; i++) {
  //       colors[i * 3 + 1] = Math.max(0, 1 - elapsedTime / lifetime); // Verde decrece
  //       colors[i * 3 + 2] = elapsedTime / lifetime; // Azul aumenta
  //     }

  //     particlesMaterial.opacity = Math.max(0, 1 - elapsedTime / lifetime);

  //     particlesGeometry.attributes.position.needsUpdate = true;
  //     particlesGeometry.attributes.color.needsUpdate = true;

  //     if (elapsedTime < lifetime) {
  //       requestAnimationFrame(animateParticles);
  //     } else {
  //       this._scene.remove(particles);
  //       this._scene.remove(light);
  //       particlesGeometry.dispose();
  //       particlesMaterial.dispose();
  //     }
  //   };

  //   animateParticles();
  // }

  private createExplosion(position: Vector3) {
    const particleCount = 50;
    const particlesGeometry = new BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const speedFactor = 2;

    for (let i = 0; i < particleCount; i++) {
      // Posiciones iniciales (centro de la explosión)
      positions[i * 3 + 0] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

      // Generar dirección aleatoria
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const x = Math.sin(phi) * Math.cos(theta);
      const y = Math.sin(phi) * Math.sin(theta);
      const z = Math.cos(phi);

      // Asignar velocidades
      velocities[i * 3 + 0] = x * speedFactor;
      velocities[i * 3 + 1] = y * speedFactor;
      velocities[i * 3 + 2] = z * speedFactor;

      // Tamaño aleatorio
      sizes[i] = Math.random() * 0.3 + 0.1;
    }

    particlesGeometry.setAttribute(
      "position",
      new BufferAttribute(positions, 3)
    );
    particlesGeometry.setAttribute(
      "velocity",
      new BufferAttribute(velocities, 3)
    );
    particlesGeometry.setAttribute("size", new BufferAttribute(sizes, 1));

    // Shaders
    const vertexShader = `
      attribute float size;
      attribute vec3 velocity;
      uniform float uTime;
      varying vec3 vColor;
      void main() {
        vec3 newPosition = position + velocity * uTime; // Movimiento de partículas
        float progress = uTime / 2.0; // Normalizar tiempo de vida
        vColor = mix(vec3(1.0, 0.6, 0.0), vec3(0.0, 0.0, 1.0), progress); // Cambio de color
        vec4 mvPosition = modelViewMatrix * vec4(newPosition, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z); // Ajustar tamaño con perspectiva
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec3 vColor;
      uniform float uTime;
      void main() {
        float opacity = 1.0 - (uTime / 2.0); // Desvanecer con el tiempo
        opacity = max(opacity, 0.0);
        gl_FragColor = vec4(vColor, opacity);
  
        // Gradiente circular para simular brillo
        float dist = length(gl_PointCoord - vec2(0.5));
        if (dist > 0.5) discard; // Descartar píxeles fuera del punto
        gl_FragColor.rgb *= 1.0 - dist; // Atenuar color en los bordes
      }
    `;

    const particlesMaterial = new ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      uniforms: {
        uTime: { value: 0 },
      },
    });

    const particles = new Points(particlesGeometry, particlesMaterial);
    this._scene.add(particles);

    // Luz puntual
    const light = new PointLight(0xffaa00, 1, 20);
    light.position.copy(position);
    this._scene.add(light);

    // Sonido
    const explosionSound = new Audio("/explosion.mp3");
    explosionSound.play();

    const lifetime = 2;
    let elapsedTime = 0;

    const animateParticles = () => {
      elapsedTime += 0.016;

      // Actualizar tiempo en el uniforme
      particlesMaterial.uniforms.uTime.value = elapsedTime;

      if (elapsedTime < lifetime) {
        requestAnimationFrame(animateParticles);
      } else {
        this._scene.remove(particles);
        this._scene.remove(light);
        particlesGeometry.dispose();
        particlesMaterial.dispose();
      }
    };

    animateParticles();
  }

  private checkCollisions() {
    const projectiles = this._vehicle.getProjectiles();

    // Supón que el cubo tiene un tamaño fijo y toma el radio como la mitad de su dimensión
    const cubeRadius = cube.geometry.boundingSphere?.radius || 1; // Radio del cubo
    const coneRadius = cone.geometry.boundingSphere?.radius || 1.5; // Radio de la pirámide
    const cylinderRadius = cylinder.geometry.boundingSphere?.radius || 1.5; // Radio del cilindro

    projectiles.forEach((projectile) => {
      // Supón que el proyectil tiene una geometría esférica
      const projectileRadius =
        projectile.mesh.geometry.boundingSphere?.radius || 0.5; // Radio del proyectil

      // Suma de los radios de ambos objetos
      const combinedRadiusCube = cubeRadius + projectileRadius;
      const combinedRadiuscone = coneRadius + projectileRadius;
      const combinedRadiusCylinder = cylinderRadius + projectileRadius;

      // Calcula la distancia entre el proyectil y el cubo
      const distanceToCube = this.distanceBetween(
        projectile.mesh.position,
        cube.position
      );

      // Calcula la distancia entre el proyectil y la pirámide
      const distanceTocone = this.distanceBetween(
        projectile.mesh.position,
        cone.position
      );

      // Calcula la distancia entre el proyectil y el cilindro
      const distanceToCylinder = this.distanceBetween(
        projectile.mesh.position,
        cylinder.position
      );

      // Verifica si la distancia es menor o igual a la suma de los radios del cubo
      if (
        projectile.active &&
        distanceToCube <= combinedRadiusCube &&
        this.cubeLives > 0
      ) {
        console.log("Hit on the cube!");
        this.cubeLives -= 1;
        this.updateOverlay(); // Actualizar la interfaz
        cube.material.color.setHex(0xff0000);
        this._scene.remove(projectile.mesh);
        projectile.deactivate();

        setTimeout(() => {
          if (this.cubeLives > 0) {
            cube.material.color.setHex(0x00ff00);
          }
        }, 200);

        if (this.cubeLives === 0) {
          this.createExplosion(cube.position); // Generar explosión
          this._scene.remove(cube);
          this.obstaclesRemaining -= 1;
          this.updateOverlay(); // Actualizar la interfaz
          console.log("Cube destroyed!");
        }
      } else if (
        projectile.active &&
        distanceTocone <= combinedRadiuscone &&
        this.coneLives > 0
      ) {
        console.log("Hit on the cone!");
        this.coneLives -= 1;
        this.updateOverlay(); // Actualizar la interfaz
        cone.material.color.setHex(0xff0000);
        this._scene.remove(projectile.mesh);
        projectile.deactivate();

        setTimeout(() => {
          if (this.coneLives > 0) {
            cone.material.color.setHex(0x00ff00);
          }
        }, 200);

        if (this.coneLives === 0) {
          this.createExplosion(cone.position); // Generar explosión
          this._scene.remove(cone);
          this.obstaclesRemaining -= 1;
          this.updateOverlay(); // Actualizar la interfaz
          console.log("cone destroyed!");
        }
      } else if (
        projectile.active &&
        distanceToCylinder <= combinedRadiusCylinder &&
        this.cylinderLives > 0
      ) {
        console.log("Hit on the cylinder!");
        this.cylinderLives -= 1;
        this.updateOverlay(); // Actualizar la interfaz
        cylinder.material.color.setHex(0xff0000);
        this._scene.remove(projectile.mesh);
        projectile.deactivate();

        setTimeout(() => {
          if (this.cylinderLives > 0) {
            cylinder.material.color.setHex(0x00ff00);
          }
        }, 200);

        if (this.cylinderLives === 0) {
          this.createExplosion(cylinder.position); // Generar explosión
          this._scene.remove(cylinder);
          this.obstaclesRemaining -= 1;
          this.updateOverlay(); // Actualizar la interfaz
          console.log("cylinder destroyed!");
        }
      } else if (projectile.active && projectile.mesh.position.y <= 0) {
        console.log("Hit on the ground!");
        this._scene.remove(projectile.mesh);
        projectile.deactivate();
      }
    });
  }

  private updateTextMesh(mesh: Mesh, text: string) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.font = "20px Arial";
    context.fillStyle = "black";
    context.fillText(text, 10, 30);

    const texture = new CanvasTexture(canvas);
    (mesh.material as MeshBasicMaterial).map = texture;
  }

  private updateOverlay() {
    // Actualizar el texto de la vida del cubo
    this.updateTextMesh(this.cubeLivesText, `Vida del Cubo: ${this.cubeLives}`);

    // Actualizar la barra de energía del cubo
    const cubeEnergyPercentage = this.cubeLives / 3; // 3 es la vida máxima del cubo
    this.cubeEnergyBar.scale.x = cubeEnergyPercentage;

    // Actualizar el texto de la vida del cono
    this.updateTextMesh(this.coneLivesText, `Vida del Cono: ${this.coneLives}`);

    // Actualizar la barra de energía del cono
    const coneEnergyPercentage = this.coneLives / 3; // 3 es la vida máxima del cono
    this.coneEnergyBar.scale.x = coneEnergyPercentage;

    // Actualizar el texto de la vida del cilindro
    this.updateTextMesh(
      this.cylinderLivesText,
      `Vida del Cilindro: ${this.cylinderLives}`
    );

    // Actualizar la barra de energía del cilindro
    const cylinderEnergyPercentage = this.cylinderLives / 3; // 3 es la vida máxima del cilindro
    this.cylinderEnergyBar.scale.x = cylinderEnergyPercentage;

    // Actualizar el texto de los obstáculos restantes
    this.updateTextMesh(
      this.obstaclesRemainingText,
      `Obstáculos Restantes: ${this.obstaclesRemaining}`
    );
  }
}

export default GameScene;
