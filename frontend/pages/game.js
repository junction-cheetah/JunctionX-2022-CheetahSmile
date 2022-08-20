import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function Game() {
  return (
    <>
      <NextSeo title="Game" description="TODO" />
      <h2>Game</h2>
      <Link href="/result">
        <a>Result</a>
      </Link>
    </>
  );
}
