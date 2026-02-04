import React, { useRef, useEffect } from 'react';

const CircuitEffect = () => {
    const canvasRef = useRef(null);
    const sparks = useRef([]);

    class Spark {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            this.history = [{ x, y }];
            this.angle = Math.floor(Math.random() * 4) * (Math.PI / 2); // 0, 90, 180, 270
            this.speed = 5 + Math.random() * 10;
            this.life = 100;
            this.width = 2;
        }

        update() {
            this.life -= 2;

            // Chance to turn 90 degrees
            if (Math.random() < 0.1) {
                this.angle += (Math.random() < 0.5 ? -1 : 1) * (Math.PI / 2);
            }

            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            this.history.push({ x: this.x, y: this.y });

            // Limit history length for performance
            if (this.history.length > 20) {
                this.history.shift();
            }
        }

        draw(ctx) {
            if (this.history.length < 2) return;

            ctx.lineWidth = this.width;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            for (let i = 0; i < this.history.length - 1; i++) {
                const point = this.history[i];
                const nextPoint = this.history[i + 1];

                const opacity = (this.life / 100) * (i / this.history.length);

                ctx.beginPath();
                ctx.moveTo(point.x, point.y);
                ctx.lineTo(nextPoint.x, nextPoint.y);
                ctx.globalAlpha = opacity;
                ctx.strokeStyle = this.color;
                ctx.stroke();
            }
            ctx.globalAlpha = 1.0; // Reset
            ctx.shadowBlur = 0;
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let lastClickTime = 0;
        let animationFrameId;
        let lastTime = 0; // For delta time

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const handleClick = (e) => {
            const now = Date.now();
            if (now - lastClickTime < 500) return; // Reduced throttle to 500ms

            // Improved input capture check
            // Check if target is interactive or inside interactive element
            const interactiveSelectors = 'button, a, input, textarea, select, label, [role="button"], video, audio';
            if (e.target.closest(interactiveSelectors)) return;

            lastClickTime = now;

            const colors = ['#008f4e', '#c79b37', '#ffffff'];
            // Create a batch of sparks at click position
            for (let i = 0; i < 8; i++) {
                sparks.current.push(new Spark(
                    e.clientX,
                    e.clientY,
                    colors[Math.floor(Math.random() * colors.length)]
                ));
            }
        };

        window.addEventListener('click', handleClick);

        const animate = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const deltaTime = timestamp - lastTime;
            lastTime = timestamp;

            // Normalize speed based on 60fps (approx 16.6ms per frame)
            // If deltaTime is 33ms (30fps), factor is 2.0x
            const timeFactor = deltaTime / 16.66;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw sparks
            for (let i = sparks.current.length - 1; i >= 0; i--) {
                const spark = sparks.current[i];

                // Update spark with timeFactor
                spark.life -= 2 * timeFactor;

                if (Math.random() < 0.1 * timeFactor) {
                    spark.angle += (Math.random() < 0.5 ? -1 : 1) * (Math.PI / 2);
                }

                spark.x += Math.cos(spark.angle) * spark.speed * timeFactor;
                spark.y += Math.sin(spark.angle) * spark.speed * timeFactor;

                spark.history.push({ x: spark.x, y: spark.y });
                if (spark.history.length > 20) spark.history.shift();

                spark.draw(ctx);

                if (spark.life <= 0) {
                    sparks.current.splice(i, 1);
                }
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0, // Behind UI (which usually has default auto, or specific index)
            }}
        />
    );
};

export default CircuitEffect;
