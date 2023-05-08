import React from 'react';
import { trpc } from '~/utils/trpc';
import { PostBox } from './PostBox';

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

  if (isLoading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>error</div>;
  }

  const posts = data.pages.flatMap((obj) => obj.posts);

  return (
    <>
      <div>
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
