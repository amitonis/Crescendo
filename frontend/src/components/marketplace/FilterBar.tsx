import React from 'react';
import { Search, Music, Smile, ArrowUpDown, DollarSign } from 'lucide-react';
import { ExpandableTabs } from '../ui/expandable-tabs';

export interface FilterState {
  genre: string;
  mood: string;
  priceRange: string;
  sort: string;
  search: string;
}

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({ filters, onFilterChange }) => {
  const genres = [
    { id: 'all', label: 'All', icon: <Music size={14} /> },
    { id: 'lo-fi', label: 'Lo-Fi', icon: <Music size={14} /> },
    { id: 'hip-hop', label: 'Hip-Hop', icon: <Music size={14} /> },
    { id: 'electronic', label: 'Electronic', icon: <Music size={14} /> },
    { id: 'jazz', label: 'Jazz', icon: <Music size={14} /> },
    { id: 'rock', label: 'Rock', icon: <Music size={14} /> },
    { id: 'pop', label: 'Pop', icon: <Music size={14} /> },
    { id: 'classical', label: 'Classical', icon: <Music size={14} /> },
    { id: 'ambient', label: 'Ambient', icon: <Music size={14} /> },
  ];

  const activeGenreTab = filters.genre?.toLowerCase() || 'all';

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-[#999990]" />
        </div>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
          placeholder="Search tracks, artists, genres..."
          className="block w-full pl-10 pr-3 py-2 border border-[#E0E0D8] rounded-lg leading-5 bg-white placeholder-[#999990] focus:outline-none focus:ring-1 focus:ring-[#1DA0C3] focus:border-[#1DA0C3] sm:text-sm"
        />
      </div>

      {/* Genres */}
      <div>
        <ExpandableTabs
          tabs={genres}
          activeTab={activeGenreTab}
          onTabChange={(tabId) => onFilterChange({ ...filters, genre: tabId === 'all' ? 'All' : tabId })}
          className="justify-start border-[#E0E0D8]"
        />
      </div>

      {/* Other Filters */}
      <div className="flex flex-wrap gap-4 pt-2">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-[#666660] mb-1 flex items-center gap-1">
            <Smile size={14} /> Mood
          </label>
          <select
            value={filters.mood}
            onChange={(e) => onFilterChange({ ...filters, mood: e.target.value })}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1DA0C3] focus:border-[#1DA0C3] sm:text-sm rounded-md border border-[#E0E0D8]"
          >
            <option>All</option>
            <option>Chill</option>
            <option>Energetic</option>
            <option>Sad</option>
            <option>Happy</option>
            <option>Dark</option>
            <option>Romantic</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-[#666660] mb-1 flex items-center gap-1">
            <ArrowUpDown size={14} /> Sort
          </label>
          <select
            value={filters.sort}
            onChange={(e) => onFilterChange({ ...filters, sort: e.target.value })}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1DA0C3] focus:border-[#1DA0C3] sm:text-sm rounded-md border border-[#E0E0D8]"
          >
            <option>Newest</option>
            <option>Most Popular</option>
            <option>Price: Low-High</option>
            <option>Price: High-Low</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs font-medium text-[#666660] mb-1 flex items-center gap-1">
            <DollarSign size={14} /> Price
          </label>
          <select
            value={filters.priceRange}
            onChange={(e) => onFilterChange({ ...filters, priceRange: e.target.value })}
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-[#1DA0C3] focus:border-[#1DA0C3] sm:text-sm rounded-md border border-[#E0E0D8]"
          >
            <option>All</option>
            <option>Free</option>
            <option>Under $5</option>
            <option>$5-$10</option>
            <option>Over $10</option>
          </select>
        </div>
      </div>
    </div>
  );
};
