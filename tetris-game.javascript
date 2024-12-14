// Canvas Tetris
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(30, 30);

// Warna untuk setiap Tetrimino
const COLORS = [
    null, 'cyan', 'blue', 'orange', 'yellow', 'green', 'purple', 'red'
];

// Bentuk Tetrimino
const SHAPES = [
    null,
    [[1, 1, 1, 1]],          // I
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]], // J
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]], // L
    [[1, 1], [1, 1]],        // O
    [[0, 1, 1], [1, 1, 0]],  // S
    [[0, 1, 0], [1, 1, 1]],  // T
    [[1, 1, 0], [0, 1, 1]]   // Z
];

// Membuat Matrix (arena permainan)
function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

// Menggambar Matrix ke Canvas
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = COLORS[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.strokeStyle = '#111';
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Bersihkan dan gambar ulang
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// Membuat Tetrimino
function createPiece(type) {
    const index = 'IJLOSTZ'.indexOf(type);
    return SHAPES[index + 1];
}

// Gabungkan tetrimino dengan arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

// Mengecek benturan
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    return m.some((row, y) =>
        row.some((value, x) => value !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0));
}

// Reset posisi tetrimino
function playerReset() {
    const pieces = 'IJLOSTZ';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert('Game Over!');
    }
}

// Kontrol tetrimino
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) player.pos.x -= dir;
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
    }
    dropCounter = 0;
}

function playerRotate() {
    const rotated = player.matrix[0].map((_, i) => player.matrix.map(row => row[i]).reverse());
    player.matrix = rotated;
    if (collide(arena, player)) player.matrix = player.matrix.reverse();
}

// Arena permainan
const arena = createMatrix(10, 20);
const player = { pos: { x: 0, y: 0 }, matrix: null };
playerReset();

let dropCounter = 0, dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();

    draw();
    requestAnimationFrame(update);
}

document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') playerMove(-1);
    if (e.key === 'ArrowRight') playerMove(1);
    if (e.key === 'ArrowDown') playerDrop();
    if (e.key === 'ArrowUp') playerRotate();
});

// Kontrol Touchscreen
document.getElementById('left').addEventListener('click', () => playerMove(-1));
document.getElementById('right').addEventListener('click', () => playerMove(1));
document.getElementById('down').addEventListener('click', playerDrop);
document.getElementById('rotate').addEventListener('click', playerRotate);

update();
