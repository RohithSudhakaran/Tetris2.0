// Leaderboard Management System for Tetris 2.0
export class LeaderboardManager {
    constructor() {
        this.leaderboard = this.loadLeaderboard();
        this.currentPlayerName = '';
        this.isGameStarted = false;
    }

    // Load leaderboard from localStorage
    loadLeaderboard() {
        const saved = localStorage.getItem('tetris_leaderboard');
        if (saved) {
            return JSON.parse(saved);
        }
        return [
            { name: '---', score: 0 },
            { name: '---', score: 0 },
            { name: '---', score: 0 }
        ];
    }

    // Save leaderboard to localStorage
    saveLeaderboard() {
        localStorage.setItem('tetris_leaderboard', JSON.stringify(this.leaderboard));
    }

    // Show name entry modal
    showNameEntry() {
        const modal = document.getElementById('nameEntryModal');
        const input = document.getElementById('playerNameInput');
        const button = document.getElementById('startGameBtn');

        modal.style.display = 'flex';
        input.focus();

        // Handle enter key
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && input.value.trim()) {
                this.startGame();
            }
        });

        // Handle start button
        button.addEventListener('click', () => {
            this.startGame();
        });

        // Update button state based on input
        input.addEventListener('input', () => {
            button.disabled = !input.value.trim();
            button.style.background = input.value.trim() ? 
                'linear-gradient(145deg, #0DC2FF, #0099CC)' : '#666';
        });

        // Initial button state
        button.disabled = true;
        button.style.background = '#666';
    }

    // Start the game with player name
    startGame() {
        const input = document.getElementById('playerNameInput');
        const name = input.value.trim();
        
        if (name) {
            this.currentPlayerName = name;
            this.hideNameEntry();
            this.isGameStarted = true;
            
            // Trigger game start event
            document.dispatchEvent(new CustomEvent('gameStart', { 
                detail: { playerName: name } 
            }));
        }
    }

    // Hide name entry modal
    hideNameEntry() {
        const modal = document.getElementById('nameEntryModal');
        modal.style.display = 'none';
    }

    // Update leaderboard display
    updateDisplay() {
        const entries = document.querySelectorAll('.leaderboard-entry');
        
        entries.forEach((entry, index) => {
            const rank = entry.querySelector('.rank');
            const name = entry.querySelector('.name');
            const score = entry.querySelector('.score');
            
            if (this.leaderboard[index]) {
                name.textContent = this.leaderboard[index].name;
                score.textContent = this.leaderboard[index].score.toLocaleString();
            } else {
                name.textContent = '---';
                score.textContent = '0';
            }

            // Add ranking colors
            if (index === 0) rank.style.color = '#FFD700'; // Gold
            else if (index === 1) rank.style.color = '#C0C0C0'; // Silver
            else if (index === 2) rank.style.color = '#CD7F32'; // Bronze
        });
    }

    // Check if score qualifies for leaderboard
    checkNewRecord(score) {
        // Check if score beats any of the top 3
        for (let i = 0; i < 3; i++) {
            if (score > this.leaderboard[i].score) {
                return i + 1; // Return rank (1st, 2nd, 3rd)
            }
        }
        return null; // Not a top 3 score
    }

    // Add new score to leaderboard
    addScore(score) {
        if (!this.currentPlayerName) return null;

        const newEntry = {
            name: this.currentPlayerName,
            score: score
        };

        // Find insertion position
        let insertPosition = -1;
        for (let i = 0; i < 3; i++) {
            if (score > this.leaderboard[i].score) {
                insertPosition = i;
                break;
            }
        }

        if (insertPosition !== -1) {
            // Insert new score and shift others down
            this.leaderboard.splice(insertPosition, 0, newEntry);
            this.leaderboard = this.leaderboard.slice(0, 3); // Keep only top 3
            
            this.saveLeaderboard();
            this.updateDisplay();
            this.highlightNewRecord(insertPosition);
            
            return insertPosition + 1; // Return rank
        }

        return null;
    }

    // Highlight new record
    highlightNewRecord(position) {
        const entries = document.querySelectorAll('.leaderboard-entry');
        const newRecordEntry = entries[position];
        
        newRecordEntry.classList.add('new-record');
        
        // Remove highlight after 5 seconds
        setTimeout(() => {
            newRecordEntry.classList.remove('new-record');
        }, 5000);
    }

    // Get current player name
    getCurrentPlayerName() {
        return this.currentPlayerName;
    }

    // Check if game has started
    hasGameStarted() {
        return this.isGameStarted;
    }

    // Reset for new game
    resetForNewGame() {
        this.isGameStarted = false;
        this.showNameEntry();
    }

    // Get leaderboard data
    getLeaderboard() {
        return this.leaderboard;
    }

    // Clear all records (for testing/reset)
    clearLeaderboard() {
        this.leaderboard = [
            { name: '---', score: 0 },
            { name: '---', score: 0 },
            { name: '---', score: 0 }
        ];
        this.saveLeaderboard();
        this.updateDisplay();
    }
}
