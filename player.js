// Tetris Player and Piece Management
import { SHAPES } from './shapes.js';
import { PIECE_ORDER, GAME_CONFIG } from './config.js';
import { collide, generatePieceBag } from './utils.js';

export class Player {
    constructor() {
        this.pos = { x: 0, y: 0 };
        this.matrix = null;
        this.pieceType = null;
        this.rotationIndex = 0;
        this.colorIndex = 0;
    }

    // Create piece with proper color
    createPiece(type) {
        const pieceShapes = SHAPES[type];
        const matrix = pieceShapes[0]; // Start with first rotation
        
        const colorIndex = PIECE_ORDER.indexOf(type) + 1;
        
        return matrix.map(row => row.map(v => v ? colorIndex : 0));
    }

    // Reset player with new piece (7-bag system)
    reset(arena, pieceBag) {
        if (pieceBag.length === 0) {
            pieceBag.push(...generatePieceBag());
        }
        
        const pieceType = pieceBag.pop();
        this.pieceType = pieceType;
        this.rotationIndex = 0;
        this.colorIndex = PIECE_ORDER.indexOf(pieceType) + 1;
        
        this.matrix = this.createPiece(pieceType);
        this.pos.y = 0;
        this.pos.x = (arena[0].length / 2 | 0) - (this.matrix[0].length / 2 | 0);
        
        return collide(arena, this); // Return true if game over
    }

    // Rotate piece
    rotate(dir, arena) {
        const pos = this.pos.x;
        let offset = 1;
        
        const rotationIndex = this.rotationIndex;
        const nextRotationIndex = (rotationIndex + dir + 4) % 4;
        
        // Get the next rotation state
        const pieceShapes = SHAPES[this.pieceType];
        if (pieceShapes[nextRotationIndex]) {
            const oldMatrix = this.matrix;
            this.matrix = pieceShapes[nextRotationIndex].map(row => 
                row.map(v => v ? this.colorIndex : 0)
            );
            this.rotationIndex = nextRotationIndex;
            
            // Wall kick system
            while (collide(arena, this)) {
                this.pos.x += offset;
                offset = -(offset + (offset > 0 ? 1 : -1));
                if (offset > this.matrix[0].length) {
                    // Can't rotate, revert
                    this.matrix = oldMatrix;
                    this.rotationIndex = rotationIndex;
                    this.pos.x = pos;
                    break;
                }
            }
        }
    }

    // Move piece
    move(dir, arena) {
        this.pos.x += dir;
        if (collide(arena, this)) {
            this.pos.x -= dir;
        }
    }

    // Drop piece
    drop(arena) {
        this.pos.y++;
        if (collide(arena, this)) {
            this.pos.y--;
            return true; // Piece has landed
        }
        return false;
    }

    // Hard drop
    hardDrop(arena) {
        while (!collide(arena, { ...this, pos: { ...this.pos, y: this.pos.y + 1 } })) {
            this.pos.y++;
        }
    }
}
