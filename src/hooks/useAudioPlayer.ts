import { useEffect, useRef, useCallback } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { usePlayerStore } from '@/store/playerStore';

let audioModeSet = false;

async function ensureAudioMode() {
  if (audioModeSet) return;
  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    staysActiveInBackground: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
    interruptionModeIOS: 2,
    interruptionModeAndroid: 2,
  });
  audioModeSet = true;
}

export function useAudioPlayer() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const lastPositionUpdate = useRef(0);
  const loadIdRef = useRef(0);
  const POSITION_UPDATE_INTERVAL_MS = 150;

  const queue = usePlayerStore((s) => s.queue);
  const currentIndex = usePlayerStore((s) => s.currentIndex);
  const isPlaying = usePlayerStore((s) => s.isPlaying);
  const goToIndex = usePlayerStore((s) => s.goToIndex);
  const setPlaying = usePlayerStore((s) => s.setPlaying);
  const setPosition = usePlayerStore((s) => s.setPosition);
  const setDuration = usePlayerStore((s) => s.setDuration);
  const getNextIndex = usePlayerStore((s) => s.getNextIndex);
  const getPrevIndex = usePlayerStore((s) => s.getPrevIndex);
  const repeatMode = usePlayerStore((s) => s.repeatMode);

  const currentTrack = queue[currentIndex];
  const uri = currentTrack?.localUri ?? currentTrack?.streamUrl;

  const onStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;
      const now = Date.now();
      const posSec = status.positionMillis / 1000;
      if (now - lastPositionUpdate.current >= POSITION_UPDATE_INTERVAL_MS) {
        lastPositionUpdate.current = now;
        setPosition(posSec);
      }
      if (status.durationMillis != null) setDuration(status.durationMillis / 1000);
      if (status.didJustFinish && !status.isLooping) {
        const state = usePlayerStore.getState();
        const next = state.getNextIndex();
        const idx = state.currentIndex;
        const repeat = state.repeatMode;
        if (next !== idx) {
          goToIndex(next);
          setPlaying(true);
        } else if (repeat === 'one') {
          setPosition(0);
          if (soundRef.current) {
            soundRef.current.setPositionAsync(0).then(() => setPlaying(true));
          } else {
            setPlaying(true);
          }
        } else {
          setPlaying(false);
        }
      }
    },
    [setPosition, setDuration, goToIndex, setPlaying]
  );

  const loadAndPlay = useCallback(
    async (url: string, shouldPlay: boolean, loadId: number) => {
      if (!url) return;
      await ensureAudioMode();

      const previousSound = soundRef.current;
      soundRef.current = null;
      if (previousSound) {
        try {
          await previousSound.unloadAsync();
        } catch (_) {}
      }

      try {
        const { sound } = await Audio.Sound.createAsync(
          { uri: url },
          { shouldPlay: false },
          onStatusUpdate
        );

        if (loadIdRef.current !== loadId) {
          try {
            await sound.unloadAsync();
          } catch (_) {}
          return;
        }

        soundRef.current = sound;
        setPosition(0);
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.durationMillis != null) {
          setDuration(status.durationMillis / 1000);
        }
        if (shouldPlay) await sound.playAsync();
      } catch (e) {
        if (loadIdRef.current === loadId) {
          setPlaying(false);
        }
        console.warn('Audio load error', e);
      }
    },
    [onStatusUpdate, setPosition, setDuration, setPlaying]
  );

  useEffect(() => {
    if (!uri) {
      const prev = soundRef.current;
      soundRef.current = null;
      if (prev) {
        prev.unloadAsync().catch(() => {});
      }
      setPosition(0);
      setDuration(0);
      setPlaying(false);
      return;
    }

    setPosition(0);
    setDuration(0);
    const loadId = ++loadIdRef.current;
    loadAndPlay(uri, isPlaying, loadId);

    return () => {
      loadIdRef.current += 1;
      const s = soundRef.current;
      soundRef.current = null;
      if (s) {
        s.unloadAsync().catch(() => {});
      }
    };
  }, [uri, currentIndex]);

  useEffect(() => {
    const s = soundRef.current;
    if (!s) return;
    if (isPlaying) s.playAsync();
    else s.pauseAsync();
  }, [isPlaying]);

  const play = useCallback(() => setPlaying(true), [setPlaying]);
  const pause = useCallback(() => setPlaying(false), [setPlaying]);
  const seekTo = useCallback(
    async (seconds: number) => {
      setPosition(seconds);
      lastPositionUpdate.current = Date.now();
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(seconds * 1000);
      }
    },
    [setPosition]
  );
  const next = useCallback(() => {
    const nextIdx = getNextIndex();
    if (nextIdx !== currentIndex) goToIndex(nextIdx);
  }, [getNextIndex, goToIndex, currentIndex]);
  const prev = useCallback(() => {
    const prevIdx = getPrevIndex();
    goToIndex(prevIdx);
  }, [getPrevIndex, goToIndex]);

  return { play, pause, seekTo, next, prev };
}
