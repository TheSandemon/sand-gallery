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

            // Fade visual: Draw segments with decreasing opacity from head to tail? or fading the whole thing?
            // "Fade over time from front to back" -> Let's interpret as the 'front' (newest point) stays bright, back fades? 
            // OR maybe the user wants the electricity to "travel" and leave a gap?
            // "lines fade over time from front to back" -> Visualizing a lightning strike that disappears starting from where it hit.
            // So the *oldest* points (tail) remain visible longer? That's inverted logic.
            // Let's stick to a standard electric trail where opacity is mapped to history index, 
            // but modulated by 'life'.

            for (let i = 0; i < this.history.length - 1; i++) {
                const point = this.history[i];
                const nextPoint = this.history[i + 1];

                // Calculate opacity: 
                // i=0 is tail (oldest), i=length is head (newest).
                // "Fade front to back" might mean newest fades first?? 
                // I will make the whole line fade with life, but the tail is naturally thinner.
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
        let lastClickTime = 0; // Throttling tracker

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const handleClick = (e) => {
            const now = Date.now();
            if (now - lastClickTime < 1000) return; // 1s Limit

            // Skip if clicking on an interactive element
            const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'LABEL'];
            const isInteractive = interactiveTags.includes(e.target.tagName) ||
                e.target.closest('button, a, input, textarea, select, label, [role="button"]');
            if (isInteractive) return;

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

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw sparks
            for (let i = sparks.current.length - 1; i >= 0; i--) {
                const spark = sparks.current[i];
                spark.update();
                spark.draw(ctx);

                if (spark.life <= 0) {
                    sparks.current.splice(i, 1);
                }
            }

            requestAnimationFrame(animate);
        };

        const animationId = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('click', handleClick);
            cancelAnimationFrame(animationId);
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
                zIndex: 9999,
            }}
        />
    );
};

export default CircuitEffect;
