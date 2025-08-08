// Tetris Game Controller
import { KEYS, SCORING } from './config.js';

export class InputController {
    constructor(player, gameLogic, arena, renderer) {
        this.player = player;
        this.gameLogic = gameLogic;
        this.arena = arena;
        this.renderer = renderer;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            event.preventDefault(); // Prevent page scrolling
            this.handleKeyPress(event.keyCode);
        });
    }

    handleKeyPress(keyCode) {
        // Handle pause/restart even when paused
        if (keyCode === KEYS.P) {
            const isPaused = this.gameLogic.togglePause();
            if (isPaused) {
                this.renderer.showPaused();
            } else {
                this.renderer.hidePaused();
            }
            return;
        }

        if (keyCode === KEYS.R) {
            location.reload(); // Simple restart
            return;
        }

        // Don't process other inputs if paused or game over
        if (this.gameLogic.isPaused || this.gameLogic.isGameOver) {
            return;
        }

        switch (keyCode) {
            case KEYS.LEFT:
                this.player.move(-1, this.arena);
                break;
            case KEYS.RIGHT:
                this.player.move(1, this.arena);
                break;
            case KEYS.DOWN:
                // Soft drop with scoring
                const dropped = this.player.drop(this.arena);
                if (!dropped) {
                    this.gameLogic.addDropScore(SCORING.SOFT_DROP);
                }
                break;
            case KEYS.UP:
            case KEYS.X:
                this.player.rotate(1, this.arena);
                break;
            case KEYS.Z:
                this.player.rotate(-1, this.arena);
                break;
            case KEYS.SPACE:
                // Hard drop with scoring
                const distance = this.calculateHardDropDistance();
                this.player.hardDrop(this.arena);
                this.gameLogic.addDropScore(distance * SCORING.HARD_DROP);
                break;
        }
    }

    calculateHardDropDistance() {
        let distance = 0;
        const testPlayer = {
            ...this.player,
            pos: { ...this.player.pos }
        };

        while (!this.wouldCollide(testPlayer)) {
            testPlayer.pos.y++;
            distance++;
        }

        return distance;
    }

    // Helper collision detection
    wouldCollide(player) {
        const m = player.matrix;
        const o = player.pos;
        for (let y = 0; y < m.length; ++y) {
            for (let x = 0; x < m[y].length; ++x) {
                if (m[y][x] !== 0 &&
                   (this.arena[y + o.y] && this.arena[y + o.y][x + o.x]) !== 0) {
                    return true;
                }
            }
        }
        return false;
    }
}
