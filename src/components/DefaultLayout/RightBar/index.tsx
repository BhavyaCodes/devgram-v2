import { Box, Paper, Typography } from '@mui/material';
import { trpc } from '~/utils/trpc';
import ListItem from './ListItem';

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
              <Paper sx={{ py: 2, width: '100%' }}>
                <Typography
                  sx={{ px: 2, mb: 1 }}
                  component="h3"
                  variant="h4"
                  fontSize={20}
                  fontWeight={800}
                >
                  Who to follow
                </Typography>
                {data.recommendedUsers.map((user) => (
                  <ListItem
                    key={user._id.toString()}
                    _id={user._id.toString()}
                    name={user.name}
                    image={user.image}
                    developer={user.tags?.developer}
                    verified={user.tags?.verified}
                  />
                ))}
              </Paper>
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};
