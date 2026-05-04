import { useEffect, useMemo, useRef, type MouseEvent } from 'react';
import { ChevronDown, Pause, Play, SkipBack, SkipForward, Volume2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { usePlayer } from '../../hooks/usePlayer';

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function AudioPlayer() {
  const {
    currentTrack,
    hasTrack,
    isPlaying,
    volume,
    currentTime,
    duration,
    isMinimized,
    pauseTrack,
    resumeTrack,
    previousTrack,
    nextTrack,
    setVolume,
    setCurrentTime,
    setDuration,
    toggleMinimize,
    progress,
  } = usePlayer();
  const { user } = useAuth();

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressTrackRef = useRef<HTMLDivElement>(null);

  const audioSrc = useMemo(() => {
    if (!currentTrack) {
      return '';
    }

    const artistId = typeof currentTrack.artistId === 'string'
      ? currentTrack.artistId
      : currentTrack.artistId._id;
    const ownsTrack = Boolean(
      user && (user.purchasedTracks.includes(currentTrack._id) || user._id === artistId)
    );

    return ownsTrack ? currentTrack.audioUrlHigh : currentTrack.audioUrlPreview;
  }, [currentTrack, user]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) {
      return;
    }

    audio.src = audioSrc;
    audio.load();

    if (isPlaying) {
      void audio.play().catch(() => {
        pauseTrack();
      });
    }
  }, [audioSrc, isPlaying, pauseTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    if (isPlaying) {
      void audio.play().catch(() => {
        pauseTrack();
      });
      return;
    }

    audio.pause();
  }, [isPlaying, pauseTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.volume = volume;
  }, [volume]);

  if (!hasTrack || !currentTrack) {
    return null;
  }

  const handleProgressSeek = (event: MouseEvent<HTMLDivElement>) => {
    const container = progressTrackRef.current;
    const audio = audioRef.current;
    if (!container || !audio || duration <= 0) {
      return;
    }

    const bounds = container.getBoundingClientRect();
    const relativeX = event.clientX - bounds.left;
    const percentage = Math.min(1, Math.max(0, relativeX / bounds.width));
    const nextTime = percentage * duration;

    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      pauseTrack();
      return;
    }

    resumeTrack();
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 border-t border-[#E0E0D8] bg-white shadow-lg h-16 md:h-20 ${isMinimized ? 'translate-y-9 md:translate-y-10' : 'translate-y-0'} transition-transform`}
    >
      <audio
        ref={audioRef}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
          }
        }}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setDuration(audioRef.current.duration);
          }
        }}
        onEnded={nextTrack}
      />

      <div className="mx-auto flex h-full max-w-7xl items-center gap-3 px-3 md:gap-6 md:px-6">
        <div className="min-w-0 flex shrink-0 items-center gap-3 md:w-64">
          <img
            src={currentTrack.coverArt}
            alt={currentTrack.title}
            className="h-12 w-12 rounded object-cover"
          />
          <div className="min-w-0 hidden sm:block">
            <p className="truncate text-sm font-medium text-[#1A1A1A]">{currentTrack.title}</p>
            <p className="truncate text-xs text-[#666660]">
              {typeof currentTrack.artistId === 'string' ? 'Unknown Artist' : currentTrack.artistId.username}
            </p>
          </div>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-1 md:max-w-2xl">
          <div className="flex items-center gap-4 text-[#33332E]">
            <button type="button" onClick={previousTrack} aria-label="Previous track">
              <SkipBack size={18} />
            </button>
            <button
              type="button"
              onClick={handlePlayPause}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              className="rounded-full border border-[#D2D2CA] p-2"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button type="button" onClick={nextTrack} aria-label="Next track">
              <SkipForward size={18} />
            </button>
          </div>

          <div className="flex w-full items-center gap-2">
            <span className="w-10 text-[10px] text-[#666660] md:text-xs">{formatTime(currentTime)}</span>
            <div
              ref={progressTrackRef}
              className="h-1.5 flex-1 cursor-pointer rounded-full bg-[#E0E0D8]"
              onClick={handleProgressSeek}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={duration || 0}
              aria-valuenow={currentTime}
            >
              <div
                className="h-full rounded-full bg-[#1DA0C3]"
                style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
              />
            </div>
            <span className="w-10 text-right text-[10px] text-[#666660] md:text-xs">{formatTime(duration)}</span>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <Volume2 size={16} className="text-[#666660]" />
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
            className="w-20 accent-[#1DA0C3]"
            aria-label="Volume"
          />
          <button
            type="button"
            onClick={toggleMinimize}
            aria-label="Minimize audio player"
            className="rounded p-1 text-[#666660] hover:bg-[#F5F5F2]"
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
