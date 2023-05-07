import { Button } from '@mui/material';
import React from 'react';
import { trpc } from '~/utils/trpc';

const PostsList = () => {
  const {
    // status,
    error,
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = trpc.post.getAll.useInfiniteQuery(
    {},
    {
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    },
  );

  const likeMutation = trpc.post.likePost.useMutation();
  const unlikeMutation = trpc.post.unlikePost.useMutation();

  if (isLoading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>error</div>;
  }

  const posts = data.pages.flatMap((obj) => obj.posts);

  return (
    <>
      <h1>k</h1>
      <div>
        {posts.map((post) => (
          <div
            key={post._id.toString()}
            style={{ border: '1px solid #222222' }}
          >
            <p>{post.userId.name}</p>
            <img
              src={post.userId.image?.split('=')[0]}
              style={{ maxHeight: 100 }}
            />
            <p data-cy="post-content">{post.content}</p>
            <Button
              type="button"
              onClick={() => likeMutation.mutate(post._id.toString())}
            >
              Like This Post
            </Button>
            <Button
              type="button"
              color="error"
              onClick={() => unlikeMutation.mutate(post._id.toString())}
            >
              Unlike This Post
            </Button>
          </div>
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
