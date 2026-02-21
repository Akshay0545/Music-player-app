/**
 * Mume app colors – light and dark mode (Figma reference)
 */

export const light = {
  background: '#FFFFFF',
  backgroundSecondary: '#F8F8F8',
  primaryText: '#000000',
  secondaryText: '#666666',
  tertiaryText: '#888888',
  accent: '#FF8C00',
  accentLight: '#FFE4CC',
  border: '#E5E5E5',
  card: '#FFFFFF',
  tabInactive: '#888888',
  playButton: '#FF8C00',
  progressTrack: '#E5E5E5',
  progressFill: '#FF8C00',
  modalHandle: '#CCCCCC',
} as const;

export const dark = {
  background: '#1A1A1A',
  backgroundSecondary: '#252525',
  primaryText: '#FFFFFF',
  secondaryText: '#AAAAAA',
  tertiaryText: '#888888',
  accent: '#FF8C00',
  accentLight: '#663300',
  border: '#333333',
  card: '#252525',
  tabInactive: '#888888',
  playButton: '#FF8C00',
  progressTrack: '#444444',
  progressFill: '#FF8C00',
  modalHandle: '#666666',
} as const;

export type ThemeColors = typeof light;
