import React from 'react';
import { Link } from 'react-router-dom';
import { User } from '../../types';

interface ArtistCardProps {
  artist: User;
  trackCount?: number;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist, trackCount }) => {
  return (
    <Link to={`/artist/${artist._id}`} className="block">
      <div className="bg-white border border-[#E0E0D8] rounded-lg p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
        <div className="w-16 h-16 rounded-full flex-shrink-0 bg-[#F4F4F0] overflow-hidden flex items-center justify-center border border-[#E0E0D8]">
          {artist.avatar ? (
            <img src={artist.avatar} alt={artist.username} className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl text-[#6B6C70] font-medium uppercase">
              {artist.username.charAt(0)}
            </span>
          )}
        </div>
        
        <div className="flex-grow">
          <h3 className="font-medium text-[#1A1A1A] text-lg">{artist.username}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-0.5 bg-[#F4F4F0] text-[#6B6C70] text-xs font-medium rounded-full border border-[#E0E0D8]">
              Artist
            </span>
            {trackCount !== undefined && (
              <span className="text-[#666660] text-sm">
                {trackCount} track{trackCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};
