// Konstanta Dasar
const BOARD_WIDTH = 10;
const BOARD_HEIGHT = 20;
const BOARD_SIZE = BOARD_WIDTH * BOARD_HEIGHT;

// Konfigurasi Kecepatan Permainan
const GAME_SPEEDS = {
    initial: 1000,
    speedUpInterval: 30000,  // Percepat setiap 30 detik
    speedReduction: 100      // Kurangi 100ms setiap percepatan
};

// Definisi Tetromino
const TETROMINOS = {
    I: {
        shape: [
            [0,0,0,0],
            [1,1,1,1],
            [0,0,0,0],
            [0,0,0,0]
        ],
        color: 'tetromino-I'
    },
    O: {
        shape: [
            [1,1],
            [1,1]
        ],
        color: 'tetromino-O'
    },
    T: {
        shape: [
            [0,1,0],
            [1,1,1],
            [0,0,0]
        ],
        color: 'tetromino-T'
    },
    L: {
        shape: [
            [0,0,1],
            [1,1,1],
            [0,0,0]
        ],
        color: 'tetromino-L'
    },
    J: {
        shape: [
            [1,0,0],
            [1,1,1],
            [0,0,0]
        ],
        color: 'tetromino-J'
    },
    S: {
        shape: [
            [0,1,1],
            [1,1,0],
            [0,0,0]
        ],
        color: 'tetromino-S'
    },
    Z: {
        shape: [
            [1,1,0],
            [0,1,1],
            [0,0,0]
        ],
        color: 'tetromino-Z'
    }
};

class TetrisGame {
    constructor(boardElement, scoreElement) {
        // Elemen DOM
        this.board = boardElement;
        this.scoreElement = scoreElement;

        // Status Permainan
        this.cells = Array(BOARD_SIZE).fill(0);
        this.currentTetromino = null;
        this.currentPosition = 0;
        this.gameSpeed = GAME_SPEEDS.initial;
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;

        // Binding metode untuk event listener
        this.handleKeyPress = this.handleKeyPress.bind(this);
    }

    // Inisialisasi Papan Permainan
    initializeBoard() {
        this.board.innerHTML = '';
        this.cells = Array(BOARD_SIZE).fill(0);
        
        for (let i = 0; i < BOARD_SIZE; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            this.board.appendChild(cell);
        }
    }

    // Memilih Tetromino Acak
    getRandomTetromino() {
        const keys = Object.keys(TETROMINOS);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        return {
            shape: TETROMINOS[randomKey].shape,
            color: TETROMINOS[randomKey].color
        };
    }

    // Menggambar Tetromino
    drawTetromino() {
        const shape = this.currentTetromino.shape;
        const size = shape.length;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (shape[y][x]) {
                    const boardIndex = this.currentPosition + (y * BOARD_WIDTH) + x;
                    if (boardIndex >= 0 && boardIndex < BOARD_SIZE) {
                        const cell = this.board.children[boardIndex];
                        cell.classList.add('tetromino', this.currentTetromino.color);
                    }
                }
            }
        }
    }

    // Menghapus Gambar Tetromino
    undrawTetromino() {
        const shape = this.currentTetromino.shape;
        const size = shape.length;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (shape[y][x]) {
                    const boardIndex = this.currentPosition + (y * BOARD_WIDTH) + x;
                    if (boardIndex >= 0 && boardIndex < BOARD_SIZE) {
                        const cell = this.board.children[boardIndex];
                        cell.classList.remove('tetromino', this.currentTetromino.color);
                    }
                }
            }
        }
    }

    // Mengecek Tabrakan
    checkCollision() {
        const shape = this.currentTetromino.shape;
        const size = shape.length;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (shape[y][x]) {
                    const boardIndex = this.currentPosition + (y * BOARD_WIDTH) + x;
                    
                    // Cek batas papan
                    if (
                        boardIndex >= BOARD_SIZE ||
                        (boardIndex % BOARD_WIDTH < this.currentPosition % BOARD_WIDTH && x > 0) ||
                        (boardIndex % BOARD_WIDTH > (this.currentPosition % BOARD_WIDTH) + size - 1 && x < size - 1)
                    ) {
                        return true;
                    }

                    // Cek tabrakan dengan blok beku
                    if (this.cells[boardIndex]) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    // Memindahkan Tetromino
    moveTetromino(direction) {
        this.undrawTetromino();
        
        switch(direction) {
            case 'left':
                this.currentPosition--;
                if (this.checkCollision()) {
                    this.currentPosition++;
                }
                break;
            case 'right':
                this.currentPosition++;
                if (this.checkCollision()) {
                    this.currentPosition--;
                }
                break;
            case 'down':
                this.currentPosition += BOARD_WIDTH;
                if (this.checkCollision()) {
                    this.currentPosition -= BOARD_WIDTH;
                    this.freezeTetromino();
                    this.clearLines();
                    this.spawnTetromino();
                }
                break;
        }

        this.drawTetromino();
    }

    // Memutar Tetromino
    rotateTetromino() {
        this.undrawTetromino();
        const originalShape = this.currentTetromino.shape;
        const rotatedShape = originalShape[0].map((_, index) => 
            originalShape.map(row => row[index]).reverse()
        );
        this.currentTetromino.shape = rotatedShape;

        if (this.checkCollision()) {
            this.currentTetromino.shape = originalShape;
        }

        this.drawTetromino();
    }

    // Membekukan Tetromino
    freezeTetromino() {
        const shape = this.currentTetromino.shape;
        const size = shape.length;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                if (shape[y][x]) {
                    const boardIndex = this.currentPosition + (y * BOARD_WIDTH) + x;
                    if (boardIndex >= 0 && boardIndex < BOARD_SIZE) {
                        this.cells[boardIndex] = 1;
                    }
                }
            }
        }
    }

    // Menghapus Baris Penuh
    clearLines() {
        let linesCleared = 0;
        for (let y = BOARD_HEIGHT - 1; y >= 0; y--) {
            let isFullRow = true;
            for (let x = 0; x < BOARD_WIDTH; x++) {
                const index = y * BOARD_WIDTH + x;
                if (!this.cells[index]) {
                    isFullRow = false;
                    break;
                }
            }

            if (isFullRow) {
                // Hapus baris
                this.cells.splice(y * BOARD_WIDTH, BOARD_WIDTH);
                // Tambah baris kosong di atas
                this.cells.unshift(...Array(BOARD_WIDTH).fill(0));
                
                linesCleared++;
                this.updateScore(linesCleared);
                
                // Redraw papan
                this.updateBoard();
            }
        }
    }

    // Memperbarui Papan
    updateBoard() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            const cell = this.board.children[i];
            cell.classList.remove('tetromino', ...Object.values(TETROMINOS).map(t => t.color));
            if (this.cells[i]) {
                cell.classList.add('tetromino');
            }
        }
        this.drawTetromino();
    }

    // Membuat Tetromino Baru
    spawnTetromino() {
        this.currentTetromino = this.getRandomTetromino();
        this.currentPosition = Math.floor(BOARD_WIDTH / 2) - Math.floor(this.currentTetromino.shape.length / 2);

        // Periksa game over
        if (this.checkCollision()) {
            this.endGame();
            return;
        }

        this.drawTetromino();
    }

    // Memperbarui Skor
    updateScore(linesCleared) {
        const scoreMultipliers = [0, 40, 100, 300, 1200];
        this.score += scoreMultipliers[linesCleared] * this.level;
        this.scoreElement.textContent = this.score;

        // Naikkan level
        if (this.score >= this.level * 1000) {
            this.level++;
            this.increaseGameSpeed();
        }
    }

    // Meningkatkan Kecepatan Permainan
    increaseGameSpeed() {
        this.gameSpeed = Math.max(100, this.gameSpeed - GAME_SPEEDS.speedReduction);
        this.stopGameLoop();
        this.startGameLoop();
    }

    // Memulai Game Loop
    startGameLoop() {
        this.gameLoopInterval = setInterval(() => {
            if (!this.gameOver && !this.isPaused) {
                this.moveTetromino('down');
            }
        }, this.gameSpeed);
    }

    // Menghentikan Game Loop
    stopGameLoop() {
        clearInterval(this.gameLoopInterval);
    }

    // Memulai Permainan
    startGame() {
        this.initializeBoard();
        this.score = 0;
        this.level = 1;
        this.gameOver = false;
        this.isPaused = false;
        this.scoreElement.textContent = this.score;
        
        this.spawnTetromino();
        this.startGameLoop();
        
        // Tambahkan event listener
        document.addEventListener('keydown', this.handleKeyPress);
    }

    // Menjeda Permainan
    pauseGame() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.stopGameLoop();
        } else {
            this.startGameLoop();
        }
    }

    // Mengakhiri Permainan
    endGame() {
        this.gameOver = true;
        this.stopGameLoop();
        document.removeEventListener('keydown', this.handleKeyPress);
        
        // Tambahkan efek game over
        this.board.classList.add('game-over');
        alert(`Game Over! Skor Anda: ${this.score}`);
    }

    // Menangani Input Keyboard
    handleKeyPress(event) {
        if (this.gameOver || this.isPaused) return;

        switch(event.key) {
            case 'ArrowLeft':
                this.moveTetromino('left');
                break;
            case 'ArrowRight':
                this.moveTetromino('right');
                break;
            case 'ArrowDown':
                this.moveTetromino('down');
                break;
            case 'ArrowUp':
                this.rotateTetromino();
                break;
            case 'Escape':
                this.pauseGame();
                break;
        }
    }
}

// Fungsi Inisialisasi
function initializeTetrisGame() {
    const board = document.getElementById('tetris-board');
    const scoreElement = document.getElementById('score');
    const tetrisGame = new TetrisGame(board, scoreElement);

    // Tombol Kontrol
    document.getElementById('start-btn').addEventListener('click', () => tetrisGame.startGame());
    document.getElementById('pause-btn').addEventListener('click', () => tetrisGame.pauseGame());
    
    // Kontrol Mobile
    document.getElementById('move-left').addEventListener('click', () => tetrisGame.moveTetromino('left'));
    document.getElementById('move-right').addEventListener('click', () => tetrisGame.moveTetromino('right'));
    document.getElementById('move-down').addEventListener('click', () => tetrisGame.moveTetromino('down'));
    document.getElementById('rotate').addEventListener('click', () => tetrisGame.rotateTetromino());
}

// Inisialisasi saat DOM siap
document.addEventListener('DOMContentLoaded', initializeTetrisGame);
