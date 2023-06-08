import React, { FC, useState } from 'react';
import { trpc } from '~/utils/trpc';
import { PostBox } from './PostBox';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';

const PostsList: FC<{ profileId?: string }> = ({ profileId }) => {
  const {
    // status,
    error,
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.post.getAll.useInfiniteQuery(
    {
      ...(profileId ? { profileId } : {}),
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  // const utils = trpc.useContext();

  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess(data, variables, context) {
      //variable -> postId
      // utils.post.getAll.setInfiniteData(
      //   {
      //     profileId,
      //   },
      //   (oldData) => {
      //     if (!oldData) {
      //       return {
      //         pages: [],
      //         pageParams: [],
      //       };
      //     }

      //     const newPages = oldData.pages.map((page) => {
      //       const newPosts = page.posts.filter(
      //         (post) => post._id.toString() !== variables,
      //       );
      //       return { posts: newPosts, nextCursor: page.nextCursor };
      //     });
      //     return {
      //       pageParams: oldData.pageParams,
      //       pages: newPages,
      //     };
      //   },
      // );
      deletePostData?.cb();
    },
  });

  const [deletePostData, setDeletePostData] = useState<null | {
    postId: string;
    postContent: string;
    cb: () => void;
  }>(null);

  if (isLoading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>error</div>;
  }

  const posts = data.pages.flatMap((page) => page.posts);

  return (
    <>
      <div>
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
        {posts.map((post) => (
          <PostBox
            key={post._id.toString()}
            _id={post._id.toString()}
            content={post.content}
            likeCount={post.likeCount}
            commentCount={post.commentCount}
            hasLiked={post.hasLiked}
            name={post.userId.name}
            image={post.userId.image}
            userId={post.userId._id.toString()}
            imageId={post.imageId}
            gifUrl={post.gifUrl}
            createdAt={post.createdAt}
            lastComment={post.lastComment}
            setDeletePostData={setDeletePostData}
          />
        ))}
      </div>

      {hasNextPage && !isFetchingNextPage && (
        <button onClick={() => fetchNextPage()}>Fetch More</button>
      )}
      {isFetchingNextPage && <p>Loading more posts......</p>}
    </>
  );
};

export default PostsList;
