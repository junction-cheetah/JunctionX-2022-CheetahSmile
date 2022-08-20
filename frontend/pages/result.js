import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function Result() {
  return (
    <>
      <NextSeo title="Result" description="TODO" />
      <h2>Result</h2>
      <Link href="/lobby">
        <a>Home</a>
      </Link>
      <Link href="/game">
        <a>Retry</a>
      </Link>
    </>
  );
}
