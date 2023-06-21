import { Box, Container, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactNode, useEffect } from 'react';
import { LeftBar } from './LeftBar/LeftBar';

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
  const theme = useTheme();

  useEffect(() => {
    console.log(theme.palette.mode);
  });
  return (
    <>
      <Head>
        <title>devGram</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box height={0} id="back-to-top-anchor" />

      <Container maxWidth="lg" component="main" disableGutters>
        <Box display="flex" alignItems="stretch" justifyContent="center">
          <Box flexGrow={1} display="flex" flexDirection="column">
            <LeftBar />
          </Box>
          <Box flexBasis="600px" maxWidth="100%" flexShrink={0}>
            {children}
          </Box>
          <Box flexGrow={1}>
            <LeftBar />
          </Box>
        </Box>
      </Container>

      <DynamicScrollToTop />
    </>
  );
};
