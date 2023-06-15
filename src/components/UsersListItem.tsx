import { Avatar, Box, Button, Tooltip, Typography } from '@mui/material';
import { getImageUrl } from '~/utils/getImageUrl';
import Link from './common/Link';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { LogoSvg } from './common/LogoSvg';
import { trpc } from '~/utils/trpc';
import { useRouter } from 'next/router';

interface UsersListItem {
  _id: string;
  image?: string;
  bio?: string;
  name: string;
  verified?: boolean | null;
  developer?: boolean | null;
  followed?: boolean | null;
  hideFollowButton?: boolean;
}

const UsersListItem = ({
  _id,
  image,
  bio,
  name,
  developer,
  verified,
  followed,
  hideFollowButton,
}: UsersListItem) => {
  const context = trpc.useContext();
  const profileId = useRouter().query.id as string;

  const followerUserMutation = trpc.user.followUser.useMutation({
    onSuccess(data, variables) {
      context.user.getFollowers.setInfiniteData(
        { userId: profileId },
        (oldData) => {
          if (!oldData) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = oldData.pages.map((page) => {
            const newFollowers = page.followers.map((follower) => {
              if (follower.followerId._id.toString() === variables.userId) {
                return {
                  // ...follower,
                  ...follower,
                  followerId: { ...follower.followerId, followed: true },
                };
              }
              return follower;
            });
            return { followers: newFollowers, nextCursor: page.nextCursor };
          });

          return { pageParams: oldData.pageParams, pages: newPages };
        },
      );

      context.user.getFollowing.setInfiniteData(
        { followerId: profileId },
        (oldData) => {
          if (!oldData) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPages = oldData.pages.map((page) => {
            const newFollowers = page.following.map((following) => {
              if (following.userId._id.toString() === variables.userId) {
                return {
                  ...following,
                  userId: { ...following.userId, followed: true },
                };
              }
              return following;
            });
            return { following: newFollowers, nextCursor: page.nextCursor };
          });

          return { pageParams: oldData.pageParams, pages: newPages };
        },
      );
    },
  });

  return (
    <Link
      href={`/${_id}`}
      display="flex"
      sx={{
        textDecoration: 'none',
        color: 'inherit',
        px: 2,
        py: 1,
        '&:hover': {
          bgcolor: 'rgba(0,0,0,0.1)',
        },
      }}
    >
      <Box flexShrink={0} mr={2}>
        <Avatar src={getImageUrl(image)} alt={name} />
      </Box>
      <Box flexGrow={1} display="flex">
        <Box flexGrow={1}>
          <Box display="flex" alignItems="center">
            <Typography fontWeight={700}>{name}</Typography>{' '}
            {verified && (
              <Tooltip title="Verified">
                <VerifiedRoundedIcon
                  sx={{ ml: 1, fontSize: 20 }}
                  color="primary"
                />
              </Tooltip>
            )}
            {developer && <LogoSvg title="Developer" ml={0.5} />}
          </Box>
          <Typography variant="body1">{bio}</Typography>
        </Box>

        <Box
          width={100}
          display="flex"
          alignItems="flex-start"
          justifyContent="flex-end"
        >
          {!hideFollowButton && (
            <>
              {followed ? (
                <Button
                  variant="outlined"
                  color="inherit"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                  sx={{
                    display: 'inline-block',
                    width: 100,
                    '&::after': {
                      display: 'flex',
                      justifyContent: 'center',
                      content: "'Following'",
                    },
                    '&:hover': {
                      color: 'red',
                      '&::after': {
                        content: '"UnFollow"',
                      },
                    },
                  }}
                ></Button>
              ) : (
                <Button
                  variant="contained"
                  color="inherit"
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    followerUserMutation.mutate({ userId: _id });
                  }}
                >
                  Follow
                </Button>
              )}
            </>
          )}
        </Box>
      </Box>
    </Link>
  );
};

export default UsersListItem;
