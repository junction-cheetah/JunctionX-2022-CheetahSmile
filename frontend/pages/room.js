import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function Room({ sessionId }) {
  return (
    <>
      <NextSeo title="Room" description="TODO" />
      <h2>Room</h2>
      <p>person 1: jyp</p>
      <p>person 2: su</p>
      <Link href={{ pathname: '/game', query: { session: sessionId } }}>
        <a>Start!</a>
      </Link>
    </>
  );
}

export async function getServerSideProps({ query }) {
  const sessionId = query.session;

  if (!sessionId) {
    return {
      redirect: {
        permanent: false,
        destination: '/lobby',
      },
    };
  }

  return {
    props: {
      sessionId,
    },
  };
}
