import {
  Mesh,
  MeshBasicMaterial,
  SphereGeometry,
  Vector3,
} from "three";

type ProjectileType = "rectilinear" | "parabolic";

class Projectile {
  public mesh: Mesh;
  private velocity: Vector3 = new Vector3(0, 0, 0);
  private type: ProjectileType = "rectilinear";
  private gravity: Vector3 = new Vector3(0, -9.81, 0); // Simulación de gravedad
  public radius: number = 0.2; // Define el radio para el proyectil

  // Estado del proyectil
  public active: boolean = false;

  constructor() {
    const geometry = new SphereGeometry(this.radius, 16, 16);
    const material = new MeshBasicMaterial({ color: 0xff0000 });
    this.mesh = new Mesh(geometry, material);
    this.mesh.visible = false; // Inicialmente inactivo
  }

  public activate(position: Vector3, direction: Vector3, speed: number, type: ProjectileType) {
    this.mesh.position.copy(position);
    this.velocity = direction.clone().normalize().multiplyScalar(speed);
    this.type = type;
    this.mesh.visible = true;
    this.active = true;
  }

  public deactivate() {
    this.mesh.visible = false;
    this.active = false;
  }

  public update(delta: number) {
    if (!this.active) return;

    if (this.type === "parabolic") {
      // Aplicar gravedad
      this.velocity.add(this.gravity.clone().multiplyScalar(delta));
    }

    this.mesh.position.add(this.velocity.clone().multiplyScalar(delta));

    // Desactivar si el proyectil está fuera de un rango específico
    if (this.mesh.position.length() > 500) {
      this.deactivate();
    }

    // Opcional: Colisiones con el suelo u otros objetos
    // Aquí puedes agregar lógica para desactivar el proyectil al colisionar
  }
}

export default Projectile;
