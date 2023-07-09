import { Avatar, Box, Button, Tooltip, Typography } from '@mui/material';
import { getImageUrl } from '~/utils/getImageUrl';
import Link from './common/Link';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { LogoSvg } from './common/LogoSvg';
import { trpc } from '~/utils/trpc';
import { useLoginModalStateContext } from '~/context/loginModalStateContext';

interface _UsersListItem {
  _id: string;
  image?: string;
  bio?: string;
  name: string;
  verified?: boolean | null;
  developer?: boolean | null;
  followed?: boolean | null;
  hideFollowButton?: boolean;
}

interface _UsersListItemForLikeList extends _UsersListItem {
  type: 'like';
  postId: string;
  profileId: undefined;
}

interface _UsersListItemForFollowList extends _UsersListItem {
  type: 'follow';
  profileId: string;
  postId: undefined;
}

type UsersListItem = _UsersListItemForLikeList | _UsersListItemForFollowList;

const UsersListItem = ({
  _id,
  image,
  bio,
  name,
  developer,
  verified,
  followed,
  hideFollowButton,
  ...otherProps
}: UsersListItem) => {
  const context = trpc.useContext();
  const { setMessage } = useLoginModalStateContext();

  const followerUserMutation = trpc.user.followUser.useMutation({
    onSuccess(data, variables) {
      const profileId = otherProps.profileId;
      const postId = otherProps.postId;

      if (profileId) {
        context.user.getFollowers.setInfiniteData(
          { userId: profileId },
          (oldData) => {
            if (!oldData) {
              return {
                pages: [{ followers: [], nextCursor: null }],
                pageParams: [null],
              };
            }

            const newPages = oldData.pages.map((page) => {
              const newFollowers = page.followers.map((follower) => {
                if (follower.followerId._id.toString() === variables.userId) {
                  return {
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
                pages: [{ following: [], nextCursor: null }],
                pageParams: [null],
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
      }
      if (postId) {
        context.post.viewLikes.setInfiniteData({ postId }, (oldData) => {
          if (!oldData) {
            return {
              pages: [{ likes: [], nextCursor: null }],
              pageParams: [null],
            };
          }

          const newPages = oldData.pages.map((page) => {
            const newLikes = page.likes.map((like) => {
              if (like.userId._id.toString() === variables.userId) {
                return {
                  ...like,
                  userId: { ...like.userId, followed: true },
                };
              }
              return like;
            });
            return { likes: newLikes, nextCursor: page.nextCursor };
          });

          return { pageParams: oldData.pageParams, pages: newPages };
        });
      }
    },

    onError(error) {
      if (error.data?.code === 'UNAUTHORIZED') {
        setMessage(`You must login to follow ${name || 'this user'}`);
      }
    },
  });

  const unFollowUserMutation = trpc.user.unfollowUser.useMutation({
    onSuccess(data, variables) {
      const profileId = otherProps.profileId;
      const postId = otherProps.postId;
      if (profileId) {
        context.user.getFollowers.setInfiniteData(
          { userId: profileId },
          (oldData) => {
            if (!oldData) {
              return {
                pages: [{ followers: [], nextCursor: null }],
                pageParams: [null],
              };
            }

            const newPages = oldData.pages.map((page) => {
              const newFollowers = page.followers.map((follower) => {
                if (follower.followerId._id.toString() === variables.userId) {
                  return {
                    ...follower,
                    followerId: { ...follower.followerId, followed: false },
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
                pages: [{ following: [], nextCursor: null }],
                pageParams: [null],
              };
            }

            const newPages = oldData.pages.map((page) => {
              const newFollowers = page.following.map((following) => {
                if (following.userId._id.toString() === variables.userId) {
                  return {
                    ...following,
                    userId: { ...following.userId, followed: false },
                  };
                }
                return following;
              });
              return { following: newFollowers, nextCursor: page.nextCursor };
            });

            return { pageParams: oldData.pageParams, pages: newPages };
          },
        );
      }

      if (postId) {
        context.post.viewLikes.setInfiniteData({ postId }, (oldData) => {
          if (!oldData) {
            return {
              pages: [{ likes: [], nextCursor: null }],
              pageParams: [null],
            };
          }

          const newPages = oldData.pages.map((page) => {
            const newLikes = page.likes.map((like) => {
              if (like.userId._id.toString() === variables.userId) {
                return {
                  ...like,
                  userId: { ...like.userId, followed: false },
                };
              }
              return like;
            });
            return { likes: newLikes, nextCursor: page.nextCursor };
          });

          return { pageParams: oldData.pageParams, pages: newPages };
        });
      }
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
                    unFollowUserMutation.mutate({ userId: _id });
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
                      color: (theme) => theme.palette.error.light,
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
