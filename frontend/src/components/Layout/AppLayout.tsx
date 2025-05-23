// File: frontend/src/components/Layout/AppLayout.tsx
// -------------------------------------------------
import React from 'react';
import {
  AppShell,
  Group,
  Text,
  NavLink,
  Stack,
  Image,
  Breadcrumbs,
  Anchor,
  Badge,
} from '@mantine/core';
import { navigationItems } from '../../utils/constants';

interface AppLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  children: React.ReactNode;
}

export function AppLayout({ activeTab, setActiveTab, children }: AppLayoutProps) {
  const breadcrumbItems = [
    { title: 'Home', href: '#' },
    { title: 'GCA Golf App', href: '#' },
    { title: navigationItems.find(item => item.value === activeTab)?.label || 'Dashboard', href: '#' },
  ].map((item, index) => (
    <Anchor href={item.href} key={index}>
      {item.title}
    </Anchor>
  ));

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 250, breakpoint: 'sm' }}
      padding="md"
    >
      {/* Header */}
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Image
              src="/logo192.png"
              alt="GCA Golf Logo"
              h={40}
              w="auto"
              fit="contain"
            />
            <Text size="xl" fw="bold" c="blue">
              GCA Golf Analytics
            </Text>
          </Group>

          <Group>
            <Breadcrumbs separator="/">{breadcrumbItems}</Breadcrumbs>
            <Badge color="green" variant="filled">Online</Badge>
          </Group>
        </Group>
      </AppShell.Header>

      {/* Navbar */}
      <AppShell.Navbar p="md" bg="dark">
        <Stack gap="xs">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.value}
                active={activeTab === item.value}
                label={item.label}
                leftSection={<Icon size="1rem" />}
                onClick={() => setActiveTab(item.value)}
                color="blue"
                styles={{
                  root: {
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                  },
                  label: {
                    color: 'white',
                  },
                }}
              />
            );
          })}
        </Stack>
      </AppShell.Navbar>

      {/* Main Content */}
      <AppShell.Main>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}