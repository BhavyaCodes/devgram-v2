import React, { FC, useCallback, useState } from 'react';
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
import { ViewLikesModal } from './ViewLikesModal';

const PostsList: FC<{ profileId?: string; followingOnly?: boolean }> = ({
  profileId,
  followingOnly,
}) => {
  const [selectedViewLikesPostId, setSelectedViewLikesPostId] = useState<
    null | string
  >(null);

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
      followingOnly,
    },
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  const deletePostMutation = trpc.post.deletePost.useMutation({
    onSuccess() {
      deletePostData?.cb();
    },
  });

  const handleSelectViewLikesPostId = useCallback((postId: string) => {
    setSelectedViewLikesPostId(postId);
  }, []);

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
      <ViewLikesModal
        postId={selectedViewLikesPostId}
        onClose={() => setSelectedViewLikesPostId(null)}
      />
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
            developer={post.userId.tags?.developer}
            verified={post.userId.tags?.verified}
            handleSelectViewLikesPostId={handleSelectViewLikesPostId}
            followingOnly={followingOnly}
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
