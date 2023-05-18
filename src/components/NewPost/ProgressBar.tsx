import { Box } from '@mui/material';
import React from 'react';

interface ProgressBarProps {
  /**
   * number betweem 0 - 1
   */
  progress?: number;
}

export const ProgressBar = ({ progress }: ProgressBarProps) => {
  if (progress === undefined) {
    return null;
  }
  return (
    <Box
      position="absolute"
      width={`${Math.max(progress * 100, 20)}%`}
      maxWidth="100%"
      height={5}
      sx={{
        bgcolor: (theme) => theme.palette.primary.dark,
        transition: (theme) => theme.transitions.create('all'),
      }}
      top={0}
      left={0}
      display="inline-block"
    />
  );
};
