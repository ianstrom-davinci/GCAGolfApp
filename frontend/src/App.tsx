// File: frontend/src/App.tsx
// -------------------------
import React, { useState } from 'react';
import { MantineProvider, createTheme, Text } from '@mantine/core';
import { AppLayout } from './components/Layout/AppLayout';
import { TournamentSystemPage } from './components/Tournament/TournamentSystemPage';

// Custom theme
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  colors: {
    dark: [
      '#d5d7e0',
      '#acaebf',
      '#8c8fa3',
      '#666980',
      '#4d4f66',
      '#34354a',
      '#2b2c3d',
      '#1d1e30',
      '#0c0d21',
      '#01010a',
    ],
  },
});

function App() {
  const [activeTab, setActiveTab] = useState('tournament');

  const renderPage = () => {
    switch (activeTab) {
      case 'tournament':
      case 'golfers':
      case 'shots':
      case 'tournaments':
        return <TournamentSystemPage initialTab={activeTab} />;
      default:
        return <TournamentSystemPage initialTab="tournament" />;
    }
  };

  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <AppLayout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderPage()}
      </AppLayout>
    </MantineProvider>
  );
}

export default App;