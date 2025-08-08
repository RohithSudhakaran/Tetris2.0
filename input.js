// Tetris Game Controller
import { KEYS } from './config.js';

export class InputController {
    constructor(player, gameLogic, arena) {
        this.player = player;
        this.gameLogic = gameLogic;
        this.arena = arena;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.handleKeyPress(event.keyCode);
        });
    }

    handleKeyPress(keyCode) {
        switch (keyCode) {
            case KEYS.LEFT:
                this.player.move(-1, this.arena);
                break;
            case KEYS.RIGHT:
                this.player.move(1, this.arena);
                break;
            case KEYS.DOWN:
                this.player.drop(this.arena);
                break;
            case KEYS.UP:
            case KEYS.X:
                this.player.rotate(1, this.arena);
                break;
            case KEYS.Z:
                this.player.rotate(-1, this.arena);
                break;
            case KEYS.SPACE:
                this.player.hardDrop(this.arena);
                break;
        }
    }
}
