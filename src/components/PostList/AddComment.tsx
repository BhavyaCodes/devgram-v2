import {
  Avatar,
  Box,
  IconButton,
  InputBase,
  Paper,
  useTheme,
} from '@mui/material';
import {
  FormEventHandler,
  KeyboardEvent,
  forwardRef,
  useImperativeHandle,
  useRef,
} from 'react';
import { trpc } from '~/utils/trpc';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { getImageUrl } from '~/utils/getImageUrl';

interface AddCommentProps {
  postId: string;
}

export const AddComment = forwardRef<HTMLInputElement, AddCommentProps>(
  function AddComment({ postId }, commentInputRef) {
    const internalRef = useRef<HTMLInputElement>(null);

    useImperativeHandle<HTMLInputElement | null, HTMLInputElement | null>(
      commentInputRef,
      () => {
        return internalRef.current;
      },
      [],
    );

    // const commentInputRef = useRef<HTMLInputElement | null>(null);
    const theme = useTheme();
    const userQuery = trpc.user.getUser.useQuery();
    const utils = trpc.useContext();
    const addCommentMutation = trpc.post.comment.addComment.useMutation({
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
                  commentCount: post.commentCount + 1,
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
          {
            postId: variables.postId,
            limit: 5,
          },
          (oldData) => {
            if (!oldData) {
              const newPage = {
                comments: [data.comment],
                nextCursor: {
                  createdAt: data.comment.createdAt,
                  _id: data.comment._id.toString(),
                  exclude: true,
                },
              };

              const newPages = [newPage];

              return { pages: newPages, pageParams: [null] };
            }

            const newPage = {
              comments: [data.comment],
              nextCursor: {
                createdAt: data.comment.createdAt,
                _id: data.comment._id.toString(),
                exclude: true,
              },
            };

            const newPages = [newPage, ...oldData.pages];

            return { pages: newPages, pageParams: oldData.pageParams };
          },
        );

        if (internalRef) {
          if (internalRef.current) {
            internalRef.current.value = '';
          }
        }
      },
    });
    const userData = userQuery.data;

    const handleAddComment: FormEventHandler = (e) => {
      e.preventDefault();
      if (!internalRef.current) {
        return;
      }
      const commentText = internalRef.current.value;
      addCommentMutation.mutate({
        content: commentText,
        postId: postId,
      });
    };

    const handleUserKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleAddComment(e);
      }
    };

    return (
      <Box
        sx={{
          flexBasis: '100%',
          my: 1,
          display: 'flex',
        }}
      >
        {!!userData?.image && (
          <Box
            flexShrink={0}
            flexBasis="6%"
            alignSelf="flex-start"
            sx={{
              [theme.breakpoints.down('md')]: {
                flexBasis: '20%',
              },
              pr: 1.5,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Avatar src={getImageUrl(userData.image)} alt={userData.name} />
          </Box>
        )}
        <Paper
          elevation={6}
          sx={{
            flexGrow: 1,
            pl: 2,
            pr: 1,
            borderRadius: 2,
            alignItems: 'center',
            display: 'flex',
          }}
          component="form"
          onSubmit={handleAddComment}
        >
          <InputBase
            fullWidth
            type="text"
            required
            autoComplete="off"
            sx={{
              '&::placeholder': { color: '#71767B' },
              flexGrow: 1,
              py: 1,
            }}
            onKeyDown={handleUserKeyDown}
            multiline
            placeholder="Write a comment..."
            inputProps={{
              maxLength: 280,
            }}
            inputRef={internalRef}
          />
          <IconButton type="submit" sx={{ alignSelf: 'flex-end' }}>
            <SendRoundedIcon
              sx={{ fill: (theme) => theme.palette.primary.dark }}
            />
          </IconButton>
        </Paper>
      </Box>
    );
  },
);
