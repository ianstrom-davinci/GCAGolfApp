// File: frontend/src/App.tsx
// -------------------------
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { AppLayout } from './components/Layout/AppLayout';
import { TournamentManagementTab } from './components/Tournament/tabs/TournamentManagementTab';
import { GroupsManagementTab } from './components/Groups/GroupsManagementTab';
import { GolfersManagementTab } from './components/Golfers/GolfersManagementTab';
import { ShotsManagementTab } from './components/Shots/ShotsManagementTab';
import { SessionsPage } from './components/Sessions/SessionsPage';
import { DashboardPage } from './components/Dashboard/DashboardPage';

// Import all required CSS
import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';
import '@mantine/dates/styles.css';
import 'mantine-datatable/styles.css';

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
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <Notifications position="bottom-right" zIndex={1000} />
      <Router>
        <AppLayout>
          <Routes>
            {/* Default route redirects to dashboard */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Main application routes */}
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/tournaments" element={<TournamentManagementTab />} />
            <Route path="/groups" element={<GroupsManagementTab />} />
            <Route path="/golfers" element={<GolfersManagementTab />} />
            <Route path="/shots" element={<ShotsManagementTab />} />
            <Route path="/sessions" element={<SessionsPage />} />

            {/* Catch-all route for 404s */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </MantineProvider>
  );
}

export default App;