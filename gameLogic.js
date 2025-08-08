// Tetris Game Logic
import { GAME_CONFIG, SCORING } from './config.js';

export class GameLogic {
    constructor() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropInterval = GAME_CONFIG.INITIAL_DROP_INTERVAL;
        this.softDropScore = 0;
        this.isPaused = false;
        this.isGameOver = false;
    }

    // Clear full rows and update score
    clearLines(arena) {
        let rowCount = 0;
        let clearedRows = [];
        
        // Find and mark complete rows
        for (let y = arena.length - 1; y >= 0; --y) {
            let isComplete = true;
            for (let x = 0; x < arena[y].length; ++x) {
                if (arena[y][x] === 0) {
                    isComplete = false;
                    break;
                }
            }
            if (isComplete) {
                clearedRows.push(y);
            }
        }
        
        // Remove complete rows with animation effect
        clearedRows.forEach(y => {
            arena.splice(y, 1);
            arena.unshift(new Array(arena[0].length).fill(0));
            rowCount++;
        });
        
        if (rowCount > 0) {
            // Standard Tetris scoring with bonus for higher levels
            const basePoints = [0, SCORING.SINGLE, SCORING.DOUBLE, SCORING.TRIPLE, SCORING.TETRIS];
            const points = basePoints[rowCount] * this.level;
            this.score += points;
            this.linesCleared += rowCount;
            
            // Level progression with faster speed increase
            const newLevel = Math.floor(this.linesCleared / GAME_CONFIG.LINES_PER_LEVEL) + 1;
            if (newLevel > this.level) {
                this.level = newLevel;
                // Exponential speed increase for more challenge
                this.dropInterval = Math.max(
                    GAME_CONFIG.MIN_DROP_INTERVAL, 
                    GAME_CONFIG.INITIAL_DROP_INTERVAL - (this.level - 1) * GAME_CONFIG.LEVEL_SPEED_INCREASE
                );
            }
        }
        
        return rowCount;
    }

    // Add score for soft/hard drops
    addDropScore(points) {
        this.score += points;
        this.softDropScore += points;
    }

    // Toggle pause
    togglePause() {
        this.isPaused = !this.isPaused;
        return this.isPaused;
    }

    // Set game over
    gameOver() {
        this.isGameOver = true;
    }

    // Reset game
    reset() {
        this.score = 0;
        this.level = 1;
        this.linesCleared = 0;
        this.dropInterval = GAME_CONFIG.INITIAL_DROP_INTERVAL;
        this.softDropScore = 0;
        this.isPaused = false;
        this.isGameOver = false;
    }

    // Get current stats
    getStats() {
        return {
            score: this.score,
            level: this.level,
            lines: this.linesCleared,
            dropInterval: this.dropInterval,
            isPaused: this.isPaused,
            isGameOver: this.isGameOver
        };
    }

    // Calculate bonus score for perfect clears
    calculateBonus(clearedRows) {
        // Bonus for clearing multiple lines simultaneously
        const bonusMultiplier = {
            1: 1.0,
            2: 1.5,
            3: 2.0,
            4: 3.0 // Tetris bonus
        };
        
        return bonusMultiplier[clearedRows] || 1.0;
    }
}
