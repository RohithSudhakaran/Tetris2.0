// Tetris Game Logic
import { GAME_CONFIG, SCORING } from './config.js';

export class GameLogic {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropInterval = GAME_CONFIG.INITIAL_DROP_INTERVAL;
    }

    // Clear full rows and update score
    clearLines(arena) {
        let rowCount = 0;
        outer: for (let y = arena.length - 1; y >= 0; --y) {
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    continue outer;
                }
            }
            arena.splice(y, 1);
            arena.unshift(new Array(arena[0].length).fill(0));
            ++y; // Check same row again
            rowCount++;
        }
        
        if (rowCount > 0) {
            // Standard Tetris scoring
            const points = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS];
            this.score += points[rowCount] * this.level;
            this.linesCleared += rowCount;
            
            // Level progression
            const newLevel = Math.floor(this.linesCleared / GAME_CONFIG.LINES_PER_LEVEL) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                // Increase speed with level
                this.dropInterval = Math.max(
                    GAME_CONFIG.MIN_DROP_INTERVAL, 
                    GAME_CONFIG.INITIAL_DROP_INTERVAL - (this.level - 1) * GAME_CONFIG.LEVEL_SPEED_INCREASE
                );
            }
        }
        
        return rowCount;
    }

    // Reset game
    reset() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropInterval = GAME_CONFIG.INITIAL_DROP_INTERVAL;
    }

    // Get current stats
    getStats() {
        return {
            score: this.score,
            level: this.level,
            lines: this.linesCleared,
            dropInterval: this.dropInterval
        };
    }
}
