import { NextPage } from 'next';
import { FollowersHeaderLayout } from '~/components/FollowersHeaderLayout';

const Followers: NextPage = () => {
  return (
    <>
      <FollowersHeaderLayout selected="followers" />
    </>
  );
};

export default Followers;
