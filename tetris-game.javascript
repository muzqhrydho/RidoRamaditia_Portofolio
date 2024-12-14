// Mendapatkan elemen Canvas
const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');

// Skala canvas agar kotak grid mudah digambar
context.scale(30, 30);

// Bentuk Tetrimino
const SHAPES = {
    'I': [[1, 1, 1, 1]],
    'J': [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
    'L': [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    'O': [[1, 1], [1, 1]],
    'S': [[0, 1, 1], [1, 1, 0]],
    'T': [[0, 1, 0], [1, 1, 1]],
    'Z': [[1, 1, 0], [0, 1, 1]]
};

// Membuat tetrimino secara acak
function createPiece(type) {
    return SHAPES[type];
}

// Menggambar Tetrimino
function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = 'cyan';
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                context.strokeStyle = '#333';
                context.strokeRect(x + offset.x, y + offset.y, 1, 1);
            }
        });
    });
}

// Bersihkan layar dan gambar ulang
function draw() {
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, { x: 0, y: 0 });
    drawMatrix(player.matrix, player.pos);
}

// Mengecek benturan
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Membuat arena/board
function createMatrix(w, h) {
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}

// Gabungkan tetrimino dengan arena
function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}

// Menghapus baris penuh
function arenaSweep() {
    outer: for (let y = arena.length - 1; y >= 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        arena.splice(y, 1);
        arena.unshift(new Array(arena[0].length).fill(0));
    }
}

// Menggerakkan tetrimino turun
function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

// Reset posisi pemain
function playerReset() {
    const pieces = 'IJLOSTZ';
    player.matrix = createPiece(pieces[Math.floor(Math.random() * pieces.length)]);
    player.pos.y = 0;
    player.pos.x = Math.floor(arena[0].length / 2) - Math.floor(player.matrix[0].length / 2);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        alert("Game Over!");
    }
}

// Kontrol pergerakan pemain
function playerMove(dir) {
    player.pos.x += dir;
    if (collide(arena, player)) {
        player.pos.x -= dir;
    }
}

// Rotasi tetrimino
function playerRotate() {
    const matrix = player.matrix;
    const rotated = matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
    player.matrix = rotated;

    if (collide(arena, player)) {
        player.matrix = matrix; // Batalkan rotasi jika bertabrakan
    }
}

let dropCounter = 0;
let dropInterval = 1000;

let lastTime = 0;
function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;

    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        playerDrop();
    }

    draw();
    requestAnimationFrame(update);
}

// Event Listener untuk kontrol
document.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft') {
        playerMove(-1);
    } else if (event.key === 'ArrowRight') {
        playerMove(1);
    } else if (event.key === 'ArrowDown') {
        playerDrop();
    } else if (event.key === 'ArrowUp') {
        playerRotate();
    }
});

const arena = createMatrix(10, 20);
const player = {
    pos: { x: 0, y: 0 },
    matrix: null,
};

playerReset();
update();
