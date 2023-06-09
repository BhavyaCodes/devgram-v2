import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import type { NextPage } from 'next';
import type { AppType, AppProps, AppContext } from 'next/app';
import { ReactElement, ReactNode, useMemo, useState } from 'react';
import { DefaultLayout } from '~/components/DefaultLayout';
import { trpc } from '~/utils/trpc';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { CacheProvider, EmotionCache } from '@emotion/react';
import createEmotionCache from '../utils/createEmotionCache';
import { parse } from 'cookie';
import { roboto } from '~/utils/theme';
import '../global.css';
import { LoginModalStateContextProvider } from '~/context/loginModalStateContext';

export type NextPageWithLayout<
  TProps = Record<string, unknown>,
  TInitialProps = TProps,
> = NextPage<TProps, TInitialProps> & {
  getLayout?: (page: ReactElement) => ReactNode;
};

export type AppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
};

const clientSideEmotionCache = createEmotionCache();

const MyApp = (({
  Component,
  pageProps,
  emotionCache = clientSideEmotionCache,
}: AppPropsWithLayout) => {
  const modeCookieValue = pageProps.colorTheme;
  const [mode] = useState<'dark' | 'light'>(
    modeCookieValue === 'dark' ? 'dark' : 'light',
  );

  // const handleToggleTheme = () => {
  //   setMode((mode) => {
  //     const result = mode === 'dark' ? 'light' : 'dark';
  //     const serializedCookie = serialize('theme', result);
  //     window.document.cookie = serializedCookie;
  //     return result;
  //   });
  // };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1FDF64',
            dark: '#1DB954',
            light: 'rgb(0, 186, 124)',
          },
          ...(mode === 'dark'
            ? {
                text: {
                  primary: 'rgb(231, 233, 234)',
                },
              }
            : {}),
        },
        typography: {
          fontFamily: roboto.style.fontFamily,
          h6: {
            fontSize: 15,
            fontWeight: 700,
            // display: 'inline',
          },
          body1: {
            fontSize: 15,
          },
          body2: {
            // opacity: 0.4,
            color: 'rgb(103, 104, 104)',
          },
        },
        // components: {
        //   MuiIconButton: {
        //     styleOverrides: {
        //       root: {
        //         '&:hover': {
        //           backgroundColor: 'rgba(0, 186,124,0.1)',
        //         },
        //       },
        //     },
        //   },
        // },
      }),
    [mode],
  );

  const getLayout =
    Component.getLayout ??
    ((page) => (
      <CacheProvider value={emotionCache}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <LoginModalStateContextProvider>
            <DefaultLayout>
              <ReactQueryDevtools initialIsOpen={false} />
              {page}
              <ReactQueryDevtools />
            </DefaultLayout>
          </LoginModalStateContextProvider>
        </ThemeProvider>
      </CacheProvider>
    ));

  return getLayout(<Component {...pageProps} />);
}) as AppType;

MyApp.getInitialProps = async (appContext: AppContext) => {
  const cookies = parse(appContext.ctx.req?.headers.cookie || '') as {
    theme?: 'light' | 'dark' | string;
  };

  const colorTheme = cookies.theme || 'dark';
  return { pageProps: { colorTheme } };
};

export default trpc.withTRPC(MyApp);
