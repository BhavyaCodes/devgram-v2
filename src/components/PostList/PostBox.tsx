import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Typography,
  useTheme,
} from '@mui/material';
import { trpc } from '~/utils/trpc';
import DeleteIcon from '@mui/icons-material/Delete';
import { timeAgo } from '~/utils/timeAgo';
import { ActionButton } from './ActionButton';

// Icons
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import CommentBox from './CommentBox';
import { ObjectId } from 'mongodb';
import { AddComment } from './AddComment';
import { useEffect, useState } from 'react';

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

  lastComment?: Comment | null;
}

export interface Comment {
  _id: ObjectId;
  userId: {
    _id: ObjectId;
    image?: string;
    name: string;
  };
  postId: ObjectId;
  content: string;
  createdAt: Date;
  updatedAt: Date;
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
  lastComment,
}: PostBoxProps) => {
  const utils = trpc.useContext();
  const theme = useTheme();
  const [timeAgoString, setTimeAgoString] = useState<string | undefined>(
    undefined,
  );
  const [deleteCommentData, setDeleteCommentData] = useState<null | {
    commentId: string;
    commentContent: string;
  }>(null);

  const [viewMoreComments, setViewMoreComments] = useState(false);

  useEffect(() => {
    setTimeAgoString(timeAgo.format(createdAt, 'twitter'));
  }, [createdAt]);

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

  const {
    error,
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.post.comment.getCommentsByPostIdPaginated.useInfiniteQuery(
    { postId: _id, limit: 5 },
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      // refetchOnWindowFocus: false,
      enabled: viewMoreComments,
    },
  );
  const deleteCommentMutation = trpc.post.comment.deleteComment.useMutation({
    onSuccess(data, variables, context) {
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [],
            pageParams: [],
          };
        }
        const newPages = oldData.pages.map((page) => {
          const newPosts = page.posts.map((post) => {
            if (post._id.toString() === variables.postId) {
              return {
                ...post,
                commentCount: post.commentCount - 1,
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
      utils.post.comment.getCommentsByPostIdPaginated.setInfiniteData(
        { postId: variables.postId, limit: 5 },
        (oldData) => {
          if (!oldData) {
            return {
              pages: [],
              pageParams: [],
            };
          }
          const newPages = oldData.pages.map((page) => {
            const newComments = page.comments.filter(
              (comment) => comment._id.toString() !== variables.commentId,
            );
            return { comments: newComments, nextCursor: page.nextCursor };
          });
          return {
            pageParams: oldData.pageParams,
            pages: newPages,
          };
        },
      );
    },
  });

  useEffect(() => {
    if (lastComment?._id) {
      utils.post.comment.getCommentsByPostIdPaginated.setInfiniteData(
        { postId: _id, limit: 5 },
        (oldData) => {
          const newPage = {
            comments: [lastComment],
            nextCursor: {
              createdAt: lastComment.createdAt,
              _id: lastComment._id.toString(),
              exclude: true,
            },
          };

          const newPages = [newPage];

          return { pages: newPages, pageParams: [null] };
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_id]);

  const paginatedComments = data?.pages.flatMap((page) => page.comments);

  return (
    <>
      {/* Delete comment Modal */}
      {!!deleteCommentData && (
        <Dialog
          open={!!deleteCommentData}
          onClose={() => setDeleteCommentData(null)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure you want to delete this comment?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {deleteCommentData?.commentContent}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="error"
              onClick={() => {
                deleteCommentMutation.mutate({
                  commentId: deleteCommentData.commentId,
                  postId: _id,
                });
                setDeleteCommentData(null);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <Box
        border="1px solid rgb(56, 68, 77)"
        sx={{
          borderTopColor: 'rgba(0,0,0,0)',
        }}
        display="flex"
        p={2}
        flexWrap="wrap"
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
              {!!timeAgoString && (
                <Typography component="span" variant="body2">
                  {timeAgoString}
                </Typography>
              )}
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
          <Typography
            variant="body1"
            sx={{ overflowWrap: 'anywhere' }}
            whiteSpace="pre-wrap"
          >
            {content.replace(/\n+/g, '\n')}
          </Typography>
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

          {/* <Typography>Comment count: {commentCount}</Typography> */}
          {/* <CommentList postId={_id} /> */}

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

          {/* {hasLiked ? (
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
          )} */}
        </Box>
        <Box
          borderTop="1px solid rgb(56, 68, 77)"
          borderBottom="1px solid rgb(56, 68, 77)"
          sx={{ flexBasis: '100%', p: 1, display: 'flex', mb: 0.5 }}
        >
          <Box
            flexGrow={1}
            mr={1}
            bgcolor="#1E1E1E"
            borderRadius={1}
            py={0.5}
            sx={{
              '&:hover': {
                bgcolor: '#424242',
              },
              '&:active': {
                bgcolor: '#1E1E1E',
              },
              cursor: 'pointer',
              transition: (theme) =>
                theme.transitions.create('background-color', {
                  duration: '0.1s',
                }),
            }}
            onClick={() => {
              console.log('click');
              console.log(hasLiked);
              if (!hasLiked) {
                likeMutation.mutate(_id);
              } else {
                unlikeMutation.mutate(_id);
              }
              // hasLiked ? likeMutation.mutate(_id) : unlikeMutation.mutate(_id);
            }}
            display="flex"
            alignItems="center"
            justifyContent="center"
            fontSize={20}
            flexShrink={0}
          >
            {hasLiked ? (
              <FavoriteRoundedIcon
                sx={{ fill: 'rgba(255, 23, 68, 1)' }}
                fontSize="inherit"
              />
            ) : (
              <FavoriteBorderRoundedIcon fontSize="inherit" />
            )}
            <Typography
              color={hasLiked ? 'rgba(255, 23, 68, 1)' : undefined}
              component="span"
              fontSize={16}
              flexShrink={0}
              variant="subtitle2"
              ml={1}
            >
              Like
            </Typography>
          </Box>
          <Box
            flexGrow={1}
            mr={1}
            textAlign="center"
            bgcolor="#1E1E1E"
            borderRadius={1}
            py={0.5}
            sx={{
              '&:hover': {
                bgcolor: '#424242',
              },
              cursor: 'pointer',
              transition: (theme) =>
                theme.transitions.create('background-color', {
                  duration: '0.3s',
                }),
            }}
          >
            asdasd
          </Box>
        </Box>

        <AddComment postId={_id} />
        {paginatedComments?.map((comment) => (
          <CommentBox
            commentId={comment._id.toString()}
            key={comment._id.toString()}
            userId={{
              _id: comment.userId._id.toString(),
              image: comment.userId.image,
              name: comment.userId.name,
            }}
            postId={comment.postId.toString()}
            content={comment.content}
            createdAt={comment.createdAt}
            postUserId={userId}
            setDeleteCommentData={setDeleteCommentData}
          />
        ))}

        {paginatedComments &&
          paginatedComments.length < commentCount &&
          hasNextPage && (
            <Typography
              onClick={() => {
                fetchNextPage();
                setViewMoreComments(true);
              }}
              mb={-1}
              fontWeight={500}
              color={theme.palette.grey.A700}
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  textDecoration: 'underline',
                },
              }}
            >
              View more comments
            </Typography>
          )}
        {/* {hasNextPage && (
          <Typography
            onClick={() => {
              fetchNextPage();
              setViewMoreComments(true);
            }}
            mb={-1}
            fontWeight={500}
            color={theme.palette.grey.A700}
            sx={{
              cursor: 'pointer',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            View more comments
          </Typography>
        )} */}
      </Box>
    </>
  );
};
