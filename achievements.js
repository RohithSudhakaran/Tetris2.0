// Achievement System for Tetris 2.0
import { ACHIEVEMENTS } from './config.js';

export class AchievementManager {
    constructor() {
        this.unlockedAchievements = new Set();
        this.gameStats = {
            linesCleared: 0,
            tetrisCount: 0,
            consecutiveTetris: 0,
            maxLevel: 1,
            totalScore: 0,
            playTime: 0,
            gameStartTime: Date.now()
        };
    }

    checkAchievements(gameLogic, linesCleared = 0) {
        const stats = gameLogic.getStats();
        this.gameStats.playTime = (Date.now() - this.gameStats.gameStartTime) / 1000;
        
        // Update stats
        this.gameStats.linesCleared = stats.lines;
        this.gameStats.maxLevel = Math.max(this.gameStats.maxLevel, stats.level);
        this.gameStats.totalScore = stats.score;
        
        // Track consecutive Tetris
        if (linesCleared === 4) {
            this.gameStats.tetrisCount++;
            this.gameStats.consecutiveTetris++;
        } else if (linesCleared > 0 && linesCleared < 4) {
            this.gameStats.consecutiveTetris = 0;
        }
        
        // Check all achievements
        this.checkFirstLine();
        this.checkTetrisMaster();
        this.checkSpeedDemon();
        this.checkCenturyClub();
        this.checkLineMaster();
        this.checkPersistence();
        this.checkComboKing();
    }

    checkFirstLine() {
        if (this.gameStats.linesCleared >= 1 && !this.unlockedAchievements.has('FIRST_LINE')) {
            this.unlockAchievement('FIRST_LINE');
        }
    }

    checkTetrisMaster() {
        if (this.gameStats.tetrisCount >= 1 && !this.unlockedAchievements.has('TETRIS_MASTER')) {
            this.unlockAchievement('TETRIS_MASTER');
        }
    }

    checkSpeedDemon() {
        if (this.gameStats.maxLevel >= 5 && !this.unlockedAchievements.has('SPEED_DEMON')) {
            this.unlockAchievement('SPEED_DEMON');
        }
    }

    checkCenturyClub() {
        if (this.gameStats.totalScore >= 100 && !this.unlockedAchievements.has('CENTURY_CLUB')) {
            this.unlockAchievement('CENTURY_CLUB');
        }
    }

    checkLineMaster() {
        if (this.gameStats.linesCleared >= 25 && !this.unlockedAchievements.has('LINE_MASTER')) {
            this.unlockAchievement('LINE_MASTER');
        }
    }

    checkPersistence() {
        if (this.gameStats.playTime >= 120 && !this.unlockedAchievements.has('PERSISTENCE')) {
            this.unlockAchievement('PERSISTENCE');
        }
    }

    checkComboKing() {
        if (this.gameStats.consecutiveTetris >= 3 && !this.unlockedAchievements.has('COMBO_KING')) {
            this.unlockAchievement('COMBO_KING');
        }
    }

    unlockAchievement(achievementKey) {
        if (this.unlockedAchievements.has(achievementKey)) return;
        
        this.unlockedAchievements.add(achievementKey);
        const achievement = ACHIEVEMENTS[achievementKey];
        
        // Display achievement notification
        this.showAchievementNotification(achievement);
        
        // Add to achievement list
        this.addToAchievementList(achievement);
    }

    showAchievementNotification(achievement) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'achievement-notification';
        notification.innerHTML = `
            <div style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(145deg, #00FF88, #00CC66);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 255, 136, 0.3);
                z-index: 1001;
                animation: slideIn 0.5s ease-out;
                font-weight: bold;
            ">
                ${achievement.icon} ${achievement.name}<br>
                <small style="opacity: 0.8;">${achievement.description}</small>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    addToAchievementList(achievement) {
        const list = document.getElementById('achievement-list');
        const achievementElement = document.createElement('div');
        achievementElement.className = 'achievement';
        achievementElement.textContent = `${achievement.icon} ${achievement.name}`;
        list.appendChild(achievementElement);
    }

    reset() {
        this.unlockedAchievements.clear();
        this.gameStats = {
            linesCleared: 0,
            tetrisCount: 0,
            consecutiveTetris: 0,
            maxLevel: 1,
            totalScore: 0,
            playTime: 0,
            gameStartTime: Date.now()
        };
        document.getElementById('achievement-list').innerHTML = '';
    }
}
