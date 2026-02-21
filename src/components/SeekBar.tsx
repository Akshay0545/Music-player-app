import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTheme } from '@/context/ThemeContext';

interface SeekBarProps {
  position: number;
  duration: number;
  onSeek: (seconds: number) => void;
  disabled?: boolean;
}

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

export function SeekBar({ position, duration, onSeek, disabled }: SeekBarProps) {
  const { colors } = useTheme();
  const safeDuration = duration > 0 ? duration : 1;

  const [slidingValue, setSlidingValue] = useState<number | null>(null);
  const displayValue = slidingValue !== null ? slidingValue : position;

  useEffect(() => {
    if (position === 0) setSlidingValue(null);
  }, [position]);

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
          setSlidingValue(null);
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
