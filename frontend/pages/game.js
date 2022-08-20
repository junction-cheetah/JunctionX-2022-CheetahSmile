import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function Game({ sessionId }) {
  return (
    <>
      <NextSeo title="Game" description="TODO" />
      <h2>Game</h2>
      <Link href={{ pathname: '/result', query: { session: sessionId } }}>
        <a>Result</a>
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
