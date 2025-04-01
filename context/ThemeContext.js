import { createContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';
import { Colors } from '../constants/Colors';

export const ThemeContext = createContext({});

export const ThemeProvider = ({ children }) => {
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setColorScheme(colorScheme);
    });

    return () => subscription.remove();
  }, []);

  const toggleColorScheme = () => {
    setColorScheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = colorScheme === 'dark' ? Colors.dark : Colors.light;

  return (
    <ThemeContext.Provider value={{ colorScheme, setColorScheme: toggleColorScheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
