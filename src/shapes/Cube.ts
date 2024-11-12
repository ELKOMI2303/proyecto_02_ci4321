import { BufferGeometry, Float32BufferAttribute, Mesh, MeshStandardMaterial, TextureLoader, DoubleSide } from "three";

// Cargar la textura y el mapa de normales
const textureLoader = new TextureLoader();
const texture = textureLoader.load('/rubi.png'); // Cambia la ruta según corresponda
const normalMap = textureLoader.load('/rubi_normal.png'); // Cambia la ruta según corresponda

// Parámetros del cubo
const size = 2; // Tamaño de los lados del cubo

// Crear la geometría del cubo
const geometry = new BufferGeometry();

// Vértices del cubo (8 vértices en total)
const vertices = new Float32Array([
    // Cara frontal
    -size, -size,  size,
     size, -size,  size,
     size,  size,  size,
    -size,  size,  size,
    // Cara trasera
    -size, -size, -size,
    -size,  size, -size,
     size,  size, -size,
     size, -size, -size,
    // Cara superior
    -size,  size, -size,
    -size,  size,  size,
     size,  size,  size,
     size,  size, -size,
    // Cara inferior
    -size, -size, -size,
     size, -size, -size,
     size, -size,  size,
    -size, -size,  size,
    // Cara derecha
     size, -size, -size,
     size,  size, -size,
     size,  size,  size,
     size, -size,  size,
    // Cara izquierda
    -size, -size, -size,
    -size, -size,  size,
    -size,  size,  size,
    -size,  size, -size
]);

// Normales para el cubo (una normal por vértice)
const normals = new Float32Array([
    // Cara frontal
    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
    // Cara trasera
    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
    // Cara superior
    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
    // Cara inferior
    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
    // Cara derecha
    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
    // Cara izquierda
    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0
]);

// Índices de los triángulos que forman las caras del cubo
const indices = [
    // Cara frontal
    0, 1, 2, 0, 2, 3,
    // Cara trasera
    4, 5, 6, 4, 6, 7,
    // Cara superior
    8, 9, 10, 8, 10, 11,
    // Cara inferior
    12, 13, 14, 12, 14, 15,
    // Cara derecha
    16, 17, 18, 16, 18, 19,
    // Cara izquierda
    20, 21, 22, 20, 22, 23
];

// Coordenadas UV
const uvs = new Float32Array([
    // Cara frontal
    0, 0, 1, 0, 1, 1, 0, 1,
    // Cara trasera
    0, 0, 1, 0, 1, 1, 0, 1,
    // Cara superior
    0, 0, 1, 0, 1, 1, 0, 1,
    // Cara inferior
    0, 0, 1, 0, 1, 1, 0, 1,
    // Cara derecha
    0, 0, 1, 0, 1, 1, 0, 1,
    // Cara izquierda
    0, 0, 1, 0, 1, 1, 0, 1
]);

// Añadir los atributos a la geometría
geometry.setIndex(indices);
geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

// Crear el material con la textura y el mapa de normales
const material = new MeshStandardMaterial({
    map: texture,
    normalMap: normalMap,
    side: DoubleSide // Para que se dibuje en ambas caras
});

// Crear el cubo con la geometría y el material
const cube = new Mesh(geometry, material);

// Colocar el cubo si es necesario
cube.position.set(0, 0, 0); // Centrar el cubo en el origen

export default cube;
