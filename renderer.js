// Tetris Renderer
import { COLORS } from './config.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.scale = Math.floor(window.innerHeight / 24);
        
        canvas.width = this.scale * 10;
        canvas.height = this.scale * 20;
        this.context.scale(this.scale, this.scale);
    }

    // Draw a matrix
    drawMatrix(matrix, offset) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    this.context.fillStyle = COLORS[value];
                    this.context.fillRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    // Draw everything
    draw(arena, player) {
        // Clear canvas
        this.context.fillStyle = '#000';
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw arena and player
        this.drawMatrix(arena, { x: 0, y: 0 });
        this.drawMatrix(player.matrix, player.pos);
    }

    // Update UI elements
    updateUI(stats) {
        document.getElementById('score').textContent = stats.score;
        document.getElementById('level').textContent = stats.level;
        document.getElementById('lines').textContent = stats.lines;
    }
}
