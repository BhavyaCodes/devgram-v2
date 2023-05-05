import React from 'react';
import { trpc } from '~/utils/trpc';

const PostsList = () => {
  const posts = trpc.post.getAll.useQuery();

  if (posts.isLoading) {
    return <div>Loading...</div>;
  }

  if (posts.error) {
    return <div>error</div>;
  }
  return (
    <div>
      {posts.data.map((post) => (
        <div key={post._id.toString()} style={{ border: '1px solid #222222' }}>
          <p>{post.userId.name}</p>
          <img
            src={post.userId.image?.split('=')[0]}
            style={{ maxHeight: 100 }}
          />
          <p>{post.content}</p>
        </div>
      ))}
    </div>
  );
};

export default PostsList;
