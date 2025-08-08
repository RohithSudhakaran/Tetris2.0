// Tetris Game Configuration
export const GAME_CONFIG = {
    BOARD_WIDTH: 10,
    BOARD_HEIGHT: 20,
    INITIAL_DROP_INTERVAL: 1000,
    MIN_DROP_INTERVAL: 50,
    LEVEL_SPEED_INCREASE: 100,
    LINES_PER_LEVEL: 10
};

// Colors for pieces
export const COLORS = [
    null,
    '#FF0D72', // T
    '#0DC2FF', // I
    '#0DFF72', // S
    '#F538FF', // Z
    '#FF8E0D', // L
    '#FFE138', // O
    '#3877FF'  // J
];

// Piece order for color mapping
export const PIECE_ORDER = ['T', 'I', 'S', 'Z', 'L', 'O', 'J'];

// Scoring system
export const SCORING = {
    SINGLE: 40,
    DOUBLE: 100,
    TRIPLE: 300,
    TETRIS: 1200,
    SOFT_DROP: 1,
    HARD_DROP: 2
};

// Key codes
export const KEYS = {
    LEFT: 37,
    RIGHT: 39,
    DOWN: 40,
    UP: 38,
    SPACE: 32,
    X: 88,
    Z: 90,
    P: 80,
    R: 82
};

// Achievement definitions
export const ACHIEVEMENTS = {
    FIRST_LINE: { name: "First Line", description: "Clear your first line", icon: "🎯" },
    TETRIS_MASTER: { name: "Tetris Master", description: "Clear 4 lines at once", icon: "🏆" },
    SPEED_DEMON: { name: "Speed Demon", description: "Reach level 5", icon: "⚡" },
    CENTURY_CLUB: { name: "Century Club", description: "Score 100+ points", icon: "💯" },
    LINE_MASTER: { name: "Line Master", description: "Clear 25 lines total", icon: "📏" },
    PERSISTENCE: { name: "Persistence", description: "Play for 2 minutes", icon: "⏰" },
    COMBO_KING: { name: "Combo King", description: "Clear 3 consecutive Tetrises", icon: "🔥" },
    MOTION_MASTER: { name: "Motion Master", description: "Use hand gesture controls", icon: "🤚" }
};
