import { AppBar, Toolbar } from '@mui/material';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import { ReactNode } from 'react';
import logoBlack from '~/assets/logo-black.svg';
import logoTextBlack from '~/assets/logo-text-dark.svg';

const DynamicScrollToTop = dynamic(() => import('./ScrollToTop'), {
  ssr: false,
});

type DefaultLayoutProps = { children: ReactNode };

export const DefaultLayout = ({ children }: DefaultLayoutProps) => {
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
          }}
        >
          <img src={logoBlack.src} alt="devGram logo" id="nav-logo" />
          <img src={logoTextBlack.src} alt="devGram" id="nav-logo-text" />
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />
      <main>{children}</main>
      <DynamicScrollToTop />
    </>
  );
};
