# 🎮 Tetris 2.0 - Enhanced Edition with Motion Control

A modern Tetris game featuring **hand gesture controls** using your webcam!

## 🚀 Features

### 🎯 Game Features
- **Classic Tetris gameplay** with all 7 standard pieces
- **7-bag randomization** for fair piece distribution
- **Progressive difficulty** with increasing speed
- **Achievement system** with 8 unlockable achievements
- **Next piece preview** and ghost piece
- **Pause/Resume** functionality

### 🤚 Motion Control Features
- **Real-time hand tracking** using MediaPipe
- **Gesture recognition** for intuitive controls
- **Visual feedback** for recognized gestures
- **Toggle on/off** motion controls

## 🎮 Controls

### ⌨️ Keyboard Controls
- **Arrow Keys** - Move pieces left/right, soft drop
- **Up Arrow / X** - Rotate clockwise
- **Z** - Rotate counter-clockwise
- **Spacebar** - Hard drop
- **P** - Pause/Resume
- **R** - Restart game

### 🤚 Hand Gesture Controls
- **👋 Open Palm** - Move piece left
- **✊ Closed Fist** - Move piece right
- **👍 Thumbs Up** - Rotate piece
- **👇 Point Down** - Soft drop
- **✌️ Peace Sign** - Hard drop
- **👌 OK Sign** - Pause/Resume

## 🚀 Getting Started

1. **Open the game** in a modern web browser
2. **Allow camera access** when prompted
3. **Click "Enable Gestures"** in the motion control panel
4. **Position your hand** in front of the camera
5. **Make gestures** to control the game!

## 🎯 Achievements

- 🎯 **First Line** - Clear your first line
- 🏆 **Tetris Master** - Clear 4 lines at once
- ⚡ **Speed Demon** - Reach level 5
- 💯 **Century Club** - Score 100+ points
- 📏 **Line Master** - Clear 25 lines total
- ⏰ **Persistence** - Play for 2 minutes
- 🔥 **Combo King** - Clear 3 consecutive Tetrises
- 🤚 **Motion Master** - Use hand gesture controls

## 🔧 Technical Requirements

### Browser Support
- **Chrome 80+** (Recommended)
- **Firefox 75+**
- **Safari 14+**
- **Edge 80+**

### Hardware Requirements
- **Webcam** for motion control
- **Decent lighting** for better hand tracking
- **Modern computer** (motion control is CPU intensive)

## 🎨 File Structure

```
Tetris2.0/
├── index.html                 # Main HTML file
├── styles.css                 # Styling
├── game.js                    # Main game controller
├── config.js                  # Game configuration
├── shapes.js                  # Tetris piece definitions
├── utils.js                   # Utility functions
├── player.js                  # Player/piece management
├── gameLogic.js               # Game logic & scoring
├── renderer.js                # Rendering system
├── input.js                   # Keyboard input handling
├── achievements.js            # Achievement system
├── handGestureController.js   # Motion control system
└── README.md                  # This file
```

## 🛠️ Technologies Used

- **HTML5 Canvas** - Game rendering
- **ES6 Modules** - Code organization
- **MediaPipe Hands** - Hand tracking
- **WebRTC** - Camera access
- **CSS3** - Modern styling with animations

## 🎮 Tips for Motion Control

1. **Good Lighting** - Ensure your hand is well-lit
2. **Clear Background** - Avoid cluttered backgrounds
3. **Steady Hand** - Keep gestures clear and deliberate
4. **Distance** - Keep hand 1-2 feet from camera
5. **Practice** - Motion control has a learning curve!

## 🚀 Performance Optimization

The motion control system is optimized for performance:
- **Low complexity model** for faster processing
- **Gesture buffering** to smooth recognition
- **Throttled input** to prevent spam
- **Efficient collision detection**

## 🎯 Future Enhancements

- **Voice commands** for additional control
- **Multiple hand tracking** for advanced gestures
- **Customizable gesture mapping**
- **Multiplayer with motion control**
- **VR support**

---

**Enjoy playing Tetris 2.0 with motion control!** 🎮✨

Made with ❤️ using modern web technologies.
