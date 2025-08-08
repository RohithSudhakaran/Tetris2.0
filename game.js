// Main Tetris Game
import { GAME_CONFIG } from './config.js';
import { createMatrix, merge } from './utils.js';
import { Player } from './player.js';
import { GameLogic } from './gameLogic.js';
import { Renderer } from './renderer.js';
import { InputController } from './input.js';

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.arena = createMatrix(GAME_CONFIG.BOARD_WIDTH, GAME_CONFIG.BOARD_HEIGHT);
        this.player = new Player();
        this.gameLogic = new GameLogic();
        this.renderer = new Renderer(this.canvas);
        this.inputController = new InputController(this.player, this.gameLogic, this.arena);
        
        this.pieceBag = [];
        this.dropCounter = 0;
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        this.resetPlayer();
        this.update();
    }

    resetPlayer() {
        const gameOver = this.player.reset(this.arena, this.pieceBag);
        if (gameOver) {
            // Game Over - reset everything
            this.arena.forEach(row => row.fill(0));
            this.gameLogic.reset();
            this.pieceBag = [];
            this.resetPlayer(); // Try again
        }
    }

    playerDrop() {
        const landed = this.player.drop(this.arena);
        if (landed) {
            merge(this.arena, this.player);
            this.resetPlayer();
            this.gameLogic.clearLines(this.arena);
        }
        this.dropCounter = 0;
    }

    update(time = 0) {
        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        this.dropCounter += deltaTime;
        if (this.dropCounter > this.gameLogic.dropInterval) {
            this.playerDrop();
        }

        this.renderer.draw(this.arena, this.player);
        this.renderer.updateUI(this.gameLogic.getStats());
        
        requestAnimationFrame((time) => this.update(time));
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TetrisGame();
});
