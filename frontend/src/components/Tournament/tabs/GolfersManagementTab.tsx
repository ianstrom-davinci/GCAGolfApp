import React from 'react';
import { Card, Text } from '@mantine/core';

export const GolfersManagementTab: React.FC = () => {
  return (
    <Card shadow="sm" p="lg">
      <Text size="lg" fw={500}>👥 Golfers Management</Text>
      <Text mt="md">
        This is where you'll manage all golfers across all tournaments.
        Coming next!
      </Text>
    </Card>
  );
};