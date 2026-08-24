// game/TextureGenerator.js
// author: Nazaryan A.K.
// github: @Sl1dee36

import * as THREE from 'three';

export class TextureAtlas {
    constructor(tileSize = 16, atlasSize = 256) {
        this.tileSize = tileSize;
        this.atlasSize = atlasSize;
        this.tilesPerRow = Math.floor(this.atlasSize / this.tileSize);
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.atlasSize;
        this.canvas.height = this.atlasSize;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.imageSmoothingEnabled = false;
        this.uvMap = {};
        this.currentTileIndex = 0;
        this.texture = null;
    }

    registerTexture(name, sourceCanvas) {
        if (this.uvMap[name]) return this.uvMap[name];
        const index = this.currentTileIndex++;
        const tileX = index % this.tilesPerRow;
        const tileY = Math.floor(index / this.tilesPerRow);

        const px = tileX * this.tileSize;
        const py = tileY * this.tileSize;

        this.ctx.drawImage(sourceCanvas, px, py, this.tileSize, this.tileSize);

        const uStep = 1 / this.tilesPerRow;
        const vStep = 1 / this.tilesPerRow;

        const u0 = tileX * uStep;
        const u1 = u0 + uStep;
        const v1 = 1 - (tileY * vStep);
        const v0 = v1 - vStep;

        const info = { u0, v0, u1, v1, tileX, tileY };
        this.uvMap[name] = info;
        return info;
    }

    buildTexture() {
        this.texture = new THREE.CanvasTexture(this.canvas);
        this.texture.magFilter = THREE.NearestFilter;
        this.texture.minFilter = THREE.NearestFilter;
        this.texture.generateMipmaps = false;
        this.texture.colorSpace = THREE.SRGBColorSpace;
        this.texture.needsUpdate = true;
        return this.texture;
    }

    getUV(name) {
        const clean = name.replace('gen:', '');
        return this.uvMap[clean] || this.uvMap['stone'] || { u0: 0, v0: 0, u1: 1, v1: 1 };
    }
}

export class TextureGenerator {
    constructor() {
        this.size = 16;
        this.canvasCache = {};
        this.overrides = {};
    }

    applyTextureOverrides(newOverrides) {
        this.overrides = { ...this.overrides, ...newOverrides };
        this.canvasCache = {};
    }

    clearOverrides() {
        this.overrides = {};
        this.canvasCache = {};
    }

    getCanvas(type) {
        const cleanName = type.replace('gen:', '');
        if (this.canvasCache[cleanName]) {
            return this.canvasCache[cleanName];
        }

        if (this.overrides[cleanName]) {
            this.canvasCache[cleanName] = this.overrides[cleanName];
            return this.overrides[cleanName];
        }

        const canvas = document.createElement('canvas');
        canvas.width = this.size;
        canvas.height = this.size;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;

        this.drawTexture(cleanName, ctx, this.size);
        this.canvasCache[cleanName] = canvas;
        return canvas;
    }

    generate(type) {
        const canvas = this.getCanvas(type);
        const texture = new THREE.CanvasTexture(canvas);
        texture.magFilter = THREE.NearestFilter;
        texture.minFilter = THREE.NearestFilter;
        texture.generateMipmaps = false;
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }

    drawTexture(name, ctx, w) {
        ctx.clearRect(0, 0, w, w);

        switch (name) {
            case 'stone':
                this.paint(ctx, [
                    "2211222332211222",
                    "2100123443210012",
                    "1000013443100001",
                    "1000122332210001",
                    "2101222222221012",
                    "2212233223322122",
                    "2322344334432232",
                    "3433444444443343",
                    "3433444444443343",
                    "2322344334432232",
                    "2212233223322122",
                    "2101222222221012",
                    "1000122332210001",
                    "1000013443100001",
                    "2100123443210012",
                    "2211222332211222"
                ], {
                    '0': '#4a4e57',
                    '1': '#5e636e',
                    '2': '#737987',
                    '3': '#8b92a2',
                    '4': '#a1a8b9'
                });
                this.speckle(ctx, '#3a3d45', 6);
                this.speckle(ctx, '#b4bcd0', 4);
                break;

            case 'dirt':
                this.paint(ctx, [
                    "1211012211012110",
                    "2321123321123211",
                    "1210012210012100",
                    "0100401100401004",
                    "1211012211012110",
                    "2321123321123211",
                    "1210012210012100",
                    "0100401100401004",
                    "1211012211012110",
                    "2321123321123211",
                    "1210012210012100",
                    "0100401100401004",
                    "1211012211012110",
                    "2321123321123211",
                    "1210012210012100",
                    "0100401100401004"
                ], {
                    '0': '#422817',
                    '1': '#59381f',
                    '2': '#6f4727',
                    '3': '#855630',
                    '4': '#321c0e'
                });
                this.speckle(ctx, '#8a6039', 6);
                this.speckle(ctx, '#2b170c', 8);
                break;

            case 'grass_top':
                this.paint(ctx, [
                    "1221232112321221",
                    "2342343223432342",
                    "2443444334443442",
                    "1342343223432341",
                    "2231232112321222",
                    "3342343223432333",
                    "2443444334443442",
                    "1342343223432341",
                    "1221232112321221",
                    "2342343223432342",
                    "2443444334443442",
                    "1342343223432341",
                    "2231232112321222",
                    "3342343223432333",
                    "2443444334443442",
                    "1342343223432341"
                ], {
                    '1': '#2d691f',
                    '2': '#3e8825',
                    '3': '#52a42e',
                    '4': '#6bc33b'
                });
                this.speckle(ctx, '#7de044', 6);
                this.speckle(ctx, '#204d15', 6);
                break;

            case 'grass_side':
                this.drawTexture('dirt', ctx, w);
                this.paint(ctx, [
                    "4444444444444444",
                    "3434434434344344",
                    "2323323323233233",
                    "2313213223132132",
                    "1202102112021021",
                    "1101101011011010",
                    "00 00 0  00 00  ",
                    "                ",
                    "                ",
                    "                ",
                    "                ",
                    "                ",
                    "                ",
                    "                ",
                    "                ",
                    "                "
                ], {
                    '4': '#7de044',
                    '3': '#52a42e',
                    '2': '#3e8825',
                    '1': '#204d15',
                    '0': '#16330e'
                });
                break;

            case 'cobblestone':
                this.paint(ctx, [
                    "0000001111100000",
                    "0333201444310332",
                    "0343201444310342",
                    "0222101333210221",
                    "0000001111100000",
                    "1111000000111110",
                    "1443103332014443",
                    "1443103442014443",
                    "1332102221013332",
                    "0000000000111110",
                    "0000111110000000",
                    "0332014443103332",
                    "0342014443103442",
                    "0221013332102221",
                    "0000011111000000",
                    "0000000000000000"
                ], {
                    '0': '#2b2d32',
                    '1': '#43474f',
                    '2': '#5c626d',
                    '3': '#787f8d',
                    '4': '#9aa1af'
                });
                this.speckle(ctx, '#adb6c6', 4);
                this.speckle(ctx, '#1d1e22', 4);
                break;

            case 'planks':
                this.paint(ctx, [
                    "3333333333333333",
                    "2221222212222122",
                    "1110111101111011",
                    "0000000000000000",
                    "3333333333333333",
                    "2122221222212222",
                    "1011110111101111",
                    "0000000000000000",
                    "3333333333333333",
                    "2222122221222212",
                    "1111011110111101",
                    "0000000000000000",
                    "3333333333333333",
                    "2212222122221222",
                    "1101111011110111",
                    "0000000000000000"
                ], {
                    '3': '#c79c65',
                    '2': '#aa7d48',
                    '1': '#875d31',
                    '0': '#523419'
                });
                ctx.fillStyle = '#3a220e';
                ctx.fillRect(1, 1, 1, 1);
                ctx.fillRect(14, 1, 1, 1);
                ctx.fillRect(1, 5, 1, 1);
                ctx.fillRect(14, 5, 1, 1);
                ctx.fillRect(1, 9, 1, 1);
                ctx.fillRect(14, 9, 1, 1);
                ctx.fillRect(1, 13, 1, 1);
                ctx.fillRect(14, 13, 1, 1);
                break;

            case 'log_side':
                this.paint(ctx, [
                    "0121001232100121",
                    "0121001232100121",
                    "0122101222101221",
                    "0012100121001210",
                    "1012110121011210",
                    "2101221011121011",
                    "2100121001221001",
                    "1000121001210001",
                    "0110121011210110",
                    "0121011012210121",
                    "0122100012100121",
                    "0012100112100121",
                    "0012101222100121",
                    "1012112321001210",
                    "2101222210011210",
                    "1000111000001100"
                ], {
                    '0': '#29180d',
                    '1': '#3e2615',
                    '2': '#56371f',
                    '3': '#724b2b'
                });
                break;

            case 'log_top':
                this.paint(ctx, [
                    "0000000000000000",
                    "0111111111111110",
                    "0122222222222210",
                    "0123333333333210",
                    "0123444444443210",
                    "0123433333343210",
                    "0123434444343210",
                    "0123434554343210",
                    "0123434554343210",
                    "0123434444343210",
                    "0123433333343210",
                    "0123444444443210",
                    "0123333333333210",
                    "0122222222222210",
                    "0111111111111110",
                    "0000000000000000"
                ], {
                    '0': '#29180d',
                    '1': '#432a17',
                    '2': '#8c653a',
                    '3': '#ab824e',
                    '4': '#c9a169',
                    '5': '#966e3b'
                });
                break;

            case 'bedrock':
                this.paint(ctx, [
                    "0010021000100210",
                    "0121010001210100",
                    "1232100112321001",
                    "0121001201210012",
                    "0010012300100123",
                    "1000123410001234",
                    "2100012321000123",
                    "1000001210000012",
                    "0010021000100210",
                    "0121010001210100",
                    "1232100112321001",
                    "0121001201210012",
                    "0010012300100123",
                    "1000123410001234",
                    "2100012321000123",
                    "1000001210000012"
                ], {
                    '0': '#090a0f',
                    '1': '#151722',
                    '2': '#26293a',
                    '3': '#3b3f58',
                    '4': '#565c7e'
                });
                break;

            case 'sand':
                this.paint(ctx, [
                    "2232212232212232",
                    "3343323343323343",
                    "2332212332212332",
                    "1221101221101221",
                    "2232212232212232",
                    "3343323343323343",
                    "2332212332212332",
                    "1221101221101221",
                    "2232212232212232",
                    "3343323343323343",
                    "2332212332212332",
                    "1221101221101221",
                    "2232212232212232",
                    "3343323343323343",
                    "2332212332212332",
                    "1221101221101221"
                ], {
                    '0': '#bda168',
                    '1': '#d4b779',
                    '2': '#e5cb8f',
                    '3': '#f3dea4',
                    '4': '#ffecba'
                });
                this.speckle(ctx, '#fff4d1', 8);
                this.speckle(ctx, '#aa8c50', 6);
                break;

            case 'gravel':
                this.paint(ctx, [
                    "1121012211210122",
                    "2343123423431234",
                    "1232012312320123",
                    "0110001201100012",
                    "1122101111221011",
                    "2344212323442123",
                    "1233101212331012",
                    "0111000101110001",
                    "1121012211210122",
                    "2343123423431234",
                    "1232012312320123",
                    "0110001201100012",
                    "1122101111221011",
                    "2344212323442123",
                    "1233101212331012",
                    "0111000101110001"
                ], {
                    '0': '#383b40',
                    '1': '#4e525a',
                    '2': '#696e79',
                    '3': '#888f9c',
                    '4': '#abb3c2'
                });
                this.speckle(ctx, '#685145', 6);
                this.speckle(ctx, '#8a776c', 4);
                break;

            case 'leaves':
                this.paint(ctx, [
                    " 1221  12321  12",
                    "1234311234431123",
                    "2344322345432234",
                    "1234311234321123",
                    " 12321  12321  1",
                    "  121    121    ",
                    " 12321  12321  1",
                    "1234431123443112",
                    "2345432234543223",
                    "1234321123432112",
                    " 12321  12321  1",
                    "  121    121    ",
                    " 12321  12321  12",
                    "1234311234431123",
                    "2344322345432234",
                    " 1221  12321  12"
                ], {
                    '1': '#133811',
                    '2': '#1e521b',
                    '3': '#2e7529',
                    '4': '#429e3a',
                    '5': '#63c75a'
                });
                break;

            case 'water':
                ctx.fillStyle = 'rgba(20, 110, 200, 0.7)';
                ctx.fillRect(0, 0, 16, 16);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
                ctx.fillRect(2, 2, 4, 1);
                ctx.fillRect(10, 6, 3, 1);
                ctx.fillRect(4, 12, 5, 1);
                ctx.fillRect(14, 14, 2, 1);
                ctx.fillRect(0, 14, 1, 1);
                break;

            case 'glass':
                ctx.fillStyle = '#e3f2fd';
                ctx.globalAlpha = 0.25;
                ctx.fillRect(0, 0, 16, 16);
                ctx.globalAlpha = 0.85;
                ctx.strokeStyle = '#90caf9';
                ctx.strokeRect(0.5, 0.5, 15, 15);
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(3, 3, 2, 1);
                ctx.fillRect(4, 4, 1, 1);
                ctx.fillRect(11, 12, 2, 1);
                ctx.globalAlpha = 1.0;
                break;

            case 'coal_ore':
                this.drawTexture('stone', ctx, w);
                this.paint(ctx, [
                    "                ",
                    "    1221        ",
                    "   123321  121  ",
                    "   230032 12321 ",
                    "   120021 23032 ",
                    "    1221  12021 ",
                    "           121  ",
                    "                ",
                    "  121           ",
                    " 12321    1221  ",
                    " 23032   123321 ",
                    " 12021   230032 ",
                    "  121    120021 ",
                    "          1221  ",
                    "                ",
                    "                "
                ], {
                    '0': '#111214',
                    '1': '#22252a',
                    '2': '#3a3f47',
                    '3': '#5a626e'
                });
                break;

            case 'iron_ore':
                this.drawTexture('stone', ctx, w);
                this.paint(ctx, [
                    "                ",
                    "    1221        ",
                    "   123421  121  ",
                    "   234432 12321 ",
                    "   123321 23432 ",
                    "    1221  12321 ",
                    "           121  ",
                    "                ",
                    "  121           ",
                    " 12321    1221  ",
                    " 23432   123421 ",
                    " 12321   234432 ",
                    "  121    123321 ",
                    "          1221  ",
                    "                ",
                    "                "
                ], {
                    '1': '#6e5648',
                    '2': '#9e7e6b',
                    '3': '#caa38d',
                    '4': '#e8cfc2'
                });
                break;

            case 'sandstone_side':
                this.paint(ctx, [
                    "4444444444444444",
                    "3333333333333333",
                    "2222222222222222",
                    "1111111111111111",
                    "3333333333333333",
                    "2222222222222222",
                    "2222222222222222",
                    "1111111111111111",
                    "3333333333333333",
                    "2222222222222222",
                    "2222222222222222",
                    "1111111111111111",
                    "4444444444444444",
                    "3333333333333333",
                    "1111111111111111",
                    "0000000000000000"
                ], {
                    '4': '#faeec7',
                    '3': '#ebd79f',
                    '2': '#dbc183',
                    '1': '#be9f60',
                    '0': '#947840'
                });
                this.speckle(ctx, '#ebd79f', 10);
                break;

            case 'sandstone_top':
            case 'sandstone_bottom':
                this.paint(ctx, [
                    "3333333333333333",
                    "3222222222222223",
                    "3233333333333323",
                    "3232222222222323",
                    "3232222222222323",
                    "3232222222222323",
                    "3232222222222323",
                    "3232222222222323",
                    "3232222222222323",
                    "3232222222222323",
                    "3232222222222323",
                    "3232222222222323",
                    "3232222222222323",
                    "3233333333333323",
                    "3222222222222223",
                    "3333333333333333"
                ], {
                    '3': '#faeec7',
                    '2': '#dbc183'
                });
                this.speckle(ctx, '#ebd79f', 12);
                break;

            case 'crafting_table_top':
                this.paint(ctx, [
                    "0000000000000000",
                    "0444404444044440",
                    "0433404334043340",
                    "0433404334043340",
                    "0444404444044440",
                    "0000000000000000",
                    "0444404444044440",
                    "0433404334043340",
                    "0433404334043340",
                    "0444404444044440",
                    "0000000000000000",
                    "0444404444044440",
                    "0433404334043340",
                    "0433404334043340",
                    "0444404444044440",
                    "0000000000000000"
                ], {
                    '0': '#412511',
                    '4': '#c99f6b',
                    '3': '#a37644'
                });
                ctx.fillStyle = '#2b1608';
                ctx.fillRect(0, 0, 3, 3);
                ctx.fillRect(13, 0, 3, 3);
                ctx.fillRect(0, 13, 3, 3);
                ctx.fillRect(13, 13, 3, 3);
                ctx.fillStyle = '#e8c89b';
                ctx.fillRect(1, 1, 1, 1);
                ctx.fillRect(14, 1, 1, 1);
                ctx.fillRect(1, 14, 1, 1);
                ctx.fillRect(14, 14, 1, 1);
                break;

            case 'crafting_table_side':
            case 'crafting_table_front':
                this.drawTexture('planks', ctx, w);
                this.paint(ctx, [
                    "0000000000000000",
                    "0              0",
                    "0  22          0",
                    "0 2332   111   0",
                    "0  22   12321  0",
                    "0   4    121   0",
                    "0   4     4    0",
                    "0   4     4    0",
                    "0   4     4    0",
                    "0         4    0",
                    "0              0",
                    "0              0",
                    "0              0",
                    "0              0",
                    "0              0",
                    "0000000000000000"
                ], {
                    '0': '#361e0b',
                    '1': '#43474f',
                    '2': '#787f8d',
                    '3': '#aab2c0',
                    '4': '#634021'
                });
                break;

            case 'furnace_front':
                this.drawTexture('cobblestone', ctx, w);
                this.paint(ctx, [
                    "                ",
                    "  000000000000  ",
                    " 01111111111110 ",
                    " 01          10 ",
                    " 01          10 ",
                    " 01          10 ",
                    " 01          10 ",
                    " 01111111111110 ",
                    "  000000000000  ",
                    " 01111111111110 ",
                    " 01222222222210 ",
                    " 01233333333210 ",
                    " 01222222222210 ",
                    " 01111111111110 ",
                    "  000000000000  ",
                    "                "
                ], {
                    '0': '#1b1c20',
                    '1': '#2e3037',
                    '2': '#151618',
                    '3': '#09090a'
                });
                break;

            case 'furnace_side':
            case 'furnace_top':
                this.drawTexture('cobblestone', ctx, w);
                break;

            case 'tall_grass':
                this.paint(ctx, [
                    "                ",
                    "    4      3    ",
                    "   343    343   ",
                    "   343    243   ",
                    "   242   2342   ",
                    "  2342   2342   ",
                    "  2342   1341   ",
                    "  1341   1241   ",
                    "  1241   1241   ",
                    " 112411 112311  ",
                    " 112311 112311  ",
                    " 012310 012310  ",
                    " 012210 012210  ",
                    " 001200 001200  ",
                    "  0010   0010   ",
                    "   00     00    "
                ], {
                    '4': '#8cf54e',
                    '3': '#5ecc34',
                    '2': '#429e24',
                    '1': '#2a6917',
                    '0': '#153b0a'
                });
                break;

            case 'double_grass_bottom':
                this.paint(ctx, [
                    "  12421   13421 ",
                    "  12421   12421 ",
                    "  12411   12411 ",
                    " 112411  112411 ",
                    " 112311  112311 ",
                    " 012310  012310 ",
                    " 012310  012310 ",
                    " 012210  012210 ",
                    " 012210  012210 ",
                    " 001200  001200 ",
                    " 001200  001200 ",
                    "  00100   00100 ",
                    "  00100   00100 ",
                    "   0010    0010 ",
                    "   0000    0000 ",
                    "    00      00  "
                ], {
                    '4': '#8cf54e',
                    '3': '#5ecc34',
                    '2': '#429e24',
                    '1': '#2a6917',
                    '0': '#153b0a'
                });
                break;

            case 'double_grass_top':
                this.paint(ctx, [
                    "       4        ",
                    "      343   3   ",
                    "   4  343  343  ",
                    "  343 242  242  ",
                    "  343 242 2342  ",
                    "  242 131 2342  ",
                    " 2342 131 1341  ",
                    " 2342 121 1241  ",
                    " 1341 121 1241  ",
                    " 1241 121 1231  ",
                    " 1241 121 1231  ",
                    " 1231 121 1231  ",
                    " 1231 121 1231  ",
                    " 1231 121 1231  ",
                    " 1241 121 1241  ",
                    " 12421 1 13421  "
                ], {
                    '4': '#9eff5e',
                    '3': '#6ee03f',
                    '2': '#429e24',
                    '1': '#2a6917'
                });
                break;

            case 'item_stick':
                this.paintItem(ctx, [
                    "              S ",
                    "             Ss ",
                    "            Ss  ",
                    "           Ss   ",
                    "          Ss    ",
                    "         Ss     ",
                    "        Ss      ",
                    "       Ss       ",
                    "      Ss        ",
                    "     Ss         ",
                    "    Ss          ",
                    "   Ss           ",
                    "  Ss            ",
                    " Ss             ",
                    "Ss              ",
                    "s               "
                ], {
                    'S': '#8f5c2c',
                    's': '#4a2c11'
                });
                break;

            case 'item_coal':
                this.paintItem(ctx, [
                    "    2332        ",
                    "   245542       ",
                    "  24511542      ",
                    " 2451001542     ",
                    " 2410000142     ",
                    " 2410000142     ",
                    "  24100142      ",
                    "   241142       ",
                    "    2332        "
                ], {
                    '0': '#0d0e12',
                    '1': '#191b22',
                    '2': '#282b36',
                    '3': '#404556',
                    '4': '#5c637a',
                    '5': '#8b94b2'
                }, 2, 3);
                break;

            case 'item_iron_ingot':
                this.paintItem(ctx, [
                    "   34444443     ",
                    "  3555555553    ",
                    " 356666666553   ",
                    " 245555555442   ",
                    " 123333333221   ",
                    "  0111111110    "
                ], {
                    '6': '#ffffff',
                    '5': '#e6ebf5',
                    '4': '#c5cddb',
                    '3': '#9ea7b8',
                    '2': '#6f7787',
                    '1': '#4a505c',
                    '0': '#2b2f38'
                }, 2, 5);
                break;

            case 'tool_wood_pick': this.generateTool(ctx, 'wood', 'pick'); break;
            case 'tool_stone_pick': this.generateTool(ctx, 'stone', 'pick'); break;
            case 'tool_iron_pick': this.generateTool(ctx, 'iron', 'pick'); break;

            case 'tool_wood_axe':
                this.paint(ctx, [
                    "      11111     ",
                    "    1122231     ",
                    "      11113111  ",
                    "         13441  ",
                    "          5141  ",
                    "         545331 ",
                    "        545 1121",
                    "       545   121",
                    "      545    131",
                    "     545     131",
                    "    545       11",
                    "   545        1 ",
                    "  545           ",
                    "1545            ",
                    "145             ",
                    " 11             "
                ], {
                    '1': '#3d220a',
                    '2': '#c79c65',
                    '3': '#754418',
                    '4': '#5c3512',
                    '5': '#2b1607'
                });
                break;

            case 'tool_stone_axe': this.generateTool(ctx, 'stone', 'axe'); break;
            case 'tool_iron_axe': this.generateTool(ctx, 'iron', 'axe'); break;
            case 'tool_wood_shovel': this.generateTool(ctx, 'wood', 'shovel'); break;
            case 'tool_stone_shovel': this.generateTool(ctx, 'stone', 'shovel'); break;
            case 'tool_iron_shovel': this.generateTool(ctx, 'iron', 'shovel'); break;

            default:
                ctx.fillStyle = '#ff00ff';
                ctx.fillRect(0, 0, 16, 16);
                break;
        }
    }

    speckle(ctx, c, count) {
        ctx.fillStyle = c;
        for (let i = 0; i < count; i++) {
            ctx.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1);
        }
    }

    paint(ctx, map, palette) {
        for (let y = 0; y < 16; y++) {
            if (!map[y]) continue;
            for (let x = 0; x < 16; x++) {
                const char = map[y][x];
                if (char && char !== ' ' && palette[char]) {
                    ctx.fillStyle = palette[char];
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }
    }

    paintItem(ctx, map, palette, offX = 0, offY = 0) {
        for (let y = 0; y < map.length; y++) {
            for (let x = 0; x < map[y].length; x++) {
                const char = map[y][x];
                if (palette[char]) {
                    ctx.fillStyle = palette[char];
                    ctx.fillRect(x + offX, y + offY, 1, 1);
                }
            }
        }
    }

    generateTool(ctx, material, type) {
        let pal = {};
        if (material === 'wood') {
            pal = {
                '1': '#3d220a',
                '2': '#c79c65',
                '3': '#754418',
                '4': '#5c3512',
                '5': '#2b1607'
            };
        } else if (material === 'stone') {
            pal = {
                '1': '#282a2f',
                '2': '#454850',
                '3': '#686c78',
                '4': '#9196a6',
                'S': '#804c1e',
                's': '#4d2b0e',
                'P': '#595d69',
                'p': '#282a2f'
            };
        } else if (material === 'iron') {
            pal = {
                '1': '#31333a',
                '2': '#616673',
                '3': '#b0b8cc',
                '4': '#ffffff',
                'S': '#804c1e',
                's': '#4d2b0e',
                'P': '#a6afc4',
                'p': '#31333a'
            };
        }

        let toolMap = [];

        if (type === 'pick') {
            toolMap = [
                "      11111     ",
                "    1122231     ",
                "      11113111  ",
                "         13441  ",
                "          5141  ",
                "         545331 ",
                "        545 1121",
                "       545   121",
                "      545    131",
                "     545     131",
                "    545       11",
                "   545        1 ",
                "  545           ",
                "1545            ",
                "145             ",
                " 11             "
            ];
        } else if (type === 'axe') {
            toolMap = [
                "                ",
                "      12341     ",
                "     1344441    ",
                "    13444321sS  ",
                "    1244321 1Ss ",
                "     11321  121 ",
                "       11  sS 1 ",
                "       sS 11    ",
                "      sS        ",
                "     sS         ",
                "    sS          ",
                "   sS           ",
                "  sS            ",
                " pP             ",
                "pP              ",
                "p               "
            ];
        } else if (type === 'shovel') {
            toolMap = [
                "                ",
                "           1231 ",
                "          134431",
                "         1344421",
                "          13421 ",
                "           11sS ",
                "          sS 11 ",
                "         sS     ",
                "        sS      ",
                "       sS       ",
                "      sS        ",
                "     sS         ",
                "    sS          ",
                "   pP           ",
                "  pP            ",
                "  p             "
            ];
        }

        this.paint(ctx, toolMap, pal);
    }
}