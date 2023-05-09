import { Button, TextField } from '@mui/material';
import { FormEventHandler, useRef } from 'react';
import { trpc } from '~/utils/trpc';

interface AddCommentProps {
  postId: string;
}

export const AddComment = ({ postId }: AddCommentProps) => {
  const commentInputRef = useRef<HTMLInputElement | null>(null);
  const utils = trpc.useContext();
  const addCommentMutation = trpc.post.comment.addComment.useMutation({
    onSuccess(data, variables) {
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
        },
        (oldData) => {
          if (!oldData) {
            return {
              pages: [],
              pageParams: [],
            };
          }

          const newPage = {
            comments: [data.comment],
          };

          const newPages = [newPage, ...oldData.pages];

          return { pages: newPages, pageParams: oldData.pageParams };
        },
      );

      if (commentInputRef.current) {
        commentInputRef.current.value = '';
      }
    },
  });

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
