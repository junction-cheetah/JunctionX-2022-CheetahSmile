import { NextSeo } from 'next-seo';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useEffect } from 'react';

export default function Room({ sessionId }) {
  useEffect(() => {
    const canvas = document.getElementById('roomCode');
    QRCode.toCanvas(canvas, location.href, { color: { dark: '#226AF6' } });
  }, []);

  return (
    <>
      <NextSeo title="Room" description="TODO" />
      <h2>Room</h2>
      <p>person 1: jyp</p>
      <p>person 2: su</p>
      <canvas id="roomCode"></canvas>
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
