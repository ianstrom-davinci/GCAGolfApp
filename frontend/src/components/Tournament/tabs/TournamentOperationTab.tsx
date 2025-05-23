import React from 'react';
import { Card, Text } from '@mantine/core';

export const TournamentOperationTab: React.FC = () => {
  return (
    <Card shadow="sm" p="lg">
      <Text size="lg" fw={500}>🏆 Tournament Operation</Text>
      <Text mt="md">
        This is where you'll select a tournament and record shots for golfers.
        Coming next!
      </Text>
    </Card>
  );
};