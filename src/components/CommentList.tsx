import { Box, Button, Typography } from '@mui/material';
import React from 'react';
import { trpc } from '~/utils/trpc';

interface CommentListProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const utils = trpc.useContext();

  const getCommentsQuery =
    trpc.post.comment.getCommentsByPostId.useQuery(postId);
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
    },
  });

  if (getCommentsQuery.data) {
    return (
      <div>
        {getCommentsQuery.data.map((comment) => (
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
      </div>
    );
  }

  return null;
};
