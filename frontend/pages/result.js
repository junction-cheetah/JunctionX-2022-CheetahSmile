import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { generateUniqueId } from '../utils/functions/generator';
import { useRouter } from 'next/router';

export default function Result({ sessionId }) {
  const router = useRouter();
  const recreateGame = () => {
    const sessionId = generateUniqueId();
    router.push(`/room?session=${sessionId}`);
  };

  return (
    <>
      <NextSeo title="Result" description="TODO" />
      <h1>Result</h1>
      <Link href="/lobby">
        <a>Home</a>
      </Link>
      <button onClick={recreateGame}>Retry</button>
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
