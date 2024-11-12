import { BufferGeometry, Float32BufferAttribute, Mesh, MeshStandardMaterial, TextureLoader, DoubleSide } from "three";

// Cargar la textura y el mapa de normales
const textureLoader = new TextureLoader();
const texture = textureLoader.load('/hielo.png'); // Cambia la ruta según corresponda
const normalMap = textureLoader.load('/hielo_normal.png'); // Cambia la ruta según corresponda

// Parámetros de la esfera
const radius = 2;
const widthSegments = 16;
const heightSegments = 16;

const vertices = [];
const normals = [];
const uvs = [];
const indices = [];

// Generar vértices, normales y coordenadas UV
for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const theta = v * Math.PI;

    for (let x = 0; x <= widthSegments; x++) {
        const u = x / widthSegments;
        const phi = u * Math.PI * 2;

        const vertexX = radius * Math.cos(phi) * Math.sin(theta);
        const vertexY = radius * Math.cos(theta);
        const vertexZ = radius * Math.sin(phi) * Math.sin(theta);

        vertices.push(vertexX, vertexY, vertexZ);

        // Añadir las normales del vértice
        const normalX = Math.cos(phi) * Math.sin(theta);
        const normalY = Math.cos(theta);
        const normalZ = Math.sin(phi) * Math.sin(theta);
        normals.push(normalX, normalY, normalZ);

        uvs.push(u, v);
    }
}

// Generar índices
for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < widthSegments; x++) {
        const i1 = y * (widthSegments + 1) + x;
        const i2 = i1 + widthSegments + 1;

        indices.push(i1, i2, i1 + 1);
        indices.push(i1 + 1, i2, i2 + 1);
    }
}

// Crear la geometría de la esfera
const geometry = new BufferGeometry();
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

// Crear la esfera con la geometría y el material
const sphere = new Mesh(geometry, material);

// Colocar la esfera si es necesario
sphere.position.set(0, 0, 0); // Centrar la esfera en el origen

export default sphere;
