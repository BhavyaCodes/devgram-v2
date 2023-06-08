import { useRouter } from 'next/router';
import React from 'react';

const ProfilePage = () => {
  const router = useRouter();
  console.log(router);
  const profileId = router.query.id as string;
  return <div>{profileId}</div>;
};

export default ProfilePage;
