// Main Tetris Game 2.0 with Motion Control
import { GAME_CONFIG } from './config.js';
import { createMatrix, merge, generatePieceBag } from './utils.js';
import { Player } from './player.js';
import { GameLogic } from './gameLogic.js';
import { Renderer } from './renderer.js';
import { InputController } from './input.js';
import { AchievementManager } from './achievements.js';
import { HandGestureController } from './handGestureController.js';

class TetrisGame {
    constructor() {
        this.canvas = document.getElementById('tetris');
        this.arena = createMatrix(GAME_CONFIG.BOARD_WIDTH, GAME_CONFIG.BOARD_HEIGHT);
        this.player = new Player();
        this.gameLogic = new GameLogic();
        this.renderer = new Renderer(this.canvas);
        this.inputController = new InputController(this.player, this.gameLogic, this.arena, this.renderer);
        this.achievementManager = new AchievementManager();
        
        // Motion control integration
        this.gestureController = null;
        
        this.pieceBag = [];
        this.nextPiece = null;
        this.dropCounter = 0;
        this.lastTime = 0;
        
        this.init();
    }

    init() {
        this.generateNextPiece();
        this.resetPlayer();
        this.update();
        this.addVersionInfo();
        this.initializeGestureControl();
    }

    async initializeGestureControl() {
        try {
            // Initialize gesture controller after a small delay to ensure MediaPipe is loaded
            setTimeout(async () => {
                this.gestureController = new HandGestureController(this);
                console.log('✅ Motion control initialized successfully!');
            }, 1000);
        } catch (error) {
            console.error('❌ Motion control initialization failed:', error);
        }
    }

    addVersionInfo() {
        const versionInfo = document.createElement('div');
        versionInfo.style.cssText = `
            position: fixed;
            bottom: 10px;
            left: 10px;
            color: #666;
            font-size: 12px;
            font-family: monospace;
        `;
        versionInfo.innerHTML = `
            <div>Tetris 2.0 - Enhanced Edition</div>
            <div style="color: #00FF88;">🤚 Motion Control Enabled</div>
        `;
        document.body.appendChild(versionInfo);
    }

    generateNextPiece() {
        if (this.pieceBag.length === 0) {
            this.pieceBag = generatePieceBag();
        }
        this.nextPiece = this.pieceBag.pop();
    }

    resetPlayer() {
        const currentPiece = this.nextPiece || 'T';
        this.generateNextPiece();
        
        const gameOver = this.player.reset(this.arena, [currentPiece]);
        if (gameOver) {
            this.handleGameOver();
            return;
        }
    }

    handleGameOver() {
        this.gameLogic.gameOver();
        const stats = this.gameLogic.getStats();
        this.renderer.showGameOver(stats.score, stats.level, stats.lines);
        this.achievementManager.checkAchievements(this.gameLogic);
        
        // Add achievement for using motion control
        if (this.gestureController && this.gestureController.isEnabled) {
            this.achievementManager.unlockAchievement('MOTION_MASTER');
        }
    }

    playerDrop() {
        if (this.gameLogic.isPaused || this.gameLogic.isGameOver) return;
        
        const landed = this.player.drop(this.arena);
        if (landed) {
            merge(this.arena, this.player);
            const linesCleared = this.gameLogic.clearLines(this.arena);
            this.achievementManager.checkAchievements(this.gameLogic, linesCleared);
            this.resetPlayer();
        }
        this.dropCounter = 0;
    }

    update(time = 0) {
        if (!this.gameLogic.isPaused && !this.gameLogic.isGameOver) {
            const deltaTime = time - this.lastTime;
            this.lastTime = time;

            this.dropCounter += deltaTime;
            if (this.dropCounter > this.gameLogic.dropInterval) {
                this.playerDrop();
            }

            this.achievementManager.checkAchievements(this.gameLogic);
        }

        this.renderer.draw(this.arena, this.player, this.nextPiece);
        this.renderer.updateUI(this.gameLogic.getStats());
        
        requestAnimationFrame((time) => this.update(time));
    }

    // Public methods for gesture controller
    moveLeft() {
        this.player.move(-1, this.arena);
    }

    moveRight() {
        this.player.move(1, this.arena);
    }

    rotate() {
        this.player.rotate(1, this.arena);
    }

    softDrop() {
        this.player.drop(this.arena);
    }

    hardDrop() {
        this.player.hardDrop(this.arena);
    }

    togglePause() {
        const isPaused = this.gameLogic.togglePause();
        if (isPaused) {
            this.renderer.showPaused();
        } else {
            this.renderer.hidePaused();
        }
    }

    // Cleanup method
    destroy() {
        if (this.gestureController) {
            this.gestureController.destroy();
        }
    }
}

// Start the game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new TetrisGame();
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        game.destroy();
    });
});
