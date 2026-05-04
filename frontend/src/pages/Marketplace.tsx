import { useState, useEffect } from 'react';
import api from '../services/api';
import { Track } from '../types';
import { FilterBar, FilterState } from '../components/marketplace/FilterBar';
import { TrackList } from '../components/track/TrackList';

export default function Marketplace() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<FilterState>({
    genre: 'all',
    mood: 'all',
    priceRange: 'all',
    sort: 'newest',
    search: ''
  });
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(filters.search);
      setPage(1); // Reset page on search change
    }, 300);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Handle other filter changes causing page reset
  useEffect(() => {
    setPage(1);
  }, [filters.genre, filters.mood, filters.priceRange, filters.sort]);

  useEffect(() => {
    const fetchTracks = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', '12');

        if (filters.genre && filters.genre !== 'all') params.append('genre', filters.genre);
        if (filters.mood && filters.mood !== 'all') params.append('mood', filters.mood);
        if (filters.sort && filters.sort !== 'all') params.append('sort', filters.sort);
        if (debouncedSearch) params.append('search', debouncedSearch);

        if (filters.priceRange && filters.priceRange !== 'all') {
          if (filters.priceRange === 'free') {
            params.append('minPrice', '0');
            params.append('maxPrice', '0');
          } else if (filters.priceRange === 'under5') {
            params.append('maxPrice', '5');
          } else if (filters.priceRange === '5to10') {
            params.append('minPrice', '5');
            params.append('maxPrice', '10');
          } else if (filters.priceRange === 'over10') {
            params.append('minPrice', '10');
          }
        }

        const res = await api.get(`/tracks?${params.toString()}`);
        setTracks(res.data.data?.tracks || res.data.tracks || []);
        setTotalPages(res.data.data?.totalPages || res.data.totalPages || 1);
      } catch (err) {
        console.error('Failed to load tracks:', err);
        setError('Failed to load tracks. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, [page, filters.genre, filters.mood, filters.priceRange, filters.sort, debouncedSearch]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">Marketplace</h1>
      
      <div className="mb-8">
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : (
        <>
          <TrackList tracks={tracks} loading={loading} />
          
          {totalPages > 1 && (
            <div className="mt-12 flex items-center justify-center gap-4">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                className="border border-[#E0E0D8] rounded px-4 py-2 hover:bg-[#F4F4F0] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A1A1A] transition-colors"
              >
                Previous
              </button>
              <span className="text-[#666660]">
                Page {page} of {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                className="border border-[#E0E0D8] rounded px-4 py-2 hover:bg-[#F4F4F0] disabled:opacity-50 disabled:cursor-not-allowed text-[#1A1A1A] transition-colors"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
