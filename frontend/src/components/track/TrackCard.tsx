import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Track } from '../../types';
import { PlayingCard } from '../ui/playing-card';
import { usePlayer } from '../../hooks/usePlayer';

interface TrackCardProps {
  track: Track;
  onPlay?: (track: Track) => void;
}

export const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay }) => {
  const navigate = useNavigate();
  const { playTrack } = usePlayer();

  const handlePlay = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (onPlay) {
      onPlay(track);
    } else {
      playTrack(track); // Assuming store playTrack handles this
    }
  };

  const handleClick = () => {
    navigate(`/track/${track._id}`);
  };

  const artistName = typeof track.artistId === 'object' && track.artistId !== null 
    ? (track.artistId as any).username || 'Artist' 
    : 'Artist';

  return (
    <div onClick={handleClick} className="cursor-pointer h-full">
      <PlayingCard
        coverArt={track.coverArt || ''}
        title={track.title}
        artistName={artistName}
        genre={track.genre}
        duration={track.duration}
        price={track.price}
        onPlay={handlePlay}
      />
    </div>
  );
};
