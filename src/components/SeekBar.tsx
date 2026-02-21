import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/context/ThemeContext';

interface SeekBarProps {
  position: number;
  duration: number;
  onSeek: (seconds: number) => void;
  disabled?: boolean;
}

const SEEK_CATCH_UP_TOLERANCE = 0.5;
const STICKY_SEEK_MS = 800;
const LARGE_JUMP_SEC = 2;

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function SeekBar({ position, duration, onSeek, disabled }: SeekBarProps) {
  const { colors } = useTheme();
  const safeDuration = duration > 0 ? duration : 1;

  const [slidingValue, setSlidingValue] = useState<number | null>(null);
  const [stickyValue, setStickyValue] = useState<number | null>(null);
  const prevPositionRef = useRef(position);
  const stickyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const displayValue = slidingValue !== null ? slidingValue : stickyValue !== null ? stickyValue : position;

  useEffect(() => {
    if (position === 0) {
      setSlidingValue(null);
      setStickyValue(null);
      prevPositionRef.current = 0;
      if (stickyTimeoutRef.current) clearTimeout(stickyTimeoutRef.current);
    }
  }, [position]);

  useEffect(() => {
    const jump = Math.abs(position - prevPositionRef.current);
    prevPositionRef.current = position;
    if (jump >= LARGE_JUMP_SEC && slidingValue === null && position > 0) {
      setStickyValue(position);
      if (stickyTimeoutRef.current) clearTimeout(stickyTimeoutRef.current);
      stickyTimeoutRef.current = setTimeout(() => setStickyValue(null), STICKY_SEEK_MS);
    }
  }, [position, slidingValue]);

  useEffect(() => {
    return () => {
      if (stickyTimeoutRef.current) clearTimeout(stickyTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (slidingValue !== null && Math.abs(position - slidingValue) < SEEK_CATCH_UP_TOLERANCE) {
      setSlidingValue(null);
    }
    if (stickyValue !== null && Math.abs(position - stickyValue) < SEEK_CATCH_UP_TOLERANCE) {
      setStickyValue(null);
    }
  }, [position, slidingValue, stickyValue]);

  return (
    <View style={styles.container}>
      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={safeDuration}
        value={displayValue}
        onSlidingStart={() => setSlidingValue(position)}
        onValueChange={(v) => setSlidingValue(v)}
        onSlidingComplete={(v) => {
          onSeek(v);
          setSlidingValue(v);
          setStickyValue(v);
          if (stickyTimeoutRef.current) clearTimeout(stickyTimeoutRef.current);
          stickyTimeoutRef.current = setTimeout(() => setStickyValue(null), STICKY_SEEK_MS);
        }}
        minimumTrackTintColor={colors.progressFill}
        maximumTrackTintColor={colors.progressTrack}
        thumbTintColor={colors.progressFill}
        disabled={disabled}
      />
      <View style={styles.labels}>
        <Text style={[styles.time, { color: colors.primaryText }]}>{formatTime(displayValue)}</Text>
        <Text style={[styles.time, { color: colors.primaryText }]}>{formatTime(duration)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', marginTop: 16 },
  slider: { width: '100%', height: 40 },
  labels: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  time: { fontSize: 12 },
});
