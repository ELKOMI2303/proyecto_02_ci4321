import { BufferGeometry, Float32BufferAttribute, Mesh, MeshStandardMaterial, TextureLoader, DoubleSide } from "three";

// Cargar la textura y el mapa de normales
const textureLoader = new TextureLoader();
const texture = textureLoader.load('/hielo.png'); // Cambia la ruta según corresponda
const normalMap = textureLoader.load('/hielo_normal.png'); // Cambia la ruta según corresponda

// Parámetros del cilindro
const radiusTop = 2;
const radiusBottom = 2;
const height = 4;
const radialSegments = 16;
const heightSegments = 1;

// Crear la geometría del cilindro
const geometry = new BufferGeometry();

const vertices = [];
const normals = [];
const uvs = [];
const indices = [];

// Generar vértices y coordenadas UV para el cilindro
for (let y = 0; y <= heightSegments; y++) {
    const v = y / heightSegments;
    const yPosition = v * height - height / 2;

    for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const angle = u * Math.PI * 2;

        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        vertices.push(radiusTop * cos, yPosition, radiusTop * sin);
        normals.push(cos, 0, sin);
        uvs.push(u, v);
    }
}

// Generar índices para los triángulos que forman las caras del cilindro
for (let y = 0; y < heightSegments; y++) {
    for (let x = 0; x < radialSegments; x++) {
        const i1 = y * (radialSegments + 1) + x;
        const i2 = i1 + radialSegments + 1;

        indices.push(i1, i2, i1 + 1);
        indices.push(i1 + 1, i2, i2 + 1);
    }
}

// Crear la geometría de las tapas del cilindro
for (let cap = 0; cap < 2; cap++) {
    const radius = (cap === 0) ? radiusTop : radiusBottom;
    const sign = (cap === 0) ? 1 : -1;
    const yPosition = (cap === 0) ? height / 2 : -height / 2;

    const centerIndex = vertices.length / 3;

    // Centro de la tapa
    vertices.push(0, yPosition, 0);
    normals.push(0, sign, 0);
    uvs.push(0.5, 0.5);

    for (let x = 0; x <= radialSegments; x++) {
        const u = x / radialSegments;
        const angle = u * Math.PI * 2;

        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        vertices.push(radius * cos, yPosition, radius * sin);
        normals.push(0, sign, 0);
        uvs.push(0.5 + 0.5 * cos, 0.5 + 0.5 * sin);
    }

    for (let x = 0; x < radialSegments; x++) {
        const i1 = centerIndex;
        const i2 = centerIndex + x + 1;
        const i3 = centerIndex + x + 2;

        indices.push(i1, i2, i3);
    }
}

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

// Crear el cilindro con la geometría y el material
const cylinder = new Mesh(geometry, material);

// Colocar el cilindro si es necesario
cylinder.position.set(0, 0, 0); // Centrar el cilindro en el origen

export default cylinder;
