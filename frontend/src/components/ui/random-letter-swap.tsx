import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface RandomLetterSwapForwardProps {
  text: string;
  className?: string;
  speed?: number;
  trigger?: boolean;
}

interface RandomLetterSwapPingPongProps {
  text: string;
  className?: string;
  speed?: number;
}

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const getRandomChar = () => chars[Math.floor(Math.random() * chars.length)];

export const RandomLetterSwapForward: React.FC<RandomLetterSwapForwardProps> = ({
  text,
  className,
  speed = 50,
  trigger = true,
}) => {
  const [displayChars, setDisplayChars] = useState<string[]>(Array(text.length).fill(''));
  
  useEffect(() => {
    let timeouts: Array<ReturnType<typeof setTimeout>> = [];
    
    // reset
    setDisplayChars(text.split('').map(c => c === ' ' ? ' ' : getRandomChar()));

    text.split('').forEach((char, index) => {
      if (char === ' ') {
        setDisplayChars(prev => {
          const next = [...prev];
          next[index] = ' ';
          return next;
        });
        return;
      }

      // randomly change letter before settling
      const steps = 10 + Math.random() * 10;
      for (let i = 0; i < steps; i++) {
        const timeout = setTimeout(() => {
          setDisplayChars(prev => {
            const next = [...prev];
            next[index] = i === Math.floor(steps) - 1 ? char : getRandomChar();
            return next;
          });
        }, index * speed + (i * speed * 0.5));
        timeouts.push(timeout);
      }
    });

    return () => timeouts.forEach(clearTimeout);
  }, [text, speed, trigger]);

  return (
    <span className={cn("font-mono inline-flex", className)}>
      {displayChars.map((char, i) => (
        <span key={i} className="inline-block" style={{ width: char === ' ' ? '0.5em' : '1ch' }}>
          {char}
        </span>
      ))}
    </span>
  );
};

export const RandomLetterSwapPingPong: React.FC<RandomLetterSwapPingPongProps> = ({
  text,
  className,
  speed = 50,
}) => {
  const [displayChars, setDisplayChars] = useState<string[]>(text.split(''));

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const pingPong = () => {
      const charIndices = text.split('').map((c, i) => c !== ' ' ? i : -1).filter(i => i !== -1);
      if (charIndices.length === 0) return;
      
      const randomIndices = Array.from({ length: Math.max(1, Math.floor(charIndices.length * 0.1)) }, () => 
        charIndices[Math.floor(Math.random() * charIndices.length)]
      );

      // swap to random
      setDisplayChars(prev => {
        const next = [...prev];
        randomIndices.forEach(i => { next[i] = getRandomChar(); });
        return next;
      });

      // swap back
      setTimeout(() => {
        setDisplayChars(prev => {
          const next = [...prev];
          randomIndices.forEach(i => { next[i] = text[i]; });
          return next;
        });
      }, speed * 2);
    };

    interval = setInterval(pingPong, speed * 20);

    return () => clearInterval(interval);
  }, [text, speed]);

  return (
    <span className={cn("font-mono inline-flex", className)}>
      {displayChars.map((char, i) => (
        <span key={i} className="inline-block" style={{ width: char === ' ' ? '0.5em' : '1ch' }}>
          {char}
        </span>
      ))}
    </span>
  );
};
