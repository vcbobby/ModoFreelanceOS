import React from 'react';
import { Provider } from 'react-redux';
import { ThemeProvider } from './ThemeContext';
import { store } from '@/app/store';

export const AppProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider>
    <Provider store={store}>{children}</Provider>
  </ThemeProvider>
);

export { ThemeProvider };
