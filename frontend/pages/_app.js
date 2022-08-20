import '../styles/globals.css';
import { DefaultSeo } from 'next-seo';
import SEO from '../seo.config';
import { createContext, useEffect, useState } from 'react';

export const TokenContext = createContext({});

function MyApp({ Component, pageProps }) {
  const [token, setToken] = useState(null);
  useEffect(() => {
    const storageToken = localStorage.getItem('cheetahToken');
    setToken(storageToken);
  }, []);

  return (
    <>
      <DefaultSeo {...SEO} />
      <TokenContext.Provider value={{ token, setToken }}>
        <Component {...pageProps} />
      </TokenContext.Provider>
    </>
  );
}

export default MyApp;
