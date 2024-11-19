import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Vector3,
  PointLight,
  Mesh,
  OrthographicCamera,
  CanvasTexture,
  MeshBasicMaterial,
  PlaneGeometry,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Vehicle from "../entyties/Vehicle";
import cube from "../shapes/Cube";
import skybox from "../shapes/Skybox";
import plane from "../shapes/plane";
// import cylinder from "../shapes/cone";
import cone from "../shapes/Cone";
// import sphere from "../shapes/Esphere";
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

  // Elementos de la interfaz
  private cubeLivesText!: Mesh;
  private coneLivesText!: Mesh;
  private cylinderLivesText!: Mesh;
  private obstaclesRemainingText!: Mesh;
  private cubeEnergyBar!: Mesh;
  private coneEnergyBar!: Mesh;
  private cylinderEnergyBar!: Mesh;

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

    // Añadir los elementos a la escena del overlay
    this._overlayScene.add(
      this.obstaclesRemainingText,
      this.cubeLivesText,
      this.coneLivesText,
      this.cylinderLivesText,
      this.cubeEnergyBar,
      this.coneEnergyBar,
      this.cylinderEnergyBar
    );
  }

  private createTextMesh(text: string): Mesh {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    context.font = "20px Arial";
    context.fillStyle = "white";
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
    const ambientLight = new AmbientLight(0x808080); // Luz ambiental más intensa
    this._scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 1.5); // Ajustar la intensidad
    directionalLight.position.set(15, 100, -100); // Ajustar la posición para iluminar desde arriba
    directionalLight.target.position.set(0, 0, 0); // Apuntar al centro de las figuras
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048);
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;
    this._scene.add(directionalLight);
    this._scene.add(directionalLight.target);

    const pointLight = new PointLight(0xffffff, 1); // Luz puntual adicional cerca de la esfera
    pointLight.position.set(15, 5, 10);
    this._scene.add(pointLight);
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
    }
  };

  public load = () => {
    this._scene.add(skybox);
    skybox.position.set(0, 0, 0);

    this._scene.add(plane);

    // Añadir el cubo a la escena
    this._scene.add(cube);
    this._scene.add(cone);

    this._scene.add(cylinder);

    cone.position.set(30, 1.5, 10);

    cylinder.position.set(15, 3, 10);

    //sphere.position.set(15, 3, 10);

    // Opcional: Ajustar la posición del cubo si es necesario
    cube.position.set(0, 1.5, 10); // Mueve el cubo en la escena según lo necesites
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
    context.fillStyle = "white";
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
