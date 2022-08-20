import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function Game({ sessionId }) {
  return (
    <>
      <NextSeo title="Game" description="BUILD YOUR POTENTIAL!" />
      <h1>Game</h1>
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
