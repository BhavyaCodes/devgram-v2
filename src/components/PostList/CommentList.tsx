import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { trpc } from '~/utils/trpc';

interface CommentListInfiniteProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListInfiniteProps) => {
  const utils = trpc.useContext();

  const {
    error,
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.post.comment.getCommentsByPostIdPaginated.useInfiniteQuery(
    { postId },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
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
        { postId: variables.postId },
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

  if (isLoading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>error</div>;
  }

  const comments = data?.pages.flatMap((page) => page.comments);

  return (
    <div>
      {comments.map((comment) => (
        <Box key={comment._id.toString()} sx={{ border: '1px solid #ccc' }}>
          {!!comment.userId.image && (
            <img style={{ height: 30 }} src={comment.userId.image} />
          )}
          <Typography component="span" variant="body1">
            {comment.content}
          </Typography>
          <Button
            type="button"
            onClick={() => {
              deleteCommentMutation.mutate({
                postId,
                commentId: comment._id.toString(),
              });
            }}
          >
            Delete Comment
          </Button>
        </Box>
      ))}
      {hasNextPage && !isFetchingNextPage && (
        <button onClick={() => fetchNextPage()}>Load More</button>
      )}
      {isFetchingNextPage && <p>Loading more comments......</p>}
    </div>
  );

  return null;
};
