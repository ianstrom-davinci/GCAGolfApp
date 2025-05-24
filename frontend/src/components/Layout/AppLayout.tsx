// File: frontend/src/components/Layout/AppLayout.tsx
// -------------------------------------------------
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();

  // Get current page from URL
  const currentPath = location.pathname;
  const activeTab = currentPath.substring(1) || 'dashboard'; // Remove leading slash

  // Handle navigation
  const handleNavigation = (value: string) => {
    navigate(`/${value}`);
  };

  // Get current page label for breadcrumbs
  const getCurrentPageLabel = () => {
    const currentItem = navigationItems.find(item => item.value === activeTab);
    return currentItem?.label || 'Dashboard';
  };

  const breadcrumbItems = [
    { title: 'Home', href: '/' },
    { title: 'GCA Golf App', href: '/' },
    { title: getCurrentPageLabel(), href: currentPath },
  ].map((item, index) => (
    <Anchor
      key={index}
      onClick={() => navigate(item.href)}
      style={{ cursor: 'pointer' }}
    >
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
            const isActive = activeTab === item.value;

            return (
              <NavLink
                key={item.value}
                active={isActive}
                label={item.label}
                leftSection={<Icon size="1rem" />}
                onClick={() => handleNavigation(item.value)}
                color="blue"
                styles={{
                  root: {
                    color: 'white',
                    cursor: 'pointer',
                    '&:hover': {
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    },
                    '&[data-active]': {
                      backgroundColor: 'rgba(59, 130, 246, 0.3)',
                      '&:hover': {
                        backgroundColor: 'rgba(59, 130, 246, 0.4)',
                      },
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