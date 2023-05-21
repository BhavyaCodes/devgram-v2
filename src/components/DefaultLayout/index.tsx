import { AppBar, Box, Container, Toolbar, useTheme } from '@mui/material';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactNode, useEffect } from 'react';
import logoBlack from '~/assets/logo-black.svg';
import logoTextBlack from '~/assets/logo-text-dark.svg';
import { DarkModeSwitch } from 'react-toggle-dark-mode';
import Link from 'next/link';

const DynamicScrollToTop = dynamic(() => import('./ScrollToTop'), {
  ssr: false,
});

type DefaultLayoutProps = { children: ReactNode; toggleTheme: () => void };

export const DefaultLayout = ({
  children,
  toggleTheme,
}: DefaultLayoutProps) => {
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
      <AppBar enableColorOnDark>
        <Toolbar
          sx={{
            p: 2,
            '& #nav-logo': { width: 30 },
            '& #nav-logo-text': { width: 100, ml: 1 },
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Link href="/">
            <Box display="flex" alignItems="center">
              <img src={logoBlack.src} alt="devGram logo" id="nav-logo" />
              <img src={logoTextBlack.src} alt="devGram" id="nav-logo-text" />
            </Box>
          </Link>
          <Box display="flex" alignItems="center">
            <DarkModeSwitch
              // style={{ marginBottom: '2rem' }}
              checked={theme.palette.mode === 'dark'}
              onChange={toggleTheme}
              size={30}
              moonColor="#000"
            />
          </Box>
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />

      <Container maxWidth="md" component="main">
        {children}
      </Container>

      <DynamicScrollToTop />
    </>
  );
};
