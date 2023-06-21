import { Box, IconButton } from '@mui/material';
import { LogoSvgWhite } from '../../common/LogoSvgWhite';
import Link from '../../common/Link';
import { LeftBarOption } from './LeftBarOption';
import { useRouter } from 'next/router';

//icons
import HomeIcon from '@mui/icons-material/Home';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { trpc } from '~/utils/trpc';
import { ProfileButton } from './ProfileButton';

export const LeftBar = () => {
  const { data, isLoading } = trpc.user.getUser.useQuery(undefined, {
    staleTime: 60000,
  });

  const router = useRouter();

  return (
    <>
      <Box position="sticky" top={0}>
        <Box p={2}>
          <Link href="/" mb={2} display="block">
            <IconButton sx={{ p: 1.5, ml: -1.5 }}>
              <LogoSvgWhite width={30} />
            </IconButton>
          </Link>

          {!isLoading && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="flex-start"
            >
              <LeftBarOption
                href="/"
                text="Home"
                isActive={router.pathname === '/'}
              >
                {router.pathname === '/' ? (
                  <HomeIcon sx={{ fontSize: 26 }} />
                ) : (
                  <HomeOutlinedIcon sx={{ fontSize: 26 }} />
                )}
              </LeftBarOption>
              {data && (
                <LeftBarOption
                  href={`/${data._id.toString()}`}
                  text="Profile"
                  isActive={router.asPath === `/${data._id.toString()}`}
                >
                  {router.asPath === `/${data._id.toString()}` ? (
                    <PersonIcon sx={{ fontSize: 26 }} />
                  ) : (
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 26 }} />
                  )}
                </LeftBarOption>
              )}
            </Box>
          )}
        </Box>
      </Box>
      {data && (
        <Box
          position="fixed"
          bottom={0} //alignSelf="flex-end"
        >
          <Box p={2}>
            <ProfileButton />
          </Box>
        </Box>
      )}
    </>
  );
};
