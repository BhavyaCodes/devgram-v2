import React from 'react';
import { trpc } from '~/utils/trpc';

const PostsList = () => {
  const postsQuery = trpc.post.getAll.useQuery({});

  if (postsQuery.isLoading) {
    return <div>Loading...</div>;
  }

  if (postsQuery.error) {
    return <div>error</div>;
  }
  return (
    <div>
      {postsQuery.data.posts.map((post) => (
        <div key={post._id.toString()} style={{ border: '1px solid #222222' }}>
          <p>{post.userId.name}</p>
          <img
            src={post.userId.image?.split('=')[0]}
            style={{ maxHeight: 100 }}
          />
          <p data-cy="post-content">{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default PostsList;
