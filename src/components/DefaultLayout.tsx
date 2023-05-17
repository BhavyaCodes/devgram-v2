import {
  AppBar,
  Box,
  Fab,
  Fade,
  Toolbar,
  Typography,
  useScrollTrigger,
} from '@mui/material';
import Head from 'next/head';
import { ReactNode } from 'react';
import { KeyboardArrowUp } from '@mui/icons-material';
// import logoWhite from '~/assets/logo-white.svg';
import logoBlack from '~/assets/logo-black.svg';
import logoTextBlack from '~/assets/logo-text-dark.svg';

type DefaultLayoutProps = { children: ReactNode };

function ScrollTop({ children }: { children: ReactNode }) {
  // const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    // target: window(),
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const anchor = (
      (event.target as HTMLDivElement).ownerDocument || document
    ).querySelector('#back-to-top-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Fade>
  );
}

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
          {/* <Typography variant="h6" component="div">
            Scroll to see button
          </Typography> */}
          <img src={logoBlack.src} alt="devGram logo" id="nav-logo" />
          <img src={logoTextBlack.src} alt="devGram" id="nav-logo-text" />
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />
      <main>{children}</main>
      <ScrollTop>
        <Fab size="small" aria-label="scroll back to top">
          <KeyboardArrowUp />
        </Fab>
      </ScrollTop>
    </>
  );
};
