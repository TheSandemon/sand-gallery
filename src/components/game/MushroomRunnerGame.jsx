import React, { useRef, useEffect, useState, useCallback } from 'react';

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
    // Physics
    GRAVITY: 0.8,
    JUMP_FORCE: -15,
    GROUND_Y: 0.75, // 75% from top

    // Gameplay
    INITIAL_SCROLL_SPEED: 4,
    MAX_SCROLL_SPEED: 12,
    SPEED_INCREMENT: 0.001,
    MUSHROOM_SPAWN_RATE: 0.02,
    GREEN_RATIO: 0.6, // 60% green, 40% red

    // Player
    PLAYER_WIDTH: 50,
    PLAYER_HEIGHT: 60,
    PLAYER_X: 100,

    // Mushrooms
    MUSHROOM_WIDTH: 40,
    MUSHROOM_HEIGHT: 50,

    // Scoring
    GREEN_POINTS: 10,

    // Parallax
    BG_SPEED_RATIO: [0.1, 0.3, 0.6], // Layer speeds
};

// ============================================
// PARTICLE SYSTEM
// ============================================
class Particle {
    constructor(x, y, color, velocity, life = 60) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = velocity.x + (Math.random() - 0.5) * 4;
        this.vy = velocity.y + (Math.random() - 0.5) * 4;
        this.life = life;
        this.maxLife = life;
        this.size = Math.random() * 6 + 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.2;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.15; // gravity
        this.life--;
        this.rotation += this.rotationSpeed;
        this.size *= 0.98;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// Score popup
class ScorePopup {
    constructor(x, y, score) {
        this.x = x;
        this.y = y;
        this.score = score;
        this.life = 60;
        this.maxLife = 60;
    }

    update() {
        this.y -= 2;
        this.life--;
    }

    draw(ctx) {
        const alpha = this.life / this.maxLife;
        const scale = 1 + (1 - alpha) * 0.5;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.font = `bold ${24 * scale}px 'Inter', sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillStyle = '#00ff88';
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff88';
        ctx.fillText(`+${this.score}`, this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

// ============================================
// MUSHROOM CLASS
// ============================================
class Mushroom {
    constructor(x, y, isGreen) {
        this.x = x;
        this.y = y;
        this.isGreen = isGreen;
        this.width = CONFIG.MUSHROOM_WIDTH;
        this.height = CONFIG.MUSHROOM_HEIGHT;
        this.collected = false;
        this.phase = Math.random() * Math.PI * 2;
        this.glowIntensity = 0;
    }

    update(scrollSpeed) {
        this.x -= scrollSpeed;
        this.phase += 0.1;
        this.glowIntensity = 0.5 + Math.sin(this.phase) * 0.3;
    }

    draw(ctx) {
        if (this.collected) return;

        const baseColor = this.isGreen ? '#00ff88' : '#ff4444';
        const stemColor = '#f5f5dc';

        ctx.save();

        // Glow effect
        ctx.shadowBlur = 20 + this.glowIntensity * 15;
        ctx.shadowColor = baseColor;

        // Stem
        ctx.fillStyle = stemColor;
        ctx.beginPath();
        ctx.roundRect(this.x + 12, this.y + 25, 16, 25, 3);
        ctx.fill();

        // Cap
        const gradient = ctx.createRadialGradient(
            this.x + 20, this.y + 15, 5,
            this.x + 20, this.y + 20, 25
        );
        gradient.addColorStop(0, this.isGreen ? '#88ffbb' : '#ff8888');
        gradient.addColorStop(1, baseColor);
        ctx.fillStyle = gradient;

        ctx.beginPath();
        ctx.ellipse(this.x + 20, this.y + 20, 22, 18, 0, Math.PI, 0);
        ctx.fill();

        // Spots
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.beginPath();
        ctx.arc(this.x + 12, this.y + 12, 4, 0, Math.PI * 2);
        ctx.arc(this.x + 28, this.y + 10, 3, 0, Math.PI * 2);
        ctx.arc(this.x + 20, this.y + 18, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
        };
    }

    isOffScreen() {
        return this.x + this.width < 0;
    }
}

// ============================================
// PLAYER CLASS
// ============================================
class Player {
    constructor(groundY) {
        this.x = CONFIG.PLAYER_X;
        this.y = groundY - CONFIG.PLAYER_HEIGHT;
        this.width = CONFIG.PLAYER_WIDTH;
        this.height = CONFIG.PLAYER_HEIGHT;
        this.vy = 0;
        this.isJumping = false;
        this.groundY = groundY;
        this.runFrame = 0;
        this.trailPositions = [];
    }

    jump() {
        if (!this.isJumping) {
            this.vy = CONFIG.JUMP_FORCE;
            this.isJumping = true;
        }
    }

    update() {
        // Store trail position
        this.trailPositions.push({ x: this.x, y: this.y, alpha: 1 });
        if (this.trailPositions.length > 8) {
            this.trailPositions.shift();
        }

        // Update trail alpha
        this.trailPositions.forEach((pos, i) => {
            pos.alpha = (i + 1) / this.trailPositions.length * 0.3;
        });

        // Apply gravity
        this.vy += CONFIG.GRAVITY;
        this.y += this.vy;

        // Ground collision
        if (this.y >= this.groundY - this.height) {
            this.y = this.groundY - this.height;
            this.vy = 0;
            this.isJumping = false;
        }

        // Animation frame
        if (!this.isJumping) {
            this.runFrame = (this.runFrame + 0.3) % 4;
        }
    }

    draw(ctx) {
        // Draw trail
        if (this.isJumping) {
            this.trailPositions.forEach((pos) => {
                ctx.save();
                ctx.globalAlpha = pos.alpha;
                this.drawCharacter(ctx, pos.x, pos.y);
                ctx.restore();
            });
        }

        // Draw main character
        this.drawCharacter(ctx, this.x, this.y);
    }

    drawCharacter(ctx, x, y) {
        ctx.save();

        // Glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#c79b37';

        // Body (rounded rectangle)
        const gradient = ctx.createLinearGradient(x, y, x, y + this.height);
        gradient.addColorStop(0, '#ffcc66');
        gradient.addColorStop(1, '#c79b37');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x + 10, y + 15, 30, 35, 8);
        ctx.fill();

        // Head
        ctx.fillStyle = '#ffcc66';
        ctx.beginPath();
        ctx.arc(x + 25, y + 12, 14, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#333';
        const eyeOffset = this.isJumping ? -2 : 0;
        ctx.beginPath();
        ctx.arc(x + 20, y + 10 + eyeOffset, 3, 0, Math.PI * 2);
        ctx.arc(x + 30, y + 10 + eyeOffset, 3, 0, Math.PI * 2);
        ctx.fill();

        // Smile
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x + 25, y + 14, 5, 0.1 * Math.PI, 0.9 * Math.PI);
        ctx.stroke();

        // Legs (animated)
        ctx.fillStyle = '#8B4513';
        const legOffset = Math.sin(this.runFrame * Math.PI) * (this.isJumping ? 0 : 5);
        ctx.beginPath();
        ctx.roundRect(x + 12, y + 48 + legOffset, 10, 12, 3);
        ctx.roundRect(x + 28, y + 48 - legOffset, 10, 12, 3);
        ctx.fill();

        ctx.restore();
    }

    getBounds() {
        return {
            x: this.x + 10,
            y: this.y + 10,
            width: this.width - 20,
            height: this.height - 15
        };
    }
}

// ============================================
// BACKGROUND LAYERS
// ============================================
class BackgroundLayer {
    constructor(color, speedRatio, elements) {
        this.color = color;
        this.speedRatio = speedRatio;
        this.offset = 0;
        this.elements = elements;
    }

    update(scrollSpeed) {
        this.offset += scrollSpeed * this.speedRatio;
    }

    draw(ctx, width, height) {
        // Draw elements with parallax offset
    }
}

// ============================================
// MAIN GAME COMPONENT
// ============================================
const MushroomRunnerGame = ({ width, height, isEditor = false }) => {
    const canvasRef = useRef(null);
    const gameRef = useRef({
        state: 'START', // START, PLAYING, GAMEOVER
        score: 0,
        highScore: 0,
        scrollSpeed: CONFIG.INITIAL_SCROLL_SPEED,
        player: null,
        mushrooms: [],
        particles: [],
        scorePopups: [],
        bgLayers: [],
        groundOffset: 0,
        starField: [],
        shakeAmount: 0,
        lastTime: 0,
        animationId: null,
    });

    const [gameState, setGameState] = useState('START');
    const [score, setScore] = useState(0);
    const [highScore, setHighScore] = useState(0);

    // Initialize game
    const initGame = useCallback((canvas) => {
        const game = gameRef.current;
        const groundY = canvas.height * CONFIG.GROUND_Y;

        game.player = new Player(groundY);
        game.mushrooms = [];
        game.particles = [];
        game.scorePopups = [];
        game.score = 0;
        game.scrollSpeed = CONFIG.INITIAL_SCROLL_SPEED;
        game.groundOffset = 0;
        game.shakeAmount = 0;

        // Create star field
        game.starField = [];
        for (let i = 0; i < 100; i++) {
            game.starField.push({
                x: Math.random() * canvas.width,
                y: Math.random() * (canvas.height * 0.6),
                size: Math.random() * 2 + 0.5,
                twinkle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.5 + 0.1,
            });
        }

        setScore(0);
        // If in editor, force a draw but don't auto-start
        if (isEditor) {
            // Optional: draw initial state
        }
    }, [isEditor]);

    // ... (keep helper functions same)

    // Game loop and sizing
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const game = gameRef.current;

        // Set canvas size from props or fallback to window
        // Note: In editor grid, width/height are passed. On standalone page, they might be undefined.
        const targetWidth = width || Math.min(window.innerWidth, 1200);
        const targetHeight = height || Math.min(window.innerHeight - 200, 600);

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        if (game.player) {
            game.player.groundY = canvas.height * CONFIG.GROUND_Y;
            // Ensure player stays on ground during resize
            if (!game.player.isJumping) {
                game.player.y = game.player.groundY - game.player.height;
            }
        } else {
            initGame(canvas);
        }

        // Input handling
        const handleInput = (e) => {
            // Prevent scrolling on space bar
            if (e.code === 'Space') e.preventDefault();

            // In editor, maybe click to focus first? For now allow interaction.
            if (isEditor && game.state === 'START') {
                // require explicit start
            }

            if (e.code === 'Space' || e.type === 'touchstart') {
                if (game.state === 'START') {
                    game.state = 'PLAYING';
                    setGameState('PLAYING');
                } else if (game.state === 'PLAYING') {
                    game.player?.jump();
                } else if (game.state === 'GAMEOVER') {
                    initGame(canvas);
                    game.state = 'PLAYING';
                    setGameState('PLAYING');
                }
            }
        };

        window.addEventListener('keydown', handleInput);
        canvas.addEventListener('touchstart', handleInput, { passive: false });

        // Main game loop
        const gameLoop = (timestamp) => {
            if (!game.lastTime) game.lastTime = timestamp;
            const deltaTime = timestamp - game.lastTime;
            game.lastTime = timestamp;

            // ... (keep drawing logic exactly as is)

            // Clear canvas with shake effect
            ctx.save();
            if (game.shakeAmount > 0) {
                ctx.translate(
                    (Math.random() - 0.5) * game.shakeAmount,
                    (Math.random() - 0.5) * game.shakeAmount
                );
                game.shakeAmount *= 0.9;
            }

            // Draw background gradient
            const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
            bgGradient.addColorStop(0, '#0a0a1a');
            bgGradient.addColorStop(0.6, '#1a1a2e');
            bgGradient.addColorStop(1, '#16213e');
            ctx.fillStyle = bgGradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw stars
            game.starField.forEach((star) => {
                star.twinkle += 0.05;
                if (game.state === 'PLAYING') {
                    star.x -= game.scrollSpeed * star.speed * 0.1;
                }
                if (star.x < 0) star.x = canvas.width;

                const alpha = 0.5 + Math.sin(star.twinkle) * 0.3;
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });

            // Draw mountains (parallax)
            ctx.fillStyle = '#1a1a2e';
            for (let i = 0; i < 3; i++) {
                const offset = (game.groundOffset * 0.2 + i * 200) % (canvas.width + 400) - 200;
                ctx.beginPath();
                ctx.moveTo(offset, canvas.height * 0.75);
                ctx.lineTo(offset + 100, canvas.height * 0.45);
                ctx.lineTo(offset + 200, canvas.height * 0.75);
                ctx.fill();
            }

            // Draw hills (parallax)
            ctx.fillStyle = '#2a2a4e';
            for (let i = 0; i < 5; i++) {
                const offset = (game.groundOffset * 0.4 + i * 150) % (canvas.width + 300) - 150;
                ctx.beginPath();
                ctx.moveTo(offset, canvas.height * 0.75);
                ctx.quadraticCurveTo(offset + 75, canvas.height * 0.55, offset + 150, canvas.height * 0.75);
                ctx.fill();
            }

            // Draw ground
            const groundY = canvas.height * CONFIG.GROUND_Y;
            const groundGradient = ctx.createLinearGradient(0, groundY, 0, canvas.height);
            groundGradient.addColorStop(0, '#008f4e');
            groundGradient.addColorStop(0.1, '#006633');
            groundGradient.addColorStop(1, '#003322');
            ctx.fillStyle = groundGradient;
            ctx.fillRect(0, groundY, canvas.width, canvas.height - groundY);

            // Ground pattern
            ctx.strokeStyle = 'rgba(0, 180, 100, 0.3)';
            ctx.lineWidth = 2;
            for (let i = 0; i < canvas.width + 50; i += 50) {
                const x = (i - game.groundOffset % 50);
                ctx.beginPath();
                ctx.moveTo(x, groundY);
                ctx.lineTo(x + 25, groundY + 15);
                ctx.stroke();
            }

            // Game logic when playing
            if (game.state === 'PLAYING') {
                // Update scroll speed
                game.scrollSpeed = Math.min(CONFIG.MAX_SCROLL_SPEED, game.scrollSpeed + CONFIG.SPEED_INCREMENT);
                game.groundOffset += game.scrollSpeed;

                // Spawn mushrooms
                if (Math.random() < CONFIG.MUSHROOM_SPAWN_RATE) {
                    spawnMushroom(canvas);
                }

                // Update player
                game.player?.update();

                // Update mushrooms
                game.mushrooms.forEach((mushroom) => {
                    mushroom.update(game.scrollSpeed);
                });

                // Check collisions
                const playerBounds = game.player?.getBounds();
                game.mushrooms.forEach((mushroom) => {
                    if (mushroom.collected) return;

                    const mushroomBounds = mushroom.getBounds();
                    if (checkCollision(playerBounds, mushroomBounds)) {
                        if (mushroom.isGreen) {
                            // Collect green mushroom
                            mushroom.collected = true;
                            game.score += CONFIG.GREEN_POINTS;
                            setScore(game.score);
                            createParticleBurst(mushroom.x + 20, mushroom.y + 25, '#00ff88', 20);
                            game.scorePopups.push(new ScorePopup(mushroom.x + 20, mushroom.y, CONFIG.GREEN_POINTS));
                        } else {
                            // Hit red mushroom - game over
                            game.state = 'GAMEOVER';
                            setGameState('GAMEOVER');
                            game.shakeAmount = 20;
                            createParticleBurst(game.player.x + 25, game.player.y + 30, '#ff4444', 30);
                            createParticleBurst(game.player.x + 25, game.player.y + 30, '#ffaa00', 20);
                            if (game.score > game.highScore) {
                                game.highScore = game.score;
                                setHighScore(game.score);
                            }
                        }
                    }
                });

                // Clean up off-screen mushrooms
                game.mushrooms = game.mushrooms.filter((m) => !m.isOffScreen() && !m.collected);

                // Create running dust
                if (!game.player?.isJumping && Math.random() < 0.3) {
                    game.particles.push(new Particle(
                        game.player.x + 20,
                        groundY - 5,
                        'rgba(200, 200, 200, 0.5)',
                        { x: -2, y: -1 },
                        30
                    ));
                }
            } else if (game.state === 'START' && game.player) {
                // Idle animation in start screen
                game.player.drawCharacter(ctx, game.player.x, game.player.y);
            }


            // Update and draw particles
            game.particles = game.particles.filter((p) => {
                p.update();
                p.draw(ctx);
                return !p.isDead();
            });

            // Update and draw score popups
            game.scorePopups = game.scorePopups.filter((p) => {
                p.update();
                p.draw(ctx);
                return !p.isDead();
            });

            // Draw mushrooms
            game.mushrooms.forEach((mushroom) => mushroom.draw(ctx));

            // Draw player
            if (game.state !== 'START') { // Already drew in idle block if start
                game.player?.draw(ctx);
            }

            // Draw UI
            ctx.save();

            // Score display
            ctx.font = 'bold 28px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#00ff88';
            ctx.fillText(`🍄 ${game.score}`, 20, 40);

            // High score
            if (game.highScore > 0) {
                ctx.font = '16px "Inter", sans-serif';
                ctx.fillStyle = '#888888';
                ctx.shadowBlur = 0;
                ctx.fillText(`Best: ${game.highScore}`, 20, 65);
            }

            // Speed indicator
            ctx.font = '14px "Inter", sans-serif';
            ctx.fillStyle = '#c79b37';
            ctx.textAlign = 'right';
            ctx.fillText(`Speed: ${game.scrollSpeed.toFixed(1)}x`, canvas.width - 20, 40);

            ctx.restore();

            // Draw state overlays
            if (game.state === 'START') {
                drawOverlay(ctx, canvas, 'MUSHROOM RUNNER', 'Press SPACE to Start', '#00ff88');
            } else if (game.state === 'GAMEOVER') {
                drawOverlay(ctx, canvas, 'GAME OVER', `Score: ${game.score} | Press SPACE to Retry`, '#ff4444');
            }

            ctx.restore();

            game.animationId = requestAnimationFrame(gameLoop);
        };

        game.animationId = requestAnimationFrame(gameLoop);

        return () => {
            if (game.animationId) cancelAnimationFrame(game.animationId);
            window.removeEventListener('keydown', handleInput);
            canvas.removeEventListener('touchstart', handleInput);
        };
    }, [initGame, createParticleBurst, spawnMushroom, width, height, isEditor]); // Re-run if dims change

    return (
        <div className="mushroom-game-container">
            <canvas
                ref={canvasRef}
                className="mushroom-game-canvas"
                style={{
                    display: 'block',
                    margin: '0 auto',
                    borderRadius: '12px',
                    boxShadow: '0 0 40px rgba(0, 143, 78, 0.3), inset 0 0 60px rgba(0, 0, 0, 0.5)',
                    border: '2px solid rgba(0, 143, 78, 0.4)',
                }}
            />
            <div className="game-controls-hint">
                <span>🎮 <strong>SPACE</strong> or <strong>TAP</strong> to jump</span>
            </div>
        </div>
    );
};

export default MushroomRunnerGame;
