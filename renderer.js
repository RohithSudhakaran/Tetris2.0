// Tetris Renderer
import { COLORS } from './config.js';
import { SHAPES } from './shapes.js';
import { collide } from './utils.js';

export class Renderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
        this.scale = Math.floor(window.innerHeight / 24);
        
        canvas.width = this.scale * 10;
        canvas.height = this.scale * 20;
        this.context.scale(this.scale, this.scale);
        
        // Setup next piece canvas
        this.nextCanvas = document.getElementById('nextPiece');
        this.nextContext = this.nextCanvas.getContext('2d');
        this.nextContext.scale(20, 20);
    }

    // Draw a matrix
    drawMatrix(matrix, offset, context = this.context) {
        matrix.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    context.fillStyle = COLORS[value];
                    context.fillRect(x + offset.x, y + offset.y, 1, 1);
                    
                    // Add subtle border for better visuals
                    context.strokeStyle = 'rgba(255, 255, 255, 0.1)';
                    context.lineWidth = 0.02;
                    context.strokeRect(x + offset.x, y + offset.y, 1, 1);
                }
            });
        });
    }

    // Draw ghost piece (preview where piece will land)
    drawGhostPiece(arena, player) {
        const ghostPlayer = {
            ...player,
            pos: { ...player.pos }
        };
        
        // Move ghost down until collision
        while (!collide(arena, { ...ghostPlayer, pos: { ...ghostPlayer.pos, y: ghostPlayer.pos.y + 1 } })) {
            ghostPlayer.pos.y++;
        }
        
        // Draw ghost with transparency
        this.context.globalAlpha = 0.3;
        this.drawMatrix(ghostPlayer.matrix, ghostPlayer.pos);
        this.context.globalAlpha = 1.0;
    }

    // Draw next piece preview
    drawNextPiece(nextPieceType) {
        // Clear next piece canvas
        this.nextContext.fillStyle = '#111';
        this.nextContext.fillRect(0, 0, 4, 4);
        
        if (nextPieceType && SHAPES[nextPieceType]) {
            const pieceMatrix = SHAPES[nextPieceType][0]; // First rotation
            const colorIndex = ['T', 'I', 'S', 'Z', 'L', 'O', 'J'].indexOf(nextPieceType) + 1;
            
            // Center the piece in the preview
            const offsetX = (4 - pieceMatrix[0].length) / 2;
            const offsetY = (4 - pieceMatrix.length) / 2;
            
            pieceMatrix.forEach((row, y) => {
                row.forEach((value, x) => {
                    if (value !== 0) {
                        this.nextContext.fillStyle = COLORS[colorIndex];
                        this.nextContext.fillRect(x + offsetX, y + offsetY, 1, 1);
                    }
                });
            });
        }
    }

    // Enhanced draw function with effects
    draw(arena, player, nextPieceType = null) {
        // Clear canvas with gradient background
        const gradient = this.context.createLinearGradient(0, 0, 0, 20);
        gradient.addColorStop(0, '#000');
        gradient.addColorStop(1, '#111');
        this.context.fillStyle = gradient;
        this.context.fillRect(0, 0, 10, 20);
        
        // Draw ghost piece first
        if (player && player.matrix) {
            this.drawGhostPiece(arena, player);
        }
        
        // Draw arena and player
        this.drawMatrix(arena, { x: 0, y: 0 });
        if (player && player.matrix) {
            this.drawMatrix(player.matrix, player.pos);
        }
        
        // Draw next piece
        if (nextPieceType) {
            this.drawNextPiece(nextPieceType);
        }
    }

    // Update UI elements
    updateUI(stats) {
        document.getElementById('score').textContent = stats.score.toLocaleString();
        document.getElementById('level').textContent = stats.level;
        document.getElementById('lines').textContent = stats.lines;
    }

    // Show game over screen
    showGameOver(score, level, lines) {
        const gameOverDiv = document.createElement('div');
        gameOverDiv.className = 'game-over';
        gameOverDiv.innerHTML = `
            <h2>Game Over!</h2>
            <p>Final Score: ${score.toLocaleString()}</p>
            <p>Level Reached: ${level}</p>
            <p>Lines Cleared: ${lines}</p>
            <button onclick="location.reload()">Play Again</button>
        `;
        document.body.appendChild(gameOverDiv);
    }

    // Show pause screen
    showPaused() {
        const pausedDiv = document.createElement('div');
        pausedDiv.className = 'paused';
        pausedDiv.id = 'paused-screen';
        pausedDiv.textContent = 'PAUSED - Press P to continue';
        document.body.appendChild(pausedDiv);
    }

    // Hide pause screen
    hidePaused() {
        const pausedDiv = document.getElementById('paused-screen');
        if (pausedDiv) {
            pausedDiv.remove();
        }
    }
}
