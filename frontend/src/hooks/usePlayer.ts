import { usePlayerStore } from '../store/usePlayerStore';

export function usePlayer() {
  const player = usePlayerStore();

  const hasTrack = player.currentTrack !== null;
  const progress = player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

  return {
    ...player,
    hasTrack,
    progress,
  };
}
