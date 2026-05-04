import React, { useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { cn } from '../../lib/utils'; // Keep the relative path for utility

export interface PlayingCardProps {
  coverArt: string;
  title: string;
  artistName: string;
  genre?: string;
  duration?: number;
  price?: number;
  onPlay?: () => void;
  onClick?: () => void;
  className?: string;
}

export const PlayingCard: React.FC<PlayingCardProps> = ({
  coverArt,
  title,
  artistName,
  genre,
  duration,
  price,
  onPlay,
  onClick,
  className
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("perspective-1000 w-full aspect-[3/4]", className)}>
      <motion.div
        className="w-full h-full relative preserve-3d cursor-pointer rounded-lg shadow-lg border border-[#E0E0D8] bg-white"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front Face */}
        <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden">
          <img src={coverArt} alt={title} className="w-full h-full object-cover" />
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
            <h3 
              className="text-white font-bold text-lg truncate hover:underline"
              onClick={(e) => {
                e.stopPropagation();
                onClick && onClick();
              }}
            >
              {title}
            </h3>
            <p className="text-gray-200 text-sm truncate">{artistName}</p>
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 backface-hidden rounded-lg overflow-hidden bg-white p-6 rotate-y-180 flex flex-col justify-between items-center text-center pb-8 border border-[#E0E0D8]">
          <div className="space-y-4 w-full">
            <h3 className="font-bold text-xl text-gray-900 line-clamp-2">{title}</h3>
            <p className="text-gray-600">{artistName}</p>
            
            {genre && (
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                {genre}
              </span>
            )}
            
            <div className="flex justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
              {duration !== undefined && <span>{formatDuration(duration)}</span>}
              {price !== undefined && <span className="font-medium text-[#1DA0C3]">${price.toFixed(2)}</span>}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onPlay && onPlay();
            }}
            className="w-full py-2 px-4 bg-[#1DA0C3] hover:bg-[#1587a6] text-white rounded-md transition-colors"
          >
            Play Preview
          </button>
        </div>
      </motion.div>
    </div>
  );
};
