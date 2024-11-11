import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  AmbientLight,
  DirectionalLight,
  Vector3,
  PointLight,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Vehicle from "../entyties/Vehicle";
import cube from "../shapes/Cube";
import skybox from "../shapes/Skybox";
import plane from "../shapes/plane";
// import cylinder from "../shapes/Pyramid";
import pyramid from "../shapes/Pyramid";

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
  private cubeHits: number = 0;
  private cameraDistance: number = 50; // Distancia detrás del vehículo
  private cameraHeight: number = 25; // Altura de la cámara sobre el vehículo
  private isThirdPerson: boolean = false; // Estado para la cámara en tercera persona
  private cubeLives: number = 3;
  private pyramidLives: number = 3;

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

    this._vehicle = new Vehicle();
    this._scene.add(this._vehicle.group);
  }
  private addLights() {
    const ambientLight = new AmbientLight(0x808080); // Luz ambiental más intensa
    this._scene.add(ambientLight);

    const directionalLight = new DirectionalLight(0xffffff, 2); // Incrementar la intensidad de la luz direccional
    directionalLight.position.set(50, 100, 50); // Posición para simular el sol en el cielo
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.set(2048, 2048); // Mayor resolución de sombras
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 500;

    this._scene.add(directionalLight);

    const pointLight = new PointLight(0xffffff, 1); // Luz puntual adicional cerca de la esfera
    pointLight.position.set(0, 5, 0); // Ajustar la posición según sea necesario
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
    this._scene.add(pyramid);

    pyramid.position.set(20, 1.5, 10);

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
    const delta = (time - this.lastTime);

    if (delta > interval) {
        this.lastTime = time - (delta % interval);  // Ajustar el tiempo para evitar acumulación de retrasos

        if (this.isThirdPerson) {
            this.updateCameraPosition(); // Actualizar posición de la cámara en tercera persona
        } else {
            this._controls.update(); // Actualiza los controles si está en primera persona
        }

        this._vehicle.update(delta / 1000);  // Pasar delta en segundos
        this.checkCollisions();

        this._renderer.render(this._scene, this._camera);
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
    const pyramidRadius = pyramid.geometry.boundingSphere?.radius || 1.5; // Radio de la pirámide

    projectiles.forEach((projectile) => {
      // Supón que el proyectil tiene una geometría esférica
      const projectileRadius =
        projectile.mesh.geometry.boundingSphere?.radius || 0.5; // Radio del proyectil

      // Suma de los radios de ambos objetos
      const combinedRadiusCube = cubeRadius + projectileRadius;
      const combinedRadiusPyramid = pyramidRadius + projectileRadius;

      // Calcula la distancia entre el proyectil y el cubo
      const distanceToCube = this.distanceBetween(
        projectile.mesh.position,
        cube.position
      );

      // Calcula la distancia entre el proyectil y la pirámide
      const distanceToPyramid = this.distanceBetween(
        projectile.mesh.position,
        pyramid.position
      );

      // Verifica si la distancia es menor o igual a la suma de los radios del cubo
      if (
        projectile.active &&
        distanceToCube <= combinedRadiusCube &&
        this.cubeLives > 0
      ) {
        console.log("Hit on the cube!");
        this.cubeLives -= 1;
        cube.material.color.setHex(0xff0000);
        this._scene.remove(projectile.mesh);
        projectile.deactivate();

        setTimeout(() => {
          if (this.cubeLives > 0) {
            cube.material.color.setHex(0x00ff00);
          }
        }, 200);

        if (this.cubeLives <= 0) {
          this._scene.remove(cube);
          console.log("Cube destroyed!");
        }
      } else if (
        projectile.active &&
        distanceToPyramid <= combinedRadiusPyramid &&
        this.pyramidLives > 0
      ) {
        console.log("Hit on the pyramid!");
        this.pyramidLives -= 1;
        pyramid.material.color.setHex(0xff0000);
        this._scene.remove(projectile.mesh);
        projectile.deactivate();

        setTimeout(() => {
          if (this.pyramidLives > 0) {
            pyramid.material.color.setHex(0x00ff00);
          }
        }, 200);

        if (this.pyramidLives <= 0) {
          this._scene.remove(pyramid);
          console.log("Pyramid destroyed!");
        }
      } else if (projectile.active && projectile.mesh.position.y <= 0) {
        console.log("Hit on the ground!");
        this._scene.remove(projectile.mesh);
        projectile.deactivate();
      }
    });
  }
}

export default GameScene;
