import {DefaultTheme} from 'react-native-paper';

export const colors = {
  white: '#fff',
  black: '#000',
  primary: '#003896',
  red: 'rgb(252, 97, 97)',
  secondary: 'whitesmoke',
};

export const reactNativePaperTheme = {
  ...DefaultTheme,
  roundness: 8,
  colors: {
    ...DefaultTheme.colors,
    accent: colors.white,
    primary: colors.primary,
  },
};
