import { NextSeo } from 'next-seo';
import Link from 'next/link';

export default function Room() {
  return (
    <>
      <NextSeo title="Room" description="TODO" />
      <h2>Room</h2>
      <p>person 1: jyp</p>
      <p>person 2: su</p>
      <Link href="/game">
        <a>Start!</a>
      </Link>
    </>
  );
}
