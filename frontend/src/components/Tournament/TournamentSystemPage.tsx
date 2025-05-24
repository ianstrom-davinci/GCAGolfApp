// File: frontend/src/components/Tournament/TournamentSystemPage.tsx
// ----------------------------------------------------------------
import React, { useState, useEffect } from 'react';
import {
  Container,
  Title,
  Paper,
  Group,
  Badge,
  Text,
} from '@mantine/core';
import {
  IconTrophy,
  IconUsers,
  IconUsersGroup,
  IconTarget,
  IconPlaystationCircle,
} from '@tabler/icons-react';
import { TournamentManagementTab } from './tabs/TournamentManagementTab';
import { GroupsManagementTab } from '../Groups/GroupsManagementTab';
import { GolfersManagementTab } from '../Golfers/GolfersManagementTab';
import { ShotsManagementTab } from '../Shots/ShotsManagementTab';

interface TournamentSystemPageProps {
  initialTab: string;
}

export const TournamentSystemPage: React.FC<TournamentSystemPageProps> = ({
  initialTab
}) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'tournaments');

  // Sync internal state with prop changes from sidebar navigation
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const tabData = [
    {
      value: 'tournaments',
      label: 'Tournament Management',
      icon: IconTrophy,
      description: 'Create and manage golf tournaments',
      color: 'blue',
    },
    {
      value: 'groups',
      label: 'Groups',
      icon: IconUsersGroup,
      description: 'Organize golfers into groups',
      color: 'green',
    },
    {
      value: 'golfers',
      label: 'Golfers',
      icon: IconUsers,
      description: 'Manage individual golfer profiles',
      color: 'orange',
    },
    {
      value: 'shots',
      label: 'Shots',
      icon: IconTarget,
      description: 'Track and analyze golf shots',
      color: 'red',
    },
    {
      value: 'operations',
      label: 'Event Operations',
      icon: IconPlaystationCircle,
      description: 'Live tournament operations',
      color: 'violet',
    },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'tournaments':
        return <TournamentManagementTab />;
      case 'groups':
        return <GroupsManagementTab />;
      case 'golfers':
        return <GolfersManagementTab />;
      case 'shots':
        return <ShotsManagementTab />;
      case 'operations':
        return (
          <Paper p="xl" withBorder>
            <Group gap="sm" mb="md">
              <IconPlaystationCircle size={24} />
              <Title order={2}>Event Operations</Title>
              <Badge color="violet" variant="light">
                Coming Soon
              </Badge>
            </Group>
            <Text c="dimmed">
              Live tournament operations including real-time scoring, leaderboards,
              and event management tools will be available here.
            </Text>
          </Paper>
        );
      default:
        return <TournamentManagementTab />;
    }
  };

  const getCurrentTabData = () => {
    return tabData.find(tab => tab.value === activeTab) || tabData[0];
  };

  const currentTab = getCurrentTabData();

  return (
    <Container size="xl" py="md">
      <Paper shadow="sm" radius="md" p="lg" mb="lg">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={1} mb="xs">
              GCA Golf App Management System
            </Title>
            <Text c="dimmed" size="lg">
              Complete tournament and golfer management platform
            </Text>
          </div>
          <Badge
            size="lg"
            variant="gradient"
            gradient={{ from: currentTab.color, to: 'blue' }}
          >
            {currentTab.label}
          </Badge>
        </Group>

        {/* Just render the content directly - no horizontal tabs */}
        <div>
          {renderActiveTab()}
        </div>
      </Paper>
    </Container>
  );
};