import '../styles/globals.css';
import { DefaultSeo } from 'next-seo';
import SEO from '../seo.config';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <DefaultSeo {...SEO} />
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
