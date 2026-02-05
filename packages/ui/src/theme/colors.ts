export const colors = {
  // Solid colors
  primary: '#4f685b',
  primaryLight: '#83b59c',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Text
  text: {
    primary: '#333333',
    secondary: '#666666',
    muted: '#999999',
    light: '#FFFFFF',
    lightMuted: 'rgba(255, 255, 255, 0.7)',
  },

  // Backgrounds
  background: {
    card: '#FFFFFF',
    cardHover: '#F9F9F9',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Borders
  border: {
    light: '#EEEEEE',
    medium: '#DDDDDD',
    onDark: 'rgba(255, 255, 255, 0.3)',
  },

  // States
  error: '#E53935',
  success: '#43A047',
  warning: '#FB8C00',

  // Selection
  selected: {
    background: 'rgba(79, 104, 91, 0.1)',
    border: '#4f685b',
  },
} as const;
