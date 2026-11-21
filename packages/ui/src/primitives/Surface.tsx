import type { ReactNode } from 'react';
import { Badge, Button, Group, Text, Title } from '@mantine/core';
import classes from './Surface.module.css';

export type SemanticStatus = 'draft' | 'active' | 'archived' | 'pending' | 'indexed' | 'failed';
export type SemanticIntent = 'primary' | 'secondary' | 'danger' | 'subtle';
export type SurfaceDensity = 'comfortable' | 'compact';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className={classes.pageHeader}>
      <div className={classes.pageHeaderCopy}>
        <Title className={classes.pageTitle}>{title}</Title>
        {description ? <Text className={classes.pageDescription}>{description}</Text> : null}
      </div>
      {actions ? <Group>{actions}</Group> : null}
    </header>
  );
}

export interface WorkspaceSurfaceProps {
  children: ReactNode;
  elevated?: boolean;
  density?: SurfaceDensity;
}

export function WorkspaceSurface({
  children,
  elevated = false,
  density = 'comfortable',
}: WorkspaceSurfaceProps) {
  const baseClass = elevated ? classes.surfaceElevated : classes.surface;
  const className = density === 'compact' ? `${baseClass} ${classes.surfaceCompact}` : baseClass;
  return <section className={className}>{children}</section>;
}

export interface StatusBadgeProps {
  status: SemanticStatus;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  return (
    <Badge className={classes.statusBadge} data-status={status}>
      {label ?? status}
    </Badge>
  );
}

export interface SemanticButtonProps {
  children: ReactNode;
  intent?: SemanticIntent;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  leftSection?: ReactNode;
  onClick?: () => void;
  'aria-label'?: string;
}

export function SemanticButton({
  children,
  intent = 'primary',
  type = 'button',
  disabled,
  loading,
  fullWidth,
  leftSection,
  onClick,
  'aria-label': ariaLabel,
}: SemanticButtonProps) {
  return (
    <Button
      className={classes.semanticButton}
      data-intent={intent}
      type={type}
      disabled={disabled}
      loading={loading}
      fullWidth={fullWidth}
      leftSection={leftSection}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {children}
    </Button>
  );
}

export interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className={classes.emptyState}>
      <Title order={4} className={classes.emptyTitle}>
        {title}
      </Title>
      {description ? <Text className={classes.emptyDescription}>{description}</Text> : null}
      {action}
    </div>
  );
}
