import { create } from 'zustand';
import { Track } from '../types';

interface PlayerState {
  currentTrack: Track | null;
  queue: Track[];
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  isMinimized: boolean;
  playTrack: (track: Track) => void;
  pauseTrack: () => void;
  resumeTrack: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  addToQueue: (track: Track) => void;
  clearQueue: () => void;
  toggleMinimize: () => void;
}

const clampVolume = (value: number): number => Math.min(1, Math.max(0, value));

export const usePlayerStore = create<PlayerState>()((set, get) => ({
  currentTrack: null,
  queue: [],
  isPlaying: false,
  volume: 0.7,
  currentTime: 0,
  duration: 0,
  isMinimized: false,

  playTrack: (track) => {
    set((state) => {
      const existsInQueue = state.queue.some((queuedTrack) => queuedTrack._id === track._id);

      return {
        currentTrack: track,
        queue: existsInQueue ? state.queue : [track, ...state.queue],
        isPlaying: true,
      };
    });
  },

  pauseTrack: () => {
    set({ isPlaying: false });
  },

  resumeTrack: () => {
    set({ isPlaying: true });
  },

  nextTrack: () => {
    const { queue, currentTrack } = get();

    if (queue.length === 0) {
      return;
    }

    if (!currentTrack) {
      set({ currentTrack: queue[0], isPlaying: true });
      return;
    }

    const currentIndex = queue.findIndex((track) => track._id === currentTrack._id);
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const nextIndex = (safeCurrentIndex + 1) % queue.length;

    set({
      currentTrack: queue[nextIndex],
      isPlaying: true,
    });
  },

  previousTrack: () => {
    const { queue, currentTrack } = get();

    if (queue.length === 0) {
      return;
    }

    if (!currentTrack) {
      set({ currentTrack: queue[0], isPlaying: true });
      return;
    }

    const currentIndex = queue.findIndex((track) => track._id === currentTrack._id);
    const safeCurrentIndex = currentIndex >= 0 ? currentIndex : 0;
    const previousIndex = (safeCurrentIndex - 1 + queue.length) % queue.length;

    set({
      currentTrack: queue[previousIndex],
      isPlaying: true,
    });
  },

  setVolume: (volume) => {
    set({ volume: clampVolume(volume) });
  },

  setCurrentTime: (time) => {
    set({ currentTime: time });
  },

  setDuration: (duration) => {
    set({ duration });
  },

  addToQueue: (track) => {
    set((state) => {
      const existsInQueue = state.queue.some((queuedTrack) => queuedTrack._id === track._id);
      if (existsInQueue) {
        return state;
      }

      return {
        queue: [...state.queue, track],
      };
    });
  },

  clearQueue: () => {
    set({
      currentTrack: null,
      queue: [],
      isPlaying: false,
      currentTime: 0,
      duration: 0,
    });
  },

  toggleMinimize: () => {
    set((state) => ({ isMinimized: !state.isMinimized }));
  },
}));
