import { Mesh, MeshBasicMaterial, PlaneGeometry, TextureLoader } from "three";

const dn = new TextureLoader().load("/blizzard_dn.jpg");
const groundGeometry = new PlaneGeometry(10000, 10000);
const groundMaterial = new MeshBasicMaterial({ map:dn });
const plane = new Mesh(groundGeometry, groundMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = 0.5;
export default plane;