import React, { useEffect, useRef } from 'react';
import { cn } from '../../lib/utils';

export interface DitheringShaderProps {
  shape?: 'wave' | 'grid' | 'spiral';
  type?: '4x4' | '8x8';
  colorBack?: string;
  colorFront?: string;
  pxSize?: number;
  speed?: number;
  className?: string;
}

const bayer4x4 = [
  0, 8, 2, 10,
  12, 4, 14, 6,
  3, 11, 1, 9,
  15, 7, 13, 5
];

const bayer8x8 = [
  0, 48, 12, 60, 3, 51, 15, 63,
  32, 16, 44, 28, 35, 19, 47, 31,
  8, 56, 4, 52, 11, 59, 7, 55,
  40, 24, 36, 20, 43, 27, 39, 23,
  2, 50, 14, 62, 1, 49, 13, 61,
  34, 18, 46, 30, 33, 17, 45, 29,
  10, 58, 6, 54, 9, 57, 5, 53,
  42, 26, 38, 22, 41, 25, 37, 21
];

export const DitheringShader: React.FC<DitheringShaderProps> = ({
  shape = 'wave',
  type = '8x8',
  colorBack = '#F4F4F0',
  colorFront = '#A8A9AD',
  pxSize = 4,
  speed = 1,
  className
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const bayer = type === '8x8' ? bayer8x8 : bayer4x4;
    const bayerSize = type === '8x8' ? 8 : 4;
    const bayerMultiplier = type === '8x8' ? 1 / 64 : 1 / 16;
    
    const resize = () => {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
    };

    window.addEventListener('resize', resize);
    resize();

    const render = () => {
      time += 0.01 * speed;
      const { width, height } = canvas;
      
      const cols = Math.ceil(width / pxSize);
      const rows = Math.ceil(height / pxSize);
      
      ctx.fillStyle = colorBack;
      ctx.fillRect(0, 0, width, height);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          
          let value = 0;
          const nx = x / cols;
          const ny = y / rows;

          if (shape === 'wave') {
            value = (Math.sin(nx * 10 + time) + Math.cos(ny * 10 + time)) * 0.5 + 0.5;
          } else if (shape === 'spiral') {
            const dx = nx - 0.5;
            const dy = ny - 0.5;
            const angle = Math.atan2(dy, dx);
            const dist = Math.sqrt(dx * dx + dy * dy);
            value = (Math.sin(dist * 20 - time * 2 + angle * 4) + 1) * 0.5;
          } else {
            // grid
            value = (Math.sin(nx * 20 + time) * Math.sin(ny * 20 + time) + 1) * 0.5;
          }

          const threshold = bayer[(y % bayerSize) * bayerSize + (x % bayerSize)] * bayerMultiplier;

          if (value > threshold) {
            ctx.fillStyle = colorFront;
            ctx.fillRect(x * pxSize, y * pxSize, pxSize, pxSize);
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shape, type, colorBack, colorFront, pxSize, speed]);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};
