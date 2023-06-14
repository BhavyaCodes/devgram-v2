import { NextPage } from 'next';
import { FollowersHeaderLayout } from '~/components/FollowersHeaderLayout';

const Following: NextPage = () => {
  return (
    <div>
      <FollowersHeaderLayout selected="following" />
    </div>
  );
};

export default Following;
