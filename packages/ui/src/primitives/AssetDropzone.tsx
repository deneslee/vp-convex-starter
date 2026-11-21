import { Upload } from 'lucide-react';
import { Text } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import classes from './AssetViews.module.css';

export interface AssetDropzoneProps {
  onDropFiles: (files: File[]) => void;
  accept?: string[];
  loading?: boolean;
  label?: string;
  hint?: string;
}

export function AssetDropzone({
  onDropFiles,
  accept = IMAGE_MIME_TYPE,
  loading = false,
  label = 'Drop images here or click to upload',
  hint = 'Files are uploaded directly to Convex File Storage',
}: AssetDropzoneProps) {
  return (
    <Dropzone onDrop={onDropFiles} accept={accept} loading={loading}>
      <div className={classes.dropzoneContent}>
        <Upload />
        <Text>{label}</Text>
        <Text className={classes.dropzoneHint}>{hint}</Text>
      </div>
    </Dropzone>
  );
}
