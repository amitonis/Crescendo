import React, { useEffect, useRef, useState } from 'react';
import WaveSurfer from 'wavesurfer.js';
import { Play, Pause } from 'lucide-react';
import { cn } from '../../lib/utils';

interface WaveformPlayerProps {
  audioUrl: string;
  waveformData?: number[];
  onPlay?: () => void;
  onPause?: () => void;
  className?: string;
}

export const WaveformPlayer: React.FC<WaveformPlayerProps> = ({
  audioUrl,
  waveformData,
  onPlay,
  onPause,
  className
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    if (!containerRef.current) return;

    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: '#D4D5D9',
      progressColor: '#1DA0C3',
      cursorColor: '#1DA0C3',
      barWidth: 3,
      barRadius: 3,
      barGap: 2,
      height: 80,
    });

    wavesurferRef.current = ws;

    ws.on('ready', () => {
      setDuration(ws.getDuration());
    });

    ws.on('audioprocess', () => {
      setCurrentTime(ws.getCurrentTime());
    });

    ws.on('play', () => {
      setIsPlaying(true);
      onPlay?.();
    });

    ws.on('pause', () => {
      setIsPlaying(false);
      onPause?.();
    });

    if (waveformData && waveformData.length > 0) {
        // Handle waveform data if supported by the version of wavesurfer
    }
    
    ws.load(audioUrl);

    return () => {
      ws.destroy();
    };
  }, [audioUrl, waveformData, onPlay, onPause]);

  const togglePlay = () => {
    if (wavesurferRef.current) {
      wavesurferRef.current.playPause();
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className={cn('flex flex-col gap-4 w-full', className)}>
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlay}
          className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-[#1DA0C3] text-white rounded-full hover:bg-[#1589A8] transition-colors"
        >
          {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" className="ml-1" />}
        </button>
        <div className="flex-grow w-full" ref={containerRef} />
      </div>
      <div className="flex justify-between text-xs text-[#666660]">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  );
};
