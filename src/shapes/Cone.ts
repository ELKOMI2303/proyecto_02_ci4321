import { BufferGeometry, Float32BufferAttribute, Mesh, MeshStandardMaterial, TextureLoader, DoubleSide } from "three";

// Cargar la textura y el mapa de normales
const textureLoader = new TextureLoader();
const texture = textureLoader.load('/stone.png'); // Cambia la ruta según corresponda
const normalMap = textureLoader.load('/stone_normal.png'); // Cambia la ruta según corresponda

// Parámetros del cono
const radius = 4; // Radio de la base del cono
const height = 5; // Altura del cono
const radialSegments = 16; // Segmentos radiales para la base

// Crear la geometría del cono
const geometry = new BufferGeometry();

const vertices = [];
const normals = [];
const uvs = [];
const indices = [];

// Generar vértices y coordenadas UV para el cuerpo del cono
for (let y = 0; y <= 1; y++) {
    const v = y;
    const yPosition = y * height - height / 2;

    for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const angle = u * Math.PI * 2;

        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        if (y === 0) {
            vertices.push(radius * cos, -height / 2, radius * sin); // Vértices en la base
            normals.push(cos, 0, sin); // Normales perpendiculares a la base
        } else {
            vertices.push(0, height / 2, 0); // Vértice de la punta
            normals.push(0, 1, 0); // Normal hacia arriba
        }
        uvs.push(u, v);
    }
}

// Generar índices para los triángulos que forman las caras del cono
for (let x = 0; x < radialSegments; x++) {
    const i1 = x;
    const i2 = x + radialSegments + 1;
    const i3 = i1 + 1;
    const i4 = i2 + 1;

    indices.push(i1, i2, i3); // Triángulos laterales
}

// Añadir tapa inferior del cono
for (let x = 0; x < radialSegments; x++) {
    const i1 = radialSegments + 1;
    const i2 = x;
    const i3 = x + 1;

    indices.push(i1, i2, i3);
}

const centerIndex = vertices.length / 3;
vertices.push(0, -height / 2, 0); // Centro de la base
normals.push(0, -1, 0); // Normal hacia abajo
uvs.push(0.5, 0.5); // Coordenada UV en el centro

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

// Crear el cono con la geometría y el material
const cone = new Mesh(geometry, material);

// Colocar el cono si es necesario
cone.position.set(0, 0, 0); // Centrar el cono en el origen

export default cone;
