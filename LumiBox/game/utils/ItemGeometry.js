// game/utils/ItemGeometry.js
import * as THREE from 'three';

const itemGeoCache = {};

export function getOrCreateItem3DGeometry(canvas, size = 0.5, thickness = 0.5 / 16) {
    if (!canvas) return new THREE.BoxGeometry(size, size, thickness);
    
    // Используем хэш для кэширования геометрии каждого типа предмета
    const cacheKey = `${canvas.width}_${canvas.height}_${canvas.toDataURL().length}`;
    if (itemGeoCache[cacheKey]) {
        return itemGeoCache[cacheKey];
    }

    const ctx = canvas.getContext('2d');
    const imgData = ctx.getImageData(0, 0, 16, 16).data;
    const isSolid = (x, y) => {
        if (x < 0 || x >= 16 || y < 0 || y >= 16) return false;
        return imgData[(y * 16 + x) * 4 + 3] > 20; // Проверка непрозрачности альфа-канала
    };

    const positions = [];
    const normals = [];
    const uvs = [];

    const pw = size / 16;
    const ph = size / 16;
    const halfD = thickness / 2;

    const addQuad = (p1, p2, p3, p4, norm, uvCoords) => {
        // Треугольник 1
        positions.push(...p1, ...p2, ...p3);
        normals.push(...norm, ...norm, ...norm);
        uvs.push(uvCoords[0], uvCoords[1], uvCoords[2], uvCoords[3], uvCoords[4], uvCoords[5]);

        // Треугольник 2
        positions.push(...p1, ...p3, ...p4);
        normals.push(...norm, ...norm, ...norm);
        uvs.push(uvCoords[0], uvCoords[1], uvCoords[4], uvCoords[5], uvCoords[6], uvCoords[7]);
    };

    for (let y = 0; y < 16; y++) {
        for (let x = 0; x < 16; x++) {
            if (!isSolid(x, y)) continue;

            const x0 = (x - 8) * pw;
            const x1 = x0 + pw;
            const y1 = (8 - y) * ph;
            const y0 = y1 - ph;

            const u0 = x / 16;
            const u1 = (x + 1) / 16;
            const v1 = 1 - (y / 16);
            const v0 = 1 - ((y + 1) / 16);

            // 1. Передняя грань (+Z)
            addQuad(
                [x0, y0, halfD], [x1, y0, halfD], [x1, y1, halfD], [x0, y1, halfD],
                [0, 0, 1],
                [u0, v0, u1, v0, u1, v1, u0, v1]
            );

            // 2. Задняя грань (-Z)
            addQuad(
                [x1, y0, -halfD], [x0, y0, -halfD], [x0, y1, -halfD], [x1, y1, -halfD],
                [0, 0, -1],
                [u1, v0, u0, v0, u0, v1, u1, v1]
            );

            // 3. Верхнее ребро (+Y), если сверху воздух
            if (!isSolid(x, y - 1)) {
                addQuad(
                    [x0, y1, halfD], [x1, y1, halfD], [x1, y1, -halfD], [x0, y1, -halfD],
                    [0, 1, 0],
                    [u0, v1, u1, v1, u1, v1, u0, v1]
                );
            }

            // 4. Нижнее ребро (-Y), если снизу воздух
            if (!isSolid(x, y + 1)) {
                addQuad(
                    [x0, y0, -halfD], [x1, y0, -halfD], [x1, y0, halfD], [x0, y0, halfD],
                    [0, -1, 0],
                    [u0, v0, u1, v0, u1, v0, u0, v0]
                );
            }

            // 5. Левое ребро (-X), если слева воздух
            if (!isSolid(x - 1, y)) {
                addQuad(
                    [x0, y0, -halfD], [x0, y0, halfD], [x0, y1, halfD], [x0, y1, -halfD],
                    [-1, 0, 0],
                    [u0, v0, u0, v0, u0, v1, u0, v1]
                );
            }

            // 6. Правое ребро (+X), если справа воздух
            if (!isSolid(x + 1, y)) {
                addQuad(
                    [x1, y0, halfD], [x1, y0, -halfD], [x1, y1, -halfD], [x1, y1, halfD],
                    [1, 0, 0],
                    [u1, v0, u1, v0, u1, v1, u1, v1]
                );
            }
        }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
    geo.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));

    itemGeoCache[cacheKey] = geo;
    return geo;
}