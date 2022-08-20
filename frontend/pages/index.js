import { NextSeo } from 'next-seo';
import { useState } from 'react';
import Link from 'next/link';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  return (
    <>
      <NextSeo title="Cheetah'Smile" description="TODO" />
      <h2>Build Your Potential</h2>
      {!isAuthenticated && <button>Login with Google</button>}
      {isAuthenticated && (
        <Link href="/lobby">
          <a>Tab to Start</a>
        </Link>
      )}
    </>
  );
}
