// Vehicle.ts
import {
  Group,
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Object3D,
  Vector3,
  Quaternion,
  ArrowHelper,
  BufferGeometry,
  BufferAttribute,
  DoubleSide,
  // MeshPhongMaterial,
  MeshStandardMaterial,
} from "three";

import Projectile from "./Projectile"; // Asegúrate de ajustar la ruta según tu estructura de carpetas

type ProjectileType = "rectilinear" | "parabolic";

class Vehicle {
  public group: Group;
  private cannon: Object3D;
  private cannonSphere: Mesh;
  private cannonBarrelContainer: Object3D;
  private cannonBarrel: Mesh;
  private speed: number;
  private rotationSpeed: number;
  private wheels: Mesh[] = [];
  private wheelCenters: Mesh[] = [];
  private cannonSphereContainer: Object3D;

  // Object Pool de proyectiles
  private projectilePool: Projectile[] = [];
  private poolSize: number = 10; // Puedes ajustar el tamaño según tus necesidades

  // private velocity: Vector3 = new Vector3();
  private direction: Vector3 = new Vector3(0, 0, 1); // Dirección inicial hacia adelante
  private up: Vector3 = new Vector3(0, 1, 0); // Eje Y

  // Flecha para visualizar la dirección del disparo
  private directionArrow: ArrowHelper;

  // Variables para controlar la inclinación del cañón
  private currentPitch: number = 0; // Ángulo de inclinación actual en radianes
  private minPitch: number = -Math.PI / 8; // -22.5 grados
  private maxPitch: number = Math.PI / 4; // 45 grados
  private muzzle: Object3D; // Punto de montaje en la boquilla del cañó
  // Método para obtener el pool de proyectiles
  public getProjectiles(): Projectile[] {
    return this.projectilePool;
  }

  constructor() {
    this.group = new Group();

    const bodyGeometry = new BufferGeometry();

    // Definimos los vértices del paralelepípedo
    const vertices = new Float32Array([
      // Frente
      -2.25,
      -1,
      -3, // Vértice 0
      2.25,
      -1,
      -3, // Vértice 1
      2.25,
      1,
      -3, // Vértice 2
      -2.25,
      1,
      -3, // Vértice 3
      // Atrás
      -2.25,
      -1,
      3, // Vértice 4
      2.25,
      -1,
      3, // Vértice 5
      2.25,
      1,
      3, // Vértice 6
      -2.25,
      1,
      3, // Vértice 7
    ]);

    const indices = new Uint16Array([
      // Caras frontales
      0, 1, 2, 0, 2, 3,
      // Caras traseras
      4, 6, 5, 4, 7, 6,
      // Caras laterales
      0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0,
    ]);

    // Asignamos los atributos de posición y los índices a la geometría
    bodyGeometry.setAttribute("position", new BufferAttribute(vertices, 3));
    bodyGeometry.setIndex(new BufferAttribute(indices, 1));

    // Computar normales para asegurar que las caras se rendericen correctamente
    bodyGeometry.computeVertexNormals();

    // Crear el material metalizado verde militar
    const bodyMaterial = new MeshStandardMaterial({
      color: 0x6b8e23, // Verde militar claro
      metalness: 0.8, // Alto nivel de metalizado
      roughness: 0.2, // Suavidad de la superficie
      side: DoubleSide, // Asegura que ambas caras sean visibles
    });

    // Esta propiedad asegura que el material no será transparente.
    bodyMaterial.depthWrite = true;

    // Crear el mesh del cuerpo y asignar la geometría y el material
    const body = new Mesh(bodyGeometry, bodyMaterial);
    body.position.y = 1;
    this.group.add(body);

    // Crear la geometría de las ruedas (cilindros)
    const wheelGeometry = new BufferGeometry();
    const segments = 32;
    const radius_cilinder = 1;
    const halfHeight = 0.25;
    const wheelVertices = [];
    const wheelIndices = [];

    // Crear los vértices del cilindro y las tapas
    wheelVertices.push(0, halfHeight, 0); // Centro tapa superior
    wheelVertices.push(0, -halfHeight, 0); // Centro tapa inferior
    for (let i = 0; i <= segments; i++) {
      const theta = (i / segments) * Math.PI * 2;
      const x = Math.cos(theta) * radius_cilinder;
      const z = Math.sin(theta) * radius_cilinder;
      // Parte superior del cilindro
      wheelVertices.push(x, halfHeight, z);
      // Parte inferior del cilindro
      wheelVertices.push(x, -halfHeight, z);
    }

    // Crear índices para los triángulos de las caras laterales del cilindro
    for (let i = 0; i < segments; i++) {
      const top1 = 2 + i * 2;
      const top2 = 2 + (i + 1) * 2;
      const bottom1 = 2 + i * 2 + 1;
      const bottom2 = 2 + (i + 1) * 2 + 1;
      // Caras laterales
      wheelIndices.push(top1, bottom1, bottom2);
      wheelIndices.push(top1, bottom2, top2);
    }

    // Índices para las tapas (superior e inferior)
    for (let i = 0; i < segments; i++) {
      const topVertex = 2 + i * 2;
      const nextTopVertex = 2 + ((i + 1) % segments) * 2;
      const bottomVertex = 2 + i * 2 + 1;
      const nextBottomVertex = 2 + ((i + 1) % segments) * 2 + 1;
      // Tapa superior (usando el vértice del centro de la tapa superior)
      wheelIndices.push(0, topVertex, nextTopVertex);
      // Tapa inferior (usando el vértice del centro de la tapa inferior)
      wheelIndices.push(1, nextBottomVertex, bottomVertex);
    }

    wheelGeometry.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(wheelVertices), 3)
    );
    wheelGeometry.setIndex(wheelIndices);

    // Crear la geometría del centro de las ruedas (cubos)
    const centerGeometry = new BufferGeometry();
    const centerVertices = new Float32Array([
      // Frente
      -0.3, -0.3, 0.3, 0.3, -0.3, 0.3, 0.3, 0.3, 0.3, -0.3, 0.3, 0.3,
      // Atrás
      -0.3, -0.3, -0.3, 0.3, -0.3, -0.3, 0.3, 0.3, -0.3, -0.3, 0.3, -0.3,
    ]);
    const centerIndices = [
      // Frente
      0, 1, 2, 0, 2, 3,
      // Atrás
      4, 6, 5, 4, 7, 6,
      // Lados
      0, 4, 5, 0, 5, 1, 1, 5, 6, 1, 6, 2, 2, 6, 7, 2, 7, 3, 3, 7, 4, 3, 4, 0,
    ];

    wheelGeometry.computeVertexNormals();
    centerGeometry.setAttribute(
      "position",
      new BufferAttribute(centerVertices, 3)
    );
    centerGeometry.setIndex(centerIndices);

    // Materiales
    const wheelMaterial = new MeshStandardMaterial({
      color: 0x6b8e23, // Verde militar claro
      metalness: 0.8,
      roughness: 0.2,
      side: DoubleSide,
    });
    wheelMaterial.depthWrite = true;

    const centerMaterial = new MeshBasicMaterial({
      color: 0xffffff, // Blanco
      side: DoubleSide,
    });
    centerMaterial.depthWrite = true;

    // Posiciones de las ruedas
    const wheelPositions = [
      [-2.5, 0.5, -2], // Trasera izquierda
      [2.5, 0.5, -2], // Trasera derecha
      [-2.5, 0.5, 2], // Delantera izquierda
      [2.5, 0.5, 2], // Delantera derecha
    ];

    // Crear ruedas y centros de las ruedas
    wheelPositions.forEach((pos) => {
      // Añadir las ruedas
      const wheel = new Mesh(wheelGeometry, wheelMaterial);
      wheel.rotation.z = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      this.group.add(wheel);
      this.wheels.push(wheel);

      // Añadir los centros de las ruedas
      const wheelCenter = new Mesh(centerGeometry, centerMaterial);
      wheelCenter.position.set(pos[0], pos[1], pos[2]);
      this.group.add(wheelCenter);
      this.wheelCenters.push(wheelCenter);
    });
    // Cañón
    this.cannon = new Object3D();
    // Parámetros para la esfera
    const radius = 1.8;
    const widthSegments = 32;
    const heightSegments = 32;

    // Crear BufferGeometry
    const cannonSphereGeometry = new BufferGeometry();

    // Arrays para almacenar los vértices, normales e índices
    const vertices_esphere = [];
    const normals_esphere = [];
    const indices_esphere = [];

    // Crear vértices y normales
    for (let y = 0; y <= heightSegments; y++) {
      const v = y / heightSegments;
      const theta = v * Math.PI;
      for (let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments;
        const phi = u * Math.PI * 2;
        // Coordenadas esféricas
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);
        const sinPhi = Math.sin(phi);
        const cosPhi = Math.cos(phi);
        // Calcular posición del vértice
        const vertexX = radius * sinTheta * cosPhi;
        const vertexY = radius * cosTheta;
        const vertexZ = radius * sinTheta * sinPhi;
        // Añadir el vértice
        vertices_esphere.push(vertexX, vertexY, vertexZ);
        // Calcular normales
        normals_esphere.push(
          vertexX / radius,
          vertexY / radius,
          vertexZ / radius
        );
      }
    }

    // Crear los índices para los triángulos
    for (let y = 0; y < heightSegments; y++) {
      for (let x = 0; x < widthSegments; x++) {
        const a = x + (widthSegments + 1) * y;
        const b = x + (widthSegments + 1) * (y + 1);
        const c = x + 1 + (widthSegments + 1) * y;
        const d = x + 1 + (widthSegments + 1) * (y + 1);
        // Primer triángulo
        indices_esphere.push(a, b, d);
        // Segundo triángulo
        indices_esphere.push(a, d, c);
      }
    }

    // Convertir los arrays a tipos de datos de Three.js
    const vertexArray = new Float32Array(vertices_esphere);
    const normalArray = new Float32Array(normals_esphere);
    const indexArray = new Uint16Array(indices_esphere);

    // Crear el contenedor de la esfera del cañón
    this.cannonSphereContainer = new Object3D();
    this.cannonSphereContainer.position.set(0, 0, -3); // Posición del contenedor

    // Asignar los atributos a la geometría
    cannonSphereGeometry.setAttribute(
      "position",
      new BufferAttribute(vertexArray, 3)
    );
    cannonSphereGeometry.setAttribute(
      "normal",
      new BufferAttribute(normalArray, 3)
    );
    cannonSphereGeometry.setIndex(new BufferAttribute(indexArray, 1));

    // Crear material metalizado marrón militar oscuro para la esfera del cañón
    const cannonSphereMaterial = new MeshStandardMaterial({
      color: 0x4b2e0b, // Marrón militar oscuro
      metalness: 0.8,
      roughness: 0.2,
      side: DoubleSide,
    });
    cannonSphereMaterial.depthWrite = true;

    // Crear el mesh de la esfera del cañón y asignar la geometría y el material
    this.cannonSphere = new Mesh(cannonSphereGeometry, cannonSphereMaterial);
    this.cannonSphere.position.set(0, 0, 0);

    // Añadir la esfera al contenedor y configurar sombras
    this.cannonSphereContainer.add(this.cannonSphere);
    this.cannonSphere.castShadow = true; // Proyecta sombras
    this.cannonSphere.receiveShadow = true; // Recibe sombras

    // Añadir el contenedor de la esfera al cañón
    this.cannon.add(this.cannonSphereContainer);
    // Contenedor del barril del cañón
    this.cannonBarrelContainer = new Object3D();
    this.cannonBarrelContainer.position.set(0, 0, -3);

    // Barril del cañón
    // Barril del cañón usando BufferGeometry
    const cannonBarrelGeometry = new BufferGeometry();

    const cannonBarrelVertices = new Float32Array([
      // Frente (z positivo)
      -0.25,
      -0.25,
      1.5, // Vértice 0
      0.25,
      -0.25,
      1.5, // Vértice 1
      0.25,
      0.25,
      1.5, // Vértice 2
      -0.25,
      0.25,
      1.5, // Vértice 3

      // Atrás (z negativo)
      -0.25,
      -0.25,
      -1.5, // Vértice 4
      0.25,
      -0.25,
      -1.5, // Vértice 5
      0.25,
      0.25,
      -1.5, // Vértice 6
      -0.25,
      0.25,
      -1.5, // Vértice 7
    ]);

    const cannonBarrelIndices = [
      // Frente
      0,
      1,
      2,
      0,
      2,
      3,
      // Atrás
      4,
      6,
      5,
      4,
      7,
      6,
      // Lados
      0,
      4,
      5,
      0,
      5,
      1, // Lado 1
      1,
      5,
      6,
      1,
      6,
      2, // Lado 2
      2,
      6,
      7,
      2,
      7,
      3, // Lado 3
      3,
      7,
      4,
      3,
      4,
      0, // Lado 4
    ];

    // Asignar vértices e índices al BufferGeometry
    cannonBarrelGeometry.setAttribute(
      "position",
      new BufferAttribute(cannonBarrelVertices, 3)
    );
    cannonBarrelGeometry.setIndex(cannonBarrelIndices);
    cannonBarrelGeometry.computeVertexNormals();

    // Material del barrilRo
    const cannonBarrelMaterial = new MeshStandardMaterial({
      color: 0x6b8e23, // Verde militar claro
      metalness: 0.8,
      roughness: 0.2,
      side: DoubleSide,
    });
    cannonBarrelMaterial.depthWrite = true;
    // Crear el Mesh del barril
    this.cannonBarrel = new Mesh(cannonBarrelGeometry, cannonBarrelMaterial);

    // Posicionar el barril
    this.cannonBarrel.position.set(0, 1, 1.5); // Apunta hacia adelante
    this.cannonBarrelContainer.add(this.cannonBarrel);
    this.cannon.add(this.cannonBarrelContainer);

    // Punto de salida del proyectil (muzzle)
    this.muzzle = new Object3D();
    this.muzzle.position.set(0, -1, 1.5); // Cambiado de -1.5 a 1.5 para coincidir con la dirección positiva
    this.cannonBarrel.add(this.muzzle);

    // Visualización opcional del muzzle
    const muzzleGeometry = new SphereGeometry(0.1, 8, 8);
    const muzzleMaterial = new MeshBasicMaterial({ color: 0xffff00 });
    const muzzleMarker = new Mesh(muzzleGeometry, muzzleMaterial);
    muzzleMarker.position.set(0, 1, 0);
    this.muzzle.add(muzzleMarker);

    // Agregar la flecha para visualizar la dirección del disparo
    // this.directionArrow = new ArrowHelper(
    //   new Vector3(0, 0, 0), // Cambiado de (0, 0, -1) a (0, 0, 1) para apuntar hacia adelante
    //   new Vector3(0, 0, 0), // Punto de inicio relativo al muzzle
    //   2, // Longitud
    //   new Color(0x00ff00) // Color verde
    // );
    this.directionArrow = new ArrowHelper(
      this.direction,
      this.muzzle.position,
      5,
      0xff0000
    );
    // this.group.add(this.directionArrow);

    // this.muzzle.add(this.directionArrow);

    this.cannon.position.set(0, 2, 3);
    this.group.add(this.cannon);

    this.group.position.y = 1;

    // Inicializar el pool de proyectiles
    for (let i = 0; i < this.poolSize; i++) {
      const projectile = new Projectile();
      this.group.add(projectile.mesh); // Añadir a la escena del vehículo
      this.projectilePool.push(projectile);
    }

    // Velocidad del vehículo
    this.speed = 30; // unidades por segundo
    this.rotationSpeed = Math.PI / 4; // radianes por segundo
    // this.cannonRotationSpeed = this.rotationSpeed;
    // Inicializar la rotación del cañón
    this.cannonBarrel.rotation.x = 0; // Asegurar que la rotación inicial sea 0
    this.currentPitch = 0; // Establecer el ángulo de inclinación actual
  }

  // Rotación del cañón en yaw usando quaternions
  // Rotación del cañón en yaw usando quaternions
  public rotateCannonYaw(angle: number) {
    const quaternion = new Quaternion().setFromAxisAngle(this.up, angle);

    // Aplicar la rotación del cañón sobre la rotación del vehículo
    this.cannonBarrelContainer.quaternion.multiplyQuaternions(
      quaternion,
      this.cannonBarrelContainer.quaternion
    );

    // Actualizar la flecha de dirección
    // this.updateDirectionArrow();
  }

  public rotateCannonPitch(angle: number) {
    let newPitch = this.currentPitch + angle;

    // Ajuste: Limitar el ángulo hacia abajo a menos del máximo
    const maxDownPitch = this.maxPitch * 0.46; // Por ejemplo, 80% del máximo
    newPitch = Math.max(this.minPitch, Math.min(newPitch, maxDownPitch));

    const limitedAngle = newPitch - this.currentPitch;
    this.currentPitch = newPitch;
    const quaternion = new Quaternion().setFromAxisAngle(
      new Vector3(1, 0, 0),
      limitedAngle
    );

    this.rotateCannonSphere(angle);

    // Aplicar la rotación del cañón en pitch
    this.cannonBarrel.quaternion.multiplyQuaternions(
      quaternion,
      this.cannonBarrel.quaternion
    );

    // Actualizar la flecha de dirección
    // this.updateDirectionArrow();
  }

  // Rotación del vehículo hacia la izquierda
  public rotateLeft(delta: number) {
    const angle = this.rotationSpeed * delta;
    const quaternion = new Quaternion().setFromAxisAngle(this.up, angle);

    // Guardar la rotación actual del cañón
    const currentCannonRotation = this.cannonBarrelContainer.quaternion.clone();

    // Aplicar la rotación al vehículo
    this.group.quaternion.multiplyQuaternions(
      quaternion,
      this.group.quaternion
    );

    // Reaplicar la rotación del cañón
    this.cannonBarrelContainer.quaternion.copy(currentCannonRotation);
    // this.updateCannonPosition();
    // Actualiza la flecha de dirección
    // this.updateDirectionArrow();
  }

  // Rotación del vehículo hacia la derecha
  public rotateRight(delta: number) {
    const angle = -this.rotationSpeed * delta;
    const quaternion = new Quaternion().setFromAxisAngle(this.up, angle);

    // Guardar la rotación actual del cañón
    const currentCannonRotation = this.cannonBarrelContainer.quaternion.clone();

    // Aplicar la rotación al vehículo
    this.group.quaternion.multiplyQuaternions(
      quaternion,
      this.group.quaternion
    );

    // Reaplicar la rotación del cañón
    this.cannonBarrelContainer.quaternion.copy(currentCannonRotation);
    // this.updateCannonPosition();
    // Actualiza la flecha de dirección
    // this.updateDirectionArrow();
  }

  // Movimiento hacia adelante
  public moveForward(delta: number) {
    const moveVector = this.direction
      .clone()
      .multiplyScalar(this.speed * delta);
    this.group.position.add(moveVector);
    this.rotateWheels(this.speed * delta);
    // this.updateCannonPosition();
  }

  // Movimiento hacia atrás
  public moveBackward(delta: number) {
    const moveVector = this.direction
      .clone()
      .multiplyScalar(-this.speed * delta);
    this.group.position.add(moveVector);
    this.rotateWheels(-this.speed * delta);
    // this.updateCannonPosition();
  }

  // Rotación de las ruedas
  private rotateWheels(angle: number) {
    this.wheels.forEach((wheel) => {
      wheel.rotation.x += angle;
    });
    this.wheelCenters.forEach((center) => {
      center.rotation.x += angle;
    });
  }

  // Obtener un proyectil disponible del pool
  private getAvailableProjectile(): Projectile | null {
    for (const projectile of this.projectilePool) {
      if (!projectile.active) {
        return projectile;
      }
    }
    return null; // No hay proyectiles disponibles
  }

  // Método para actualizar la flecha de dirección
  private updateDirectionArrow() {
    // Asegurarse de que las matrices están actualizadas
    this.group.updateMatrixWorld(true);
    this.cannonBarrel.updateMatrixWorld(true);
    this.muzzle.updateMatrixWorld(true);

    // Obtener la dirección actual del muzzle
    const direction = new Vector3();
    this.muzzle.getWorldDirection(direction).normalize();

    // Actualizar la flecha
    this.directionArrow.setDirection(direction);
    this.directionArrow.setLength(2);
    this.directionArrow.position.copy(
      this.muzzle.getWorldPosition(new Vector3())
    );
  }

  // Método para disparar un proyectil
  public shoot(type: ProjectileType = "rectilinear") {
    const projectile = this.getAvailableProjectile();
    if (!projectile) {
      console.warn("No hay proyectiles disponibles en el pool.");
      return;
    }

    // Asegurarse de que las matrices están actualizadas
    this.group.updateMatrixWorld(true);
    this.cannonBarrel.updateMatrixWorld(true);
    this.muzzle.updateMatrixWorld(true);

    // Obtener la posición del muzzle en el espacio mundial
    const barrelEnd = new Vector3();
    this.muzzle.getWorldPosition(barrelEnd);

    // Obtener la dirección del muzzle en el espacio mundial
    const direction = new Vector3(0, 0, 1);
    // this.muzzle.getWorldDirection(direction).normalize();
    direction.applyQuaternion(
      this.cannonBarrel.getWorldQuaternion(new Quaternion())
    );

    // No invertir la dirección si la flecha está correctamente orientada
    // direction.negate(); // Comentar o eliminar esta línea

    // Log para depuración
    console.log("Posición del Muzzle:", barrelEnd);
    console.log("Dirección del Muzzle:", direction);

    const speed = type === "rectilinear" ? 20 : 15; // Velocidad ajustada según el tipo
    projectile.activate(barrelEnd, direction.normalize(), speed, type);
  }

  // Función para rotar la esfera sobre su propio eje
  public rotateCannonSphere(angle: number) {
    const quaternion = new Quaternion().setFromAxisAngle(
      new Vector3(0, 1, 0),
      angle
    ); // Rotar en el eje Y por ejemplo
    this.cannonSphereContainer.quaternion.multiplyQuaternions(
      quaternion,
      this.cannonSphereContainer.quaternion
    );

    // Actualizar cualquier otro componente si es necesario
    // this.updateDirectionArrow();
  }

  // Actualización del vehículo
  public update(delta: number) {
    // Actualizar proyectiles
    this.projectilePool.forEach((projectile) => {
      projectile.update(delta);
    });

    // Recalcular la dirección basada en la orientación actual del grupo
    this.direction
      .set(0, 0, 1)
      .applyQuaternion(this.group.quaternion)
      .normalize();

    // Actualizar la flecha de dirección
    // this.updateDirectionArrow();
  }

  public updateCannonPosition() {
    // Obtener la posición actual del vehículo
    const vehiclePosition = this.group.position.clone();

    // Ajustar la posición del cañón para que siga al vehículo (pero no la rotación)
    this.cannon.position.set(
      vehiclePosition.x, // Misma posición X
      vehiclePosition.y + 2, // Ajuste en Y para mantener el cañón en la parte superior del vehículo
      vehiclePosition.z + 3 // Posición en Z hacia adelante para que el cañón apunte correctamente
    );
  }
}

export default Vehicle;
