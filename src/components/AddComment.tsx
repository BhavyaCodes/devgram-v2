import { Button, TextField } from '@mui/material';
import { FormEventHandler, useRef } from 'react';
import { trpc } from '~/utils/trpc';

interface AddCommentProps {
  postId: string;
}

export const AddComment = ({ postId }: AddCommentProps) => {
  const utils = trpc.useContext();
  const addCommentMutation = trpc.post.comment.addComment.useMutation({
    onSuccess: () => utils.post.comment.getCommentsByPostId.invalidate(postId),
  });

  const commentInputRef = useRef<HTMLInputElement | null>(null);

  const handleAddComment: FormEventHandler = (e) => {
    e.preventDefault();
    if (!commentInputRef.current) {
      return;
    }
    const commentText = commentInputRef.current.value;
    addCommentMutation.mutate({
      content: commentText,
      postId: postId,
    });
  };
  return (
    <div>
      <form onSubmit={handleAddComment}>
        <TextField data-cy="comment-input" inputRef={commentInputRef} />
        <Button type="submit">Add Comment</Button>
      </form>
    </div>
  );
};
