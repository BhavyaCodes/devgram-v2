import { Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';

export const TextRemaining = ({ percent }: { percent: number }) => {
  return (
    <Box position="relative" display="flex">
      <CircularProgress
        variant="determinate"
        color="primary"
        // value={percent}
        value={100}
        size={20}
        sx={{
          color: (theme) => theme.palette.grey[800],
        }}
      />
      <CircularProgress
        variant="determinate"
        color="primary"
        value={percent}
        size={20}
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          // color: (theme) => theme.palette.grey[800],
        }}
      />
    </Box>
  );
};
