import React from 'react';
import { Card, Text } from '@mantine/core';

export const ShotsDataTab: React.FC = () => {
  return (
    <Card shadow="sm" p="lg">
      <Text size="lg" fw={500}>🎯 Shots Data</Text>
      <Text mt="md">
        This is where you'll view and manage all shot data.
        Coming next!
      </Text>
    </Card>
  );
};