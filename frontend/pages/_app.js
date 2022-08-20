import '../styles/globals.css';
import { DefaultSeo } from 'next-seo';
import SEO from '../seo.config';
import { createContext, useEffect, useState } from 'react';
import { mutate } from 'swr';
import { LOADING_KEY } from '../swr/loading';
import { Router } from 'next/router';
import Loading from '../foundations/Loading';

export const TokenContext = createContext({});

function MyApp({ Component, pageProps }) {
  const [token, setToken] = useState(null);
  useEffect(() => {
    const storageToken = localStorage.getItem('cheetahToken');
    setToken(storageToken);
  }, []);

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
      <TokenContext.Provider value={{ token, setToken }}>
        <Component {...pageProps} />
      </TokenContext.Provider>
      <Loading />
    </>
  );
}

export default MyApp;
