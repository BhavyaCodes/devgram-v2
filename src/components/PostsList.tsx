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
      <ul>
        {posts.data.map((post) => (
          <li key={post._id.toString()}>{post.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default PostsList;
