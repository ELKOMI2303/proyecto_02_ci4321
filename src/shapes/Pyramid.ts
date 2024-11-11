import { BufferGeometry, Float32BufferAttribute, Mesh, MeshBasicMaterial, TextureLoader } from "three";

// Cargar la textura
const textureLoader = new TextureLoader();
const texture = textureLoader.load('/texturas.png'); // Cambia la ruta según corresponda

// Parámetros de la pirámide
const baseSize = 4; // Tamaño de la base (doble tamaño)
const height = 4;   // Altura de la pirámide (doble tamaño)

// Crear la geometría de la pirámide
const geometry = new BufferGeometry();

// Vértices de la pirámide (5 vértices en total)
const vertices = new Float32Array([
    // Base (cuadrado)
    -baseSize, 0, -baseSize,  // Vértice 0
    baseSize, 0, -baseSize,   // Vértice 1
    baseSize, 0,  baseSize,   // Vértice 2
    -baseSize, 0,  baseSize,  // Vértice 3
    // Punta
    0, height, 0               // Vértice 4 (punta)
]);

// Índices de los triángulos que forman las caras de la pirámide
const indices = [
    // Caras laterales (4 triángulos)
    0, 1, 4, // Cara 1
    1, 2, 4, // Cara 2
    2, 3, 4, // Cara 3
    3, 0, 4, // Cara 4
    // Base (1 cuadrado = 2 triángulos)
    0, 1, 2, 
    0, 2, 3
];

const uvs = new Float32Array([
    // Base
    2/3, 1/3, 1, 1/3, 1, 0, 2/3, 0,
    // Caras laterales (usar la última textura en todas las caras)
    // Coordenadas UV para la última textura (2/3, 0) a (1, 1/3)
    // Cada cara lateral está formada por tres vértices
    2/3, 0, 1, 0, 5/6, 1/3, // Cara 1
    2/3, 0, 1, 0, 5/6, 1/3, // Cara 2
    2/3, 0, 1, 0, 5/6, 1/3, // Cara 3
    2/3, 0, 1, 0, 5/6, 1/3  // Cara 4
]);

// Añadir los atributos a la geometría
geometry.setIndex(indices);
geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3));
geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));

// Crear el material con la textura
const material = new MeshBasicMaterial({ map: texture, side: 2 }); // 2 para que se dibuje en ambas caras

// Crear la pirámide con la geometría y el material
const pyramid = new Mesh(geometry, material);

// Colocar la pirámide si es necesario
pyramid.position.set(0, 0, 0); // Centrar la pirámide en el origen

export default pyramid;
