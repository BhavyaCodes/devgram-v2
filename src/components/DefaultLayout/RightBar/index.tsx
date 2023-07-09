import { Box, Paper, Typography, useMediaQuery, useTheme } from '@mui/material';
import { trpc } from '~/utils/trpc';
import ListItem from './ListItem';

export const RightBar = () => {
  const theme = useTheme();
  const enabled = useMediaQuery(theme.breakpoints.up('md'));
  const { data } = trpc.user.getRecommendedUsersToFollow.useQuery(undefined, {
    staleTime: 2000,
    enabled,
  });

  return (
    <Box position="sticky" top={0}>
      <Box p={2}>
        {!!data?.recommendedUsers.length && (
          <Box>
            <Paper sx={{ py: 2 }}>
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
  );
};
