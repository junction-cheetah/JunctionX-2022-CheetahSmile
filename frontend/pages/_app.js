import '../styles/globals.css';
import { DefaultSeo } from 'next-seo';
import SEO from '../seo.config';
import { useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { LOADING_KEY } from '../swr/loading';
import { Router, useRouter } from 'next/router';
import Loading from '../foundations/Loading';
import { USER_KEY } from '../swr/user';
import jwtDecode from 'jwt-decode';
import { Toast } from 'loplat-ui';

function MyApp({ Component, pageProps }) {
  // authentication
  const router = useRouter();
  const { data: user } = useSWR(USER_KEY);
  useEffect(() => {
    if (router.pathname !== '/') {
      const storageToken = localStorage.getItem('aws-google-oauth-token');
      if (!storageToken) {
        // NOTE: QR 코드 로그인 후 바로 방으로 입장
        if (router.pathname === '/room') {
          const sessionId = router.query.session;
          const team = router.query.team;
          if (sessionId) {
            localStorage.setItem('temp-session', sessionId);
            localStorage.setItem('temp-team', team);
          }
        }
        router.replace('/');
        mutate(USER_KEY, null);
      } else {
        const decoded = jwtDecode(storageToken);
        mutate(USER_KEY, { token: storageToken, email: decoded.email });
      }
    }
  }, [router, user]);

  // page transition
  useEffect(() => {
    const start = () => {
      mutate(LOADING_KEY, true);
    };
    const end = () => {
      mutate(LOADING_KEY, false);
    };

    Router.events.on('routeChangeStart', start);
    Router.events.on('routeChangeComplete', end);
    Router.events.on('routeChangeError', end);

    return () => {
      Router.events.off('routeChangeStart', start);
      Router.events.off('routeChangeComplete', end);
      Router.events.off('routeChangeError', end);
    };
  }, []);

  return (
    <>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
      <Loading />
      <Toast mt={4} mx={2} />
    </>
  );
}

export default MyApp;
