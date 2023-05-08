import { Box, Typography } from '@mui/material';
import React from 'react';
import { trpc } from '~/utils/trpc';

interface CommentListProps {
  postId: string;
}

export const CommentList = ({ postId }: CommentListProps) => {
  const getCommentsQuery =
    trpc.post.comment.getCommentsByPostId.useQuery(postId);

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
          </Box>
        ))}
      </div>
    );
  }

  return null;
};
