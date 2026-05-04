import React from 'react';
import { Track } from '../../types';
import { TrackCard } from './TrackCard';
import { usePlayer } from '../../hooks/usePlayer';

interface TrackListProps {
  tracks: Track[];
  loading?: boolean;
  emptyMessage?: string;
}

export const TrackList: React.FC<TrackListProps> = ({ tracks, loading, emptyMessage }) => {
  const { playTrack } = usePlayer();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse bg-[#E0E0D8] rounded-lg aspect-[3/4]" />
        ))}
      </div>
    );
  }

  if (tracks.length === 0) {
    return (
      <div className="py-12 text-center text-[#666660]">
        {emptyMessage || 'No tracks found'}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {tracks.map((track) => (
        <TrackCard key={track._id} track={track} onPlay={playTrack} />
      ))}
    </div>
  );
};
