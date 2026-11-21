import { Badge, Stack, Text, Title } from '@mantine/core';
import { StatusBadge, WorkspaceSurface, type SemanticStatus } from './Surface';
import classes from './RecordViews.module.css';

export interface RecordDetailCardProps {
  title: string;
  category: string;
  status: Extract<SemanticStatus, 'draft' | 'active' | 'archived'>;
  tags: string[];
  attributes: Record<string, string>;
  updatedAt: number;
}

export function RecordDetailCard({
  title,
  category,
  status,
  tags,
  attributes,
  updatedAt,
}: RecordDetailCardProps) {
  const attributeEntries = Object.entries(attributes);

  return (
    <WorkspaceSurface elevated>
      <Stack>
        <Title order={3}>{title}</Title>
        <div className={classes.detailMeta}>
          <StatusBadge status={status} />
          <Text>Category: {category || 'Uncategorized'}</Text>
          <Text>Updated: {new Date(updatedAt).toLocaleString()}</Text>
        </div>
        {tags.length > 0 ? (
          <div className={classes.tagList}>
            {tags.map((tag) => (
              <Badge key={tag} className={classes.tagChip}>
                {tag}
              </Badge>
            ))}
          </div>
        ) : null}
        {attributeEntries.length > 0 ? (
          <div className={classes.attributeGrid}>
            {attributeEntries.map(([key, value]) => (
              <div key={key} className={classes.attributeItem}>
                <Text className={classes.attributeKey}>{key}</Text>
                <Text className={classes.attributeValue}>{value}</Text>
              </div>
            ))}
          </div>
        ) : null}
      </Stack>
    </WorkspaceSurface>
  );
}
