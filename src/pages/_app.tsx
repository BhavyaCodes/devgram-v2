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
import { parse, serialize } from 'cookie';
import { roboto } from '~/utils/theme';

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
  const [mode, setMode] = useState<'dark' | 'light'>(
    modeCookieValue === 'dark' ? 'dark' : 'light',
  );

  const handleToggleTheme = () => {
    setMode((mode) => {
      const result = mode === 'dark' ? 'light' : 'dark';
      const serializedCookie = serialize('theme', result);
      window.document.cookie = serializedCookie;
      return result;
    });
  };

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1FDF64',
            dark: '#1DB954',
            // light
          },
        },
        typography: {
          fontFamily: roboto.style.fontFamily,
        },
      }),
    [mode],
  );

  const getLayout =
    Component.getLayout ??
    ((page) => (
      <CacheProvider value={emotionCache}>
        <button type="button" onClick={handleToggleTheme}>
          Toggle
        </button>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <DefaultLayout>
            <ReactQueryDevtools initialIsOpen={false} />
            {page}
            <ReactQueryDevtools />
          </DefaultLayout>
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
