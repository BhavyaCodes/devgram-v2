import { Box, Paper, Typography } from '@mui/material';
import { trpc } from '~/utils/trpc';

export const RightBar = () => {
  const { data } = trpc.user.getRecommendedUsersToFollow.useQuery(undefined, {
    staleTime: 2000,
  });

  return (
    <>
      <Box position="sticky" top={0}>
        <Box p={2}>
          {data && (
            <Box>
              <Paper sx={{ p: 2, width: '100%' }}>
                <Typography
                  component="h3"
                  variant="h4"
                  fontSize={20}
                  fontWeight={800}
                >
                  Who to follow
                </Typography>
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
