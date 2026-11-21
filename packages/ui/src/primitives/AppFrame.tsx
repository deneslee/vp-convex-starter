import type { ReactNode } from 'react';
import { Moon, PanelLeft, Sun } from 'lucide-react';
import {
  ActionIcon,
  AppShell,
  Group,
  NavLink,
  Title,
  useComputedColorScheme,
  useMantineColorScheme,
} from '@mantine/core';
import classes from './AppFrame.module.css';

export interface AppNavItem {
  id: string;
  label: string;
  description?: string;
  active: boolean;
  icon?: ReactNode;
  onSelect: () => void;
}

export interface AppFrameProps {
  title: string;
  navItems: AppNavItem[];
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  headerRight?: ReactNode;
  children: ReactNode;
}

export function AppFrame({
  title,
  navItems,
  sidebarOpen,
  onToggleSidebar,
  headerRight,
  children,
}: AppFrameProps) {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  const handleToggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <AppShell
      header={{ height: 'var(--layout-header-height)' }}
      navbar={{
        width: 'var(--layout-sidebar-width)',
        breakpoint: 'sm',
        collapsed: { mobile: !sidebarOpen, desktop: !sidebarOpen },
      }}
    >
      <AppShell.Header>
        <div className={classes.headerInner}>
          <div className={classes.brandGroup}>
            <ActionIcon aria-label="Toggle navigation sidebar" onClick={onToggleSidebar}>
              <PanelLeft />
            </ActionIcon>
            <Title order={4} className={classes.brandTitle}>
              {title}
            </Title>
          </div>
          <Group>
            {headerRight}
            <ActionIcon aria-label="Toggle color scheme" onClick={handleToggleColorScheme}>
              {computedColorScheme === 'dark' ? <Sun /> : <Moon />}
            </ActionIcon>
          </Group>
        </div>
      </AppShell.Header>

      <AppShell.Navbar>
        <nav className={classes.navbarInner} aria-label="Workspace navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              label={item.label}
              description={item.description}
              leftSection={item.icon}
              active={item.active}
              onClick={item.onSelect}
            />
          ))}
        </nav>
      </AppShell.Navbar>

      <AppShell.Main>
        <div className={classes.mainContent}>{children}</div>
      </AppShell.Main>
    </AppShell>
  );
}
