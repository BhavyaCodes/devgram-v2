import { Box, Button, IconButton, Typography, useTheme } from '@mui/material';
import { trpc } from '~/utils/trpc';
import { AddComment } from './AddComment';
import DeleteIcon from '@mui/icons-material/Delete';
import { CommentList } from './CommentList';
import { timeAgo } from '~/utils/timeAgo';
import { ActionButton } from './ActionButton';

// Icons
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';

interface PostBoxProps {
  /**
   * postId
   */
  _id: string;
  /**
   * name of post author
   */
  name: string;
  /**
   * image of post author
   */
  image?: string;
  /**
   * _id of author
   */
  userId: string;
  content: string;
  likeCount: number;
  commentCount: number;
  /**
   * Logged in user has liked the post
   */
  hasLiked?: boolean | null;
  imageId?: string;
  gifUrl?: string;
  createdAt: Date;
}

export const PostBox = ({
  _id,
  userId,
  name,
  image,
  content,
  likeCount,
  commentCount,
  hasLiked,
  imageId,
  gifUrl,
  createdAt,
}: PostBoxProps) => {
  const utils = trpc.useContext();
  const theme = useTheme();

  const likeMutation = trpc.post.likePost.useMutation({
    onSuccess(data, variables, context) {
      //variable -> postId
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const newPages = oldData.pages.map((page) => {
          const newPosts = page.posts.map((post) => {
            if (post._id.toString() === variables) {
              return {
                ...post,
                hasLiked: true,
                likeCount: post.likeCount + 1,
              };
            }
            return post;
          });
          return { posts: newPosts, nextCursor: page.nextCursor };
        });
        return {
          pageParams: oldData.pageParams,
          pages: newPages,
        };
      });
    },
  });
  const unlikeMutation = trpc.post.unlikePost.useMutation({
    onSuccess(data, variables, context) {
      //variable -> postId
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const newPages = oldData.pages.map((page) => {
          const newPosts = page.posts.map((post) => {
            if (post._id.toString() === variables) {
              return {
                ...post,
                hasLiked: undefined,
                likeCount: post.likeCount - 1,
              };
            }
            return post;
          });
          return { posts: newPosts, nextCursor: page.nextCursor };
        });
        return {
          pageParams: oldData.pageParams,
          pages: newPages,
        };
      });
    },
  });

  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess(data, variables, context) {
      //variable -> postId
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [],
            pageParams: [],
          };
        }

        const newPages = oldData.pages.map((page) => {
          const newPosts = page.posts.filter(
            (post) => post._id.toString() !== variables,
          );
          return { posts: newPosts, nextCursor: page.nextCursor };
        });
        return {
          pageParams: oldData.pageParams,
          pages: newPages,
        };
      });
    },
  });

  const getUser = trpc.user.getUser.useQuery(undefined, {
    staleTime: 60000,
    retry: false,
    onError: ({ data }) => {
      if (data?.code === 'UNAUTHORIZED') {
        console.log('not logged in');
      }
    },
  });

  return (
    <>
      <Box
        border="1px solid rgb(56, 68, 77)"
        sx={{
          borderTopColor: 'rgba(0,0,0,0)',
        }}
        display="flex"
        p={2}
      >
        <Box
          flexShrink={0}
          flexBasis="8%"
          sx={{
            '& img': {
              width: '100%',
              maxWidth: '100%',
              borderRadius: 200,
            },
            [theme.breakpoints.down('md')]: {
              flexBasis: '20%',
            },
            pr: 2,
          }}
        >
          <img src={image} alt={`${name} avatar`} />
        </Box>
        <Box flexGrow={1}>
          <Box display="flex" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <Typography variant="h6">{name}</Typography>
              <Box
                ml={1}
                mr={0.5}
                width={2}
                height={2}
                borderRadius={100}
                sx={{
                  bgcolor: (theme) => theme.palette.text.primary,
                  opacity: 0.4,
                }}
              />
              <Typography component="span" variant="body2">
                {timeAgo.format(createdAt, 'twitter')}
              </Typography>
            </Box>
            <IconButton
              disableFocusRipple
              disableTouchRipple
              sx={{
                '&:hover': {
                  bgcolor: 'transparent',
                  '& svg': {
                    fill: '#fff',
                  },
                },
              }}
            >
              <MoreHorizRoundedIcon sx={{ color: 'rgb(56, 68, 77)' }} />
            </IconButton>
          </Box>
          <Typography variant="body1">{content}</Typography>
          {(imageId || gifUrl) && (
            <Box
              mt={1}
              sx={{
                '& img': {
                  maxHeight: 400,
                  maxWidth: '100%',
                  borderRadius: 4,
                },
              }}
            >
              {imageId ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_CLOUDINARY_DELIVERY_URL}/${imageId}`}
                />
              ) : (
                !!gifUrl && <img src={gifUrl} />
              )}
            </Box>
          )}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <ActionButton
              onClick={() => console.log('asfsasdaf')}
              hoverBgColor="rgba(255, 23, 68, 0.1)"
              Icon={hasLiked ? FavoriteRoundedIcon : FavoriteBorderRoundedIcon}
              color="rgba(255, 23, 68, 1)"
              iconAlwaysColored={!!hasLiked}
              number={likeCount}
              toolTip="Likes"
            />

            <ActionButton
              onClick={() => console.log('asfsasdaf')}
              hoverBgColor="rgba(0, 176, 255, 0.1)"
              Icon={ChatBubbleOutlineRoundedIcon}
              color="rgba(0, 176, 255, 1)"
              number={commentCount}
              toolTip="Comment"
            />
            <ActionButton
              onClick={() => console.log('asfsasdaf')}
              hoverBgColor="rgba(118, 255, 3, 0.1)"
              Icon={ReplyRoundedIcon}
              color="rgba(118, 255, 3, 1)"
              toolTip="Share"
              text="Share"
              iconInverted
            />
          </Box>
          {getUser.data?._id?.toString() === userId ? (
            <Button
              variant="contained"
              color="error"
              startIcon={<DeleteIcon />}
              type="button"
              onClick={() => {
                deletePostMutation.mutate(_id);
              }}
            >
              Delete Post
            </Button>
          ) : null}
          <Typography>Like Count: {likeCount}</Typography>
          {hasLiked ? (
            <>
              <Typography variant="subtitle1">You liked this</Typography>
              <Button
                type="button"
                color="error"
                onClick={() => unlikeMutation.mutate(_id)}
                disabled={unlikeMutation.isLoading}
              >
                Unlike This Post
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => likeMutation.mutate(_id)}
              disabled={likeMutation.isLoading}
            >
              Like This Post
            </Button>
          )}
          <AddComment postId={_id} />
          <Typography>Comment count: {commentCount}</Typography>
          <CommentList postId={_id} />
        </Box>
      </Box>
      <></>
    </>
  );
};
