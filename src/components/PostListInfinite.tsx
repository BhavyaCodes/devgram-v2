import React from 'react';
import { trpc } from '~/utils/trpc';

const PostsList = () => {
  const {
    status,
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
        console.log('hiiiiiiiiii');
        console.log(lastPage);
        return lastPage.nextCursor;
      },
    },
  );
  // const posts = trpc.post.getAll.useInfiniteQuery(1, {});
  // if (posts.isLoading) {
  //   return <div>Loading...</div>;
  // }

  if (isLoading) {
    return <div>Loading....</div>;
  }

  if (error) {
    return <div>error</div>;
  }

  console.log('------------ PageParams ------------');
  console.log(data.pageParams);
  console.log('------------ Pages ------------');

  console.log(data.pages);
  const posts = data.pages.flatMap((obj) => obj.posts);
  console.log(posts);
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
          </div>
        ))}
      </div>

      {hasNextPage && (
        <button onClick={() => fetchNextPage()}>Fetch More</button>
      )}
    </>
  );
};

export default PostsList;
