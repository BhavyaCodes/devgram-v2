import { Button, Typography } from '@mui/material';
import React from 'react';
import { trpc } from '~/utils/trpc';

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
  content: string;
  likeCount: number;
  /**
   * Logged in user has liked the post
   */
  hasLiked?: boolean | null;
}

export const PostBox = ({
  _id,
  name,
  image,
  content,
  likeCount,
  hasLiked,
}: PostBoxProps) => {
  const utils = trpc.useContext();
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

  return (
    <div style={{ border: '1px solid #222222' }}>
      <p>{name}</p>
      <img src={image?.split('=')[0]} style={{ maxHeight: 100 }} />
      <p data-cy="post-content">{content}</p>
      <Typography>Like Count: {likeCount}</Typography>
      {hasLiked ? (
        <>
          <Typography variant="subtitle1">You liked this</Typography>
          <Button
            type="button"
            color="error"
            onClick={() => unlikeMutation.mutate(_id)}
          >
            Unlike This Post
          </Button>
        </>
      ) : (
        <Button type="button" onClick={() => likeMutation.mutate(_id)}>
          Like This Post
        </Button>
      )}
    </div>
  );
};
