import {
  ActionIcon,
  AppShell,
  Badge,
  Button,
  Card,
  createTheme,
  Group,
  Modal,
  NavLink,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Tabs,
  Text,
  Textarea,
  TextInput,
  Title,
} from '@mantine/core';

export const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
  fontFamily: 'var(--font-sans)',
  fontFamilyMonospace: 'var(--font-mono)',
  headings: {
    fontFamily: 'var(--font-sans)',
  },
  components: {
    AppShell: AppShell.extend({
      defaultProps: {
        padding: 'md',
        withBorder: true,
      },
    }),
    Button: Button.extend({
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: {
        size: 'md',
        radius: 'sm',
        variant: 'subtle',
      },
    }),
    Card: Card.extend({
      defaultProps: {
        padding: 'md',
        radius: 'md',
        withBorder: true,
      },
    }),
    Paper: Paper.extend({
      defaultProps: {
        p: 'md',
        radius: 'md',
        withBorder: true,
      },
    }),
    TextInput: TextInput.extend({
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    }),
    Textarea: Textarea.extend({
      defaultProps: {
        size: 'sm',
        radius: 'sm',
        autosize: true,
        minRows: 4,
      },
    }),
    Select: Select.extend({
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    }),
    Table: Table.extend({
      defaultProps: {
        highlightOnHover: true,
        verticalSpacing: 'sm',
        horizontalSpacing: 'md',
      },
    }),
    Modal: Modal.extend({
      defaultProps: {
        centered: true,
        radius: 'md',
      },
    }),
    Badge: Badge.extend({
      defaultProps: {
        size: 'sm',
        radius: 'sm',
        variant: 'light',
      },
    }),
    NavLink: NavLink.extend({
      defaultProps: {
        variant: 'light',
      },
    }),
    Tabs: Tabs.extend({
      defaultProps: {
        radius: 'sm',
      },
    }),
    SegmentedControl: SegmentedControl.extend({
      defaultProps: {
        size: 'sm',
        radius: 'sm',
      },
    }),
    Stack: Stack.extend({
      defaultProps: {
        gap: 'md',
      },
    }),
    Group: Group.extend({
      defaultProps: {
        gap: 'sm',
      },
    }),
    Title: Title.extend({
      defaultProps: {
        order: 2,
      },
    }),
    Text: Text.extend({
      defaultProps: {
        size: 'sm',
      },
    }),
  },
});
