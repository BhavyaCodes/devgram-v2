import { Box, Container } from '@mui/material';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactNode } from 'react';
import { LeftBar } from './LeftBar';
import { RightBar } from './RightBar';

const DynamicScrollToTop = dynamic(() => import('./ScrollToTop'), {
  ssr: false,
});

type DefaultLayoutProps = {
  children: ReactNode;
  // toggleTheme: () => void
};

// const Offset = styled('div')(({ theme }) => theme.mixins.toolbar);

export const DefaultLayout = ({
  children,
}: // toggleTheme,
DefaultLayoutProps) => {
  return (
    <>
      <Head>
        <title>devGram</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box height={0} id="back-to-top-anchor" />

      <Container maxWidth="lg" component="main" disableGutters>
        <Box display="flex" alignItems="stretch" justifyContent="center">
          <Box
            flexDirection="column"
            sx={{
              display: {
                xs: 'none',
                sm: 'flex',
              },
              flexGrow: {
                xs: 0,
                lg: 1,
              },
            }}
          >
            <LeftBar />
          </Box>
          <Box flexBasis="600px" maxWidth="100%" flexShrink={1}>
            {children}
          </Box>
          <Box
            flexGrow={1}
            flexShrink={0}
            flexDirection="column"
            sx={{
              display: {
                xs: 'none',
                md: 'flex',
              },
            }}
          >
            <RightBar />
          </Box>
        </Box>
      </Container>

      <DynamicScrollToTop />
    </>
  );
};
