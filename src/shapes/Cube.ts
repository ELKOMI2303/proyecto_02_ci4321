import { BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, TextureLoader } from "three";

// Cargar la textura
const textureLoader = new TextureLoader();
const texture = textureLoader.load('/texturas.png'); // Cambia 'ruta_de_la_textura.jpg' por la ruta de tu imagen

// Crear la geometría del cubo con BufferGeometry
const geometry = new BufferGeometry();

// Vértices del cubo (8 vértices en total, 3 componentes por vértice: x, y, z)
const vertices = new Float32Array([
  // Frente
  -2.5, -2.5,  2.5,  2.5, -2.5,  2.5,  2.5,  2.5,  2.5,  -2.5,  2.5,  2.5,
  // Atrás
  -2.5, -2.5, -2.5,  -2.5,  2.5, -2.5,  2.5,  2.5, -2.5,  2.5, -2.5, -2.5,
  // Arriba
  -2.5,  2.5, -2.5,  -2.5,  2.5,  2.5,  2.5,  2.5,  2.5,  2.5,  2.5, -2.5,
  // Abajo
  -2.5, -2.5, -2.5,  2.5, -2.5, -2.5,  2.5, -2.5,  2.5,  -2.5, -2.5,  2.5,
  // Derecha
  2.5, -2.5, -2.5,  2.5,  2.5, -2.5,  2.5,  2.5,  2.5,  2.5, -2.5,  2.5,
  // Izquierda
  -2.5, -2.5, -2.5,  -2.5, -2.5,  2.5,  -2.5,  2.5,  2.5,  -2.5,  2.5, -2.5
]);

// Índices de los triángulos que forman las caras del cubo
const indices = [
  0, 1, 2,   2, 3, 0, // Frente
  4, 5, 6,   6, 7, 4, // Atrás
  8, 9, 10,  10, 11, 8, // Arriba
  12, 13, 14, 14, 15, 12, // Abajo
  16, 17, 18, 18, 19, 16, // Derecha
  20, 21, 22, 22, 23, 20  // Izquierda
];

// Coordenadas UV para usar la octava textura en todas las caras
const uvs = new Float32Array([
  // Frontal
  2/3, 2/3,  1, 2/3,  1, 1,  2/3, 1,
  // Atrás
  2/3, 2/3,  1, 2/3,  1, 1,  2/3, 1,
  // Arriba
  2/3, 2/3,  1, 2/3,  1, 1,  2/3, 1,
  // Abajo
  2/3, 2/3,  1, 2/3,  1, 1,  2/3, 1,
  // Derecha
  2/3, 2/3,  1, 2/3,  1, 1,  2/3, 1,
  // Izquierda
  2/3, 2/3,  1, 2/3,  1, 1,  2/3, 1
]);

// Añadir los atributos a la geometría
geometry.setIndex(indices);
geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
geometry.scale(0.5, 0.5, 0.5);

// Crear el material con la textura
const material = new MeshBasicMaterial({ map: texture });

// Crear el cubo con la geometría y el material
const cube = new Mesh(geometry, material);

export default cube;
