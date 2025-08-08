// Hand Gesture Controller for Tetris 2.0
// Uses MediaPipe Hands for efficient real-time hand tracking

class HandGestureController {
    constructor(gameController) {
        this.gameController = gameController;
        this.isEnabled = false;
        this.lastGesture = null;
        this.gestureThrottle = 200; // Minimum ms between gestures
        this.lastGestureTime = 0;
        
        // Gesture detection states
        this.gestureBuffer = [];
        this.bufferSize = 3; // Smooth gestures over 3 frames
        
        // Continuous movement states
        this.continuousMovement = {
            isActive: false,
            direction: null, // 'left' or 'right'
            interval: null,
            moveSpeed: 350 // ms between continuous moves (slower for easier control)
        }
        
        // Camera and MediaPipe setup
        this.camera = null;
        this.hands = null;
        this.video = null;
        this.canvas = null;
        this.ctx = null;
        
        this.initializeCamera();
    }

    async initializeCamera() {
        try {
            // Create video element for camera feed
            this.video = document.createElement('video');
            this.video.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                height: 240px;
                border: 2px solid #0DC2FF;
                border-radius: 8px;
                z-index: 100;
                transform: scaleX(-1); /* Mirror the video */
            `;
            this.video.autoplay = true;
            this.video.muted = true;
            document.body.appendChild(this.video);

            // Create canvas for hand landmarks overlay
            this.canvas = document.createElement('canvas');
            this.canvas.width = 320;
            this.canvas.height = 240;
            this.canvas.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                width: 320px;
                height: 240px;
                border: 2px solid #0DC2FF;
                border-radius: 8px;
                z-index: 101;
                pointer-events: none;
                transform: scaleX(-1);
            `;
            this.ctx = this.canvas.getContext('2d');
            document.body.appendChild(this.canvas);

            // Initialize MediaPipe Hands
            await this.initializeMediaPipe();
            
            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    width: 320, 
                    height: 240,
                    facingMode: 'user'
                }
            });
            
            this.video.srcObject = stream;
            this.addControlUI();
            
        } catch (error) {
            console.error('Camera initialization failed:', error);
            this.showError('Camera access denied or not available');
        }
    }

    async initializeMediaPipe() {
        // Load MediaPipe Hands
        this.hands = new Hands({
            locateFile: (file) => {
                return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
            }
        });

        this.hands.setOptions({
            maxNumHands: 1,
            modelComplexity: 0, // Faster processing
            minDetectionConfidence: 0.7,
            minTrackingConfidence: 0.5
        });

        this.hands.onResults((results) => this.onHandResults(results));

        // Initialize camera with MediaPipe
        this.camera = new Camera(this.video, {
            onFrame: async () => {
                if (this.isEnabled) {
                    await this.hands.send({ image: this.video });
                }
            },
            width: 320,
            height: 240
        });
    }

    onHandResults(results) {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            const landmarks = results.multiHandLandmarks[0];
            
            // Draw hand landmarks
            this.drawHandLandmarks(landmarks);
            
            // Detect gesture
            const gesture = this.detectGesture(landmarks);
            this.processGesture(gesture);
        }
    }

    detectGesture(landmarks) {
        // Get key landmark points
        const thumb_tip = landmarks[4];
        const thumb_ip = landmarks[3];
        const index_tip = landmarks[8];
        const index_pip = landmarks[6];
        const middle_tip = landmarks[12];
        const middle_pip = landmarks[10];
        const ring_tip = landmarks[16];
        const ring_pip = landmarks[14];
        const pinky_tip = landmarks[20];
        const pinky_pip = landmarks[18];
        const wrist = landmarks[0];

        // Calculate finger states (extended or not)
        const fingers = {
            thumb: thumb_tip.x > thumb_ip.x, // Thumb logic (left/right)
            index: index_tip.y < index_pip.y,
            middle: middle_tip.y < middle_pip.y,
            ring: ring_tip.y < ring_pip.y,
            pinky: pinky_tip.y < pinky_pip.y
        };

        // Count extended fingers
        const extendedCount = Object.values(fingers).filter(Boolean).length;

        // Gesture recognition
        if (extendedCount === 5) {
            return 'FIVE_FINGERS'; // All fingers extended - Move Right
        } else if (extendedCount === 4 && !fingers.thumb) {
            return 'FOUR_FINGERS'; // Four fingers (no thumb) - Move Left
        } else if (extendedCount === 1 && fingers.index && !fingers.thumb && !fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'ONE_FINGER'; // Only index finger - Rotate
        } else if (extendedCount === 0) {
            return 'CLOSED_FIST'; // All fingers closed - No function
        } else if (fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'THUMB_INDEX'; // Thumb and index finger - Drop
        } else if (!fingers.thumb && fingers.index && fingers.middle && !fingers.ring && !fingers.pinky) {
            return 'PEACE'; // Peace sign - Hard Drop
        } else if (fingers.thumb && fingers.index && !fingers.middle && !fingers.ring && !fingers.pinky) {
            // Check if thumb and index form a circle (OK sign)
            const distance = Math.sqrt(
                Math.pow(thumb_tip.x - index_tip.x, 2) + 
                Math.pow(thumb_tip.y - index_tip.y, 2)
            );
            if (distance < 0.05) {
                return 'OK_SIGN'; // OK sign - Pause
            }
        }

        return 'UNKNOWN';
    }

    processGesture(gesture) {
        const now = Date.now();
        
        // Add to gesture buffer for smoothing
        this.gestureBuffer.push(gesture);
        if (this.gestureBuffer.length > this.bufferSize) {
            this.gestureBuffer.shift();
        }

        // Get most common gesture in buffer
        const mostCommon = this.getMostCommonGesture();
        
        // Handle continuous movement gestures (FIVE_FINGERS and FOUR_FINGERS)
        if (mostCommon === 'FIVE_FINGERS' || mostCommon === 'FOUR_FINGERS') {
            this.handleContinuousMovement(mostCommon);
            return;
        }
        
        // Stop continuous movement if other gesture detected
        this.stopContinuousMovement();
        
        // Handle single-action gestures with throttling
        if (now - this.lastGestureTime < this.gestureThrottle) {
            return;
        }
        
        if (mostCommon !== this.lastGesture && mostCommon !== 'UNKNOWN') {
            this.executeGesture(mostCommon);
            this.lastGesture = mostCommon;
            this.lastGestureTime = now;
        }
    }

    getMostCommonGesture() {
        const counts = {};
        this.gestureBuffer.forEach(gesture => {
            counts[gesture] = (counts[gesture] || 0) + 1;
        });
        
        return Object.keys(counts).reduce((a, b) => 
            counts[a] > counts[b] ? a : b
        );
    }

    handleContinuousMovement(gesture) {
        const direction = gesture === 'FOUR_FINGERS' ? 'left' : 'right'; // 4 fingers = left, 5 fingers = right
        
        // If already moving in the same direction, continue
        if (this.continuousMovement.isActive && this.continuousMovement.direction === direction) {
            return;
        }
        
        // Stop any existing movement
        this.stopContinuousMovement();
        
        // Start new continuous movement
        this.startContinuousMovement(direction, gesture);
    }

    startContinuousMovement(direction, gesture) {
        this.continuousMovement.isActive = true;
        this.continuousMovement.direction = direction;
        
        // Execute immediate move
        this.executeContinuousMove(direction, gesture);
        
        // Start interval for continuous movement
        this.continuousMovement.interval = setInterval(() => {
            this.executeContinuousMove(direction, gesture);
        }, this.continuousMovement.moveSpeed);
    }

    stopContinuousMovement() {
        if (this.continuousMovement.interval) {
            clearInterval(this.continuousMovement.interval);
            this.continuousMovement.interval = null;
        }
        this.continuousMovement.isActive = false;
        this.continuousMovement.direction = null;
    }

    executeContinuousMove(direction, gesture) {
        if (!this.gameController || this.gameController.gameLogic.isGameOver) {
            this.stopContinuousMovement();
            return;
        }

        // Show gesture feedback (but less frequently for continuous movement)
        if (!this.continuousMovement.lastFeedbackTime || 
            Date.now() - this.continuousMovement.lastFeedbackTime > 500) {
            this.showGestureFeedback(gesture);
            this.continuousMovement.lastFeedbackTime = Date.now();
        }

        // Execute movement
        const moveDirection = direction === 'left' ? -1 : 1;
        this.gameController.player.move(moveDirection, this.gameController.arena);
    }

    executeGesture(gesture) {
        if (!this.gameController || this.gameController.gameLogic.isGameOver) return;

        // Show gesture feedback
        this.showGestureFeedback(gesture);

        switch (gesture) {
            case 'ONE_FINGER':
                this.gameController.player.rotate(1, this.gameController.arena);
                break;
            case 'CLOSED_FIST':
                // No function - do nothing
                break;
            case 'THUMB_INDEX':
                this.gameController.player.drop(this.gameController.arena);
                break;
            case 'PEACE':
                this.gameController.player.hardDrop(this.gameController.arena);
                break;
            case 'OK_SIGN':
                this.gameController.gameLogic.togglePause();
                break;
            // FIVE_FINGERS and FOUR_FINGERS are handled by continuous movement system
        }
    }

    drawHandLandmarks(landmarks) {
        this.ctx.fillStyle = '#0DC2FF';
        this.ctx.strokeStyle = '#0DC2FF';
        this.ctx.lineWidth = 2;

        // Draw landmarks
        landmarks.forEach((landmark, index) => {
            const x = landmark.x * this.canvas.width;
            const y = landmark.y * this.canvas.height;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, 2 * Math.PI);
            this.ctx.fill();
        });

        // Draw connections
        const connections = [
            [0, 1], [1, 2], [2, 3], [3, 4], // Thumb
            [0, 5], [5, 6], [6, 7], [7, 8], // Index
            [0, 9], [9, 10], [10, 11], [11, 12], // Middle
            [0, 13], [13, 14], [14, 15], [15, 16], // Ring
            [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
            [5, 9], [9, 13], [13, 17] // Palm
        ];

        connections.forEach(([start, end]) => {
            const startPoint = landmarks[start];
            const endPoint = landmarks[end];
            
            this.ctx.beginPath();
            this.ctx.moveTo(startPoint.x * this.canvas.width, startPoint.y * this.canvas.height);
            this.ctx.lineTo(endPoint.x * this.canvas.width, endPoint.y * this.canvas.height);
            this.ctx.stroke();
        });
    }

    showGestureFeedback(gesture) {
        // Create gesture feedback element
        const feedback = document.createElement('div');
        feedback.style.cssText = `
            position: fixed;
            top: 270px;
            right: 20px;
            background: rgba(13, 194, 255, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 20px;
            font-weight: bold;
            z-index: 102;
            animation: fadeInOut 1s ease-in-out;
        `;
        
        const gestureNames = {
            'FIVE_FINGERS': '🖐️ Move Right',
            'FOUR_FINGERS': '🤚 Move Left', 
            'ONE_FINGER': '☝️ Rotate',
            'CLOSED_FIST': '✊ No Function',
            'THUMB_INDEX': '🤏 Drop',
            'PEACE': '✌️ Hard Drop',
            'OK_SIGN': '👌 Pause'
        };
        
        feedback.textContent = gestureNames[gesture] || gesture;
        document.body.appendChild(feedback);
        
        setTimeout(() => feedback.remove(), 1000);
    }

    addControlUI() {
        // Add gesture control toggle button
        const controlPanel = document.createElement('div');
        controlPanel.style.cssText = `
            position: fixed;
            top: 270px;
            right: 20px;
            background: rgba(0, 0, 0, 0.9);
            color: white;
            padding: 20px;
            border-radius: 15px;
            z-index: 99;
            font-size: 12px;
            min-width: 280px;
            border: 2px solid #0DC2FF;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
        `;
        
        controlPanel.innerHTML = `
            <button id="toggleGestures" style="
                background: ${this.isEnabled ? 'linear-gradient(145deg, #00FF88, #00CC66)' : 'linear-gradient(145deg, #FF4444, #CC2222)'};
                color: white;
                border: none;
                padding: 15px 20px;
                border-radius: 12px;
                cursor: pointer;
                margin-bottom: 15px;
                width: 100%;
                font-size: 16px;
                font-weight: bold;
                box-shadow: 0 4px 15px rgba(${this.isEnabled ? '0, 255, 136' : '255, 68, 68'}, 0.3);
                transition: all 0.3s ease;
                text-transform: uppercase;
                letter-spacing: 1px;
            " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 20px rgba(${this.isEnabled ? '0, 255, 136' : '255, 68, 68'}, 0.4)';" 
               onmouseout="this.style.transform='translateY(0px)'; this.style.boxShadow='0 4px 15px rgba(${this.isEnabled ? '0, 255, 136' : '255, 68, 68'}, 0.3)';">
                ${this.isEnabled ? '🤚 DISABLE GESTURES' : '🤚 ENABLE GESTURES'}
            </button>
            <div style="
                font-size: 14px; 
                line-height: 2.0; 
                background: rgba(13, 194, 255, 0.1);
                padding: 15px;
                border-radius: 10px;
                border: 2px solid rgba(13, 194, 255, 0.3);
                margin-top: 10px;
            ">
                <div style="color: #0DC2FF; font-weight: bold; margin-bottom: 10px; font-size: 16px;">🎮 GESTURE CONTROLS</div>
                <div style="color: #FFF;">🖐️ <strong>Five Fingers</strong> = Move Right</div>
                <div style="color: #FFF;">🤚 <strong>Four Fingers</strong> = Move Left</div>
                <div style="color: #FFF;">☝️ <strong>One Finger</strong> = Rotate</div>
                <div style="color: #888;">✊ <strong>Closed Fist</strong> = No Function</div>
                <div style="color: #FFF;">🤏 <strong>Thumb+Index</strong> = Drop</div>
                <div style="color: #FFF;">✌️ <strong>Peace Sign</strong> = Hard Drop</div>
                <div style="color: #FFF;">👌 <strong>OK Sign</strong> = Pause</div>
            </div>
        `;
        
        document.body.appendChild(controlPanel);
        
        // Toggle button functionality
        document.getElementById('toggleGestures').addEventListener('click', () => {
            this.toggleGestureControl();
        });
    }

    toggleGestureControl() {
        this.isEnabled = !this.isEnabled;
        const button = document.getElementById('toggleGestures');
        
        // Update button text and styling
        button.innerHTML = this.isEnabled ? '🤚 DISABLE GESTURES' : '🤚 ENABLE GESTURES';
        button.style.background = this.isEnabled ? 
            'linear-gradient(145deg, #00FF88, #00CC66)' : 
            'linear-gradient(145deg, #FF4444, #CC2222)';
        button.style.boxShadow = this.isEnabled ?
            '0 4px 15px rgba(0, 255, 136, 0.3)' :
            '0 4px 15px rgba(255, 68, 68, 0.3)';
        
        if (this.isEnabled) {
            this.camera.start();
        } else {
            this.camera.stop();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #FF4444;
            color: white;
            padding: 15px;
            border-radius: 8px;
            z-index: 200;
        `;
        errorDiv.textContent = `Gesture Control Error: ${message}`;
        document.body.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    destroy() {
        // Stop continuous movement
        this.stopContinuousMovement();
        
        if (this.camera) {
            this.camera.stop();
        }
        if (this.video && this.video.srcObject) {
            this.video.srcObject.getTracks().forEach(track => track.stop());
        }
        
        // Remove UI elements
        [this.video, this.canvas].forEach(element => {
            if (element && element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });
    }
}

// CSS for animations
const gestureCSS = `
    @keyframes fadeInOut {
        0% { opacity: 0; transform: scale(0.8); }
        50% { opacity: 1; transform: scale(1); }
        100% { opacity: 0; transform: scale(0.8); }
    }
`;

// Add CSS to document
const style = document.createElement('style');
style.textContent = gestureCSS;
document.head.appendChild(style);

export { HandGestureController };
