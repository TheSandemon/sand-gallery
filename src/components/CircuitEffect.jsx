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
            ctx.beginPath();
            ctx.strokeStyle = this.color;
            ctx.lineWidth = this.width;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;

            if (this.history.length > 0) {
                ctx.moveTo(this.history[0].x, this.history[0].y);
                for (let i = 1; i < this.history.length; i++) {
                    ctx.lineTo(this.history[i].x, this.history[i].y);
                }
            }

            ctx.stroke();
            ctx.shadowBlur = 0; // Reset shadow
        }
    }

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        const handleClick = (e) => {
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
