import React from 'react';
import { Container, Title } from '@mantine/core';
import {
  IconTrophy,
  IconUsers,
  IconUsersGroup,
  IconTarget,
  IconPlaystationCircle
} from '@tabler/icons-react';
import { TournamentManagementTab } from './tabs/TournamentManagementTab';
import { GroupsManagementTab } from './tabs/GroupsManagementTab';

interface TournamentSystemPageProps {
  initialTab: string;
}

export const TournamentSystemPage: React.FC<TournamentSystemPageProps> = ({ initialTab }) => {

  const renderActiveTab = () => {
    switch (initialTab) {
      case 'tournaments':
        return <TournamentManagementTab />;
      case 'golfers':
        return <div>👥 Golfers Management - Coming next!</div>;
      case 'groups':
        return <GroupsManagementTab />;
      case 'shots':
        return <div>🎯 Shots Data - Coming next!</div>;
      case 'operations':
        return <div>⚡ Event Operations - Coming next!</div>;
      default:
        return <TournamentManagementTab />;
    }
  };

  const getPageTitle = () => {
    switch (initialTab) {
      case 'tournaments':
        return 'Tournament Management';
      case 'golfers':
        return 'Golfers Management';
      case 'groups':
        return 'Groups Management';
      case 'shots':
        return 'Shots Data';
      case 'operations':
        return 'Event Operations';
      default:
        return 'Tournament Management';
    }
  };

  const getIcon = () => {
    switch (initialTab) {
      case 'tournaments':
        return <IconTrophy size={32} />;
      case 'golfers':
        return <IconUsers size={32} />;
      case 'groups':
        return <IconUsersGroup size={32} />;
      case 'shots':
        return <IconTarget size={32} />;
      case 'operations':
        return <IconPlaystationCircle size={32} />;
      default:
        return <IconTrophy size={32} />;
    }
  };

  return (
    <Container size="xl">
      <Title order={1} mb="xl">
        {getIcon()}
        <span style={{ marginLeft: 8 }}>{getPageTitle()}</span>
      </Title>

      {renderActiveTab()}
    </Container>
  );
};