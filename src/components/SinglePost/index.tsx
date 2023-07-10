import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  SnackbarCloseReason,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { trpc } from '~/utils/trpc';
import { timeAgo } from '~/utils/timeAgo';
// import { ActionButton } from './ActionButton';
import { ActionButton } from '../PostList/ActionButton';

// Icons
import ChatBubbleOutlineRoundedIcon from '@mui/icons-material/ChatBubbleOutlineRounded';
import FavoriteBorderRoundedIcon from '@mui/icons-material/FavoriteBorderRounded';
import FavoriteRoundedIcon from '@mui/icons-material/FavoriteRounded';
import MoreHorizRoundedIcon from '@mui/icons-material/MoreHorizRounded';
import ReplyRoundedIcon from '@mui/icons-material/ReplyRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import CloseIcon from '@mui/icons-material/Close';
import InsertLinkRoundedIcon from '@mui/icons-material/InsertLinkRounded';

// import CommentBox from './CommentBox';
import CommentBox from '../PostList/CommentBox';
// import { AddComment } from './AddComment';
import { AddComment } from '../PostList/AddComment';
import { useEffect, useRef, useState } from 'react';
import Link from '../common/Link';
import { formatText } from '~/utils/formatText';
import { getImageUrl } from '~/utils/getImageUrl';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import { LogoSvg } from '../common/LogoSvg';
import { ViewLikesModal } from '../PostList/ViewLikesModal';
import Linkify from 'linkify-react';
import { RenderLink } from '../common/RenderLink';
import {
  loginModalMessage,
  useLoginModalStateContext,
} from '~/context/loginModalStateContext';

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

  verified?: boolean | null;
  developer?: boolean | null;
}

export const SinglePost = ({
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
  // setDeletePostData,
  developer,
  verified,
}: // handleSelectViewLikesPostId,
PostBoxProps) => {
  const { setMessage } = useLoginModalStateContext();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);
  const [viewLikesOpen, setViewLikesOpen] = useState(false);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const commentInputRef = useRef<HTMLInputElement>(null);
  const utils = trpc.useContext();
  const theme = useTheme();
  const [timeAgoString, setTimeAgoString] = useState<string | undefined>(
    undefined,
  );

  const [linkCopiedSnackbarOpen, setLinkCopiedSnackbarOpen] = useState(false);

  const handleSnackbarOpen = () => {
    setLinkCopiedSnackbarOpen(true);
  };

  const handleSnackbarClose = (
    event: React.SyntheticEvent | Event,
    reason?: SnackbarCloseReason,
  ) => {
    if (reason === 'clickaway') {
      return;
    }

    setLinkCopiedSnackbarOpen(false);
  };

  const handleShareClick = () => {
    const linkUrl = window.location.origin + '/post/' + _id;
    window.navigator.clipboard.writeText(linkUrl);
    handleSnackbarOpen();
  };

  const [postDeleted, setPostDeleted] = useState(false);
  const [deletePostData, setDeletePostData] = useState<null | {
    postId: string;
    postContent: string;
  }>(null);

  const [deleteCommentData, setDeleteCommentData] = useState<null | {
    commentId: string;
    commentContent: string;
  }>(null);

  useEffect(() => {
    setTimeAgoString(timeAgo.format(createdAt, 'twitter'));
  }, [createdAt]);

  const likeMutation = trpc.post.likePost.useMutation({
    onSuccess() {
      utils.post.getPostById.setData({ postId: _id }, (oldData) => {
        if (!oldData?.post) {
          return oldData;
        }
        const copy = {
          post: {
            ...oldData.post,
            hasLiked: true,
            likeCount: oldData.post.likeCount + 1,
          },
        };
        return copy;
      });
    },
    onError(error) {
      if (error.data?.code === 'UNAUTHORIZED') {
        setMessage(loginModalMessage.LIKE);
      }
    },
  });
  const unlikeMutation = trpc.post.unlikePost.useMutation({
    onSuccess() {
      utils.post.getPostById.setData({ postId: _id }, (oldData) => {
        if (!oldData?.post) {
          return oldData;
        }
        const copy = {
          post: {
            ...oldData.post,
            hasLiked: null,
            likeCount: oldData.post.likeCount - 1,
          },
        };
        return copy;
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

  const { data, hasNextPage, fetchNextPage } =
    trpc.post.comment.getCommentsByPostIdPaginated.useInfiniteQuery(
      { postId: _id, limit: 5 },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        // refetchOnWindowFocus: false,
      },
    );
  const deleteCommentMutation = trpc.post.comment.deleteComment.useMutation({
    onSuccess(data, variables) {
      utils.post.getAll.setInfiniteData({}, (oldData) => {
        if (!oldData) {
          return {
            pages: [{ posts: [], nextCursor: null }],
            pageParams: [null],
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
              pages: [{ comments: [], nextCursor: undefined }],
              pageParams: [null],
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

  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess: () => setPostDeleted(true),
  });

  const paginatedComments = data?.pages.flatMap((page) => page.comments);

  return (
    <>
      <Snackbar
        anchorOrigin={{ horizontal: 'center', vertical: 'top' }}
        open={linkCopiedSnackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        message="Link Copied"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleSnackbarClose}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      />
      <ViewLikesModal
        postId={(viewLikesOpen && _id) || null}
        onClose={() => setViewLikesOpen(false)}
      />
      {!!deletePostData && (
        <Dialog
          open={!!deletePostData}
          onClose={() => setDeletePostData(null)}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">
            Are you sure you want to delete this post?
          </DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {deletePostData?.postContent}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              color="info"
              onClick={() => {
                setDeletePostData(null);
              }}
            >
              Cancel
            </Button>
            <Button
              color="error"
              onClick={() => {
                deletePostMutation.mutate(deletePostData.postId);
              }}
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      )}
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
              color="info"
              onClick={() => {
                setDeleteCommentData(null);
              }}
            >
              Cancel
            </Button>
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
        borderBottom="1px solid rgb(56, 68, 77)"
        sx={{
          borderLeft: {
            sm: '1px solid rgb(56, 68, 77)',
          },
          borderRight: {
            sm: '1px solid rgb(56, 68, 77)',
          },
          borderTopColor: 'rgba(0,0,0,0)',
        }}
        display="flex"
        p={2}
        flexWrap="wrap"
      >
        {postDeleted ? (
          <Typography
            flexGrow={1}
            fontWeight={500}
            sx={{ opacity: 0.5 }}
            textAlign="center"
          >
            Post deleted
          </Typography>
        ) : (
          <>
            <Link
              href={`/${userId}`}
              flexShrink={0}
              flexBasis="8%"
              sx={{
                [theme.breakpoints.down('md')]: {
                  flexBasis: '20%',
                },
                pr: 2,
              }}
            >
              <Avatar src={getImageUrl(image)} alt={name} />
            </Link>
            <Box flexGrow={1}>
              <Box display="flex" justifyContent="space-between">
                <Box display="flex" alignItems="center">
                  <Link
                    sx={{ textDecoration: 'none', color: 'inherit' }}
                    href={`/${userId}`}
                  >
                    <Typography variant="h6">{name}</Typography>
                  </Link>
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
                <IconButton
                  disableFocusRipple
                  disableTouchRipple
                  onClick={handleMenuOpen}
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
                <Menu
                  open={menuOpen}
                  anchorEl={anchorEl}
                  onClose={handleMenuClose}
                >
                  {getUser.data?._id.toString() === userId ? (
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        setDeletePostData({
                          postId: _id,
                          postContent: content,
                        });
                      }}
                    >
                      <ListItemIcon>
                        <DeleteOutlineRoundedIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Delete</ListItemText>
                    </MenuItem>
                  ) : null}
                  <MenuItem
                    onClick={() => {
                      handleMenuClose();
                      handleShareClick();
                    }}
                  >
                    <ListItemIcon>
                      <InsertLinkRoundedIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Share</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
              <Typography
                variant="body1"
                sx={{ overflowWrap: 'anywhere' }}
                whiteSpace="pre-wrap"
              >
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                <Linkify options={{ render: RenderLink, target: '_blank' }}>
                  {formatText(content)}
                </Linkify>
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
                      loading="lazy"
                      src={`${process.env.NEXT_PUBLIC_CLOUDINARY_DELIVERY_URL}/${imageId}`}
                    />
                  ) : (
                    !!gifUrl && <img src={gifUrl} loading="lazy" />
                  )}
                </Box>
              )}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
              >
                <ActionButton
                  onClick={() => setViewLikesOpen(true)}
                  hoverBgColor="rgba(255, 23, 68, 0.1)"
                  Icon={
                    hasLiked ? FavoriteRoundedIcon : FavoriteBorderRoundedIcon
                  }
                  color="rgba(255, 23, 68, 1)"
                  iconAlwaysColored={!!hasLiked}
                  number={likeCount}
                  toolTip="Likes"
                />

                <ActionButton
                  onClick={() => {
                    commentInputRef.current?.focus();
                    commentInputRef.current?.scrollIntoView({
                      block: 'center',
                      inline: 'center',
                      behavior: 'smooth',
                    });
                  }}
                  hoverBgColor="rgba(0, 176, 255, 0.1)"
                  Icon={ChatBubbleOutlineRoundedIcon}
                  color="rgba(0, 176, 255, 1)"
                  number={commentCount}
                  toolTip="Comment"
                />
                <ActionButton
                  onClick={handleShareClick}
                  hoverBgColor="rgba(118, 255, 3, 0.1)"
                  Icon={ReplyRoundedIcon}
                  color="rgba(118, 255, 3, 1)"
                  toolTip="Share"
                  text="Share"
                  iconInverted
                />
              </Box>
            </Box>
            <Box
              borderTop="1px solid rgb(56, 68, 77)"
              borderBottom="1px solid rgb(56, 68, 77)"
              sx={{ flexBasis: '100%', py: 1, display: 'flex', mb: 0.5 }}
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
                  if (!hasLiked) {
                    likeMutation.mutate(_id);
                  } else {
                    unlikeMutation.mutate(_id);
                  }
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
                textAlign="center"
                bgcolor="#1E1E1E"
                borderRadius={1}
                fontSize={20}
                display="flex"
                alignItems="center"
                justifyContent="center"
                onClick={() => {
                  commentInputRef.current?.focus();
                  commentInputRef.current?.scrollIntoView({
                    block: 'center',
                    inline: 'center',
                    behavior: 'smooth',
                  });
                }}
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
                <ChatBubbleOutlineRoundedIcon fontSize="inherit" />

                <Typography
                  component="span"
                  fontSize={16}
                  flexShrink={0}
                  variant="subtitle2"
                  ml={1}
                >
                  Comment
                </Typography>
              </Box>
            </Box>

            <AddComment postId={_id} ref={commentInputRef} />
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
                developer={comment.userId.tags?.developer}
                verified={comment.userId.tags?.verified}
              />
            ))}

            {paginatedComments &&
              paginatedComments.length < commentCount &&
              hasNextPage && (
                <Typography
                  onClick={() => {
                    fetchNextPage();
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
          </>
        )}
      </Box>
    </>
  );
};
