// File: frontend/src/components/Dashboard/DashboardPage.tsx
// --------------------------------------------------------
import React from 'react';
import { Stack, Title, Group, Alert, Text } from '@mantine/core';

export function DashboardPage() {
  return (
    <Stack gap="lg">
      <Title order={2}>Golf Analytics Dashboard</Title>
      <Group grow>
        <Alert color="blue" title="Total Sessions">
          <Text size="xl" fw="bold">12</Text>
        </Alert>
        <Alert color="green" title="Total Shots">
          <Text size="xl" fw="bold">342</Text>
        </Alert>
        <Alert color="orange" title="Avg Distance">
          <Text size="xl" fw="bold">265 yds</Text>
        </Alert>
        <Alert color="purple" title="Best Smash Factor">
          <Text size="xl" fw="bold">1.52</Text>
        </Alert>
      </Group>
      <Text c="dimmed">
        Welcome to your golf analytics dashboard! Select a section from the navigation to get started.
      </Text>
    </Stack>
  );
}