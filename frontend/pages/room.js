import { NextSeo } from 'next-seo';
import Link from 'next/link';
import QRCode from 'qrcode';
import { useEffect } from 'react';
import styled from '@emotion/styled';
import Image from 'next/future/image';
import { useRouter } from 'next/router';

export default function Room({ sessionId }) {
  useEffect(() => {
    const canvas = document.getElementById('roomCode');
    QRCode.toCanvas(canvas, location.href, { color: { dark: '#226AF6' } });
  }, []);

  const router = useRouter();

  return (
    <>
      <NextSeo title="Room" description="BUILD YOUR POTENTIAL!" />
      <Main>
        <Image
          src="/icons/back.svg"
          alt="←"
          width={40}
          height={35}
          style={{ position: 'fixed', top: 15, left: 10 }}
          onClick={() => router.push('/lobby')}
        />

        <canvas id="roomCode" style={{ borderRadius: 20 }}></canvas>

        <Team>
          <span>TEAM</span>
          <br />
          <span>핀란 드가자</span>
        </Team>

        <Players>
          <div className="player">
            <Image src="/polygon.svg" width={80} height={80} alt="" />
            <p>jyp930</p>
          </div>
          <div className="player">
            <Image src="/polygon.svg" width={80} height={80} alt="" />
            <p>jyp930</p>
          </div>
          <div className="player">
            <Image src="/polygon.svg" width={80} height={80} alt="" />
            <p>jyp930</p>
          </div>
          <div className="player">
            <Image src="/polygon.svg" width={80} height={80} alt="" />
            <p>jyp930</p>
          </div>
          <div className="player">
            <Image src="/polygon.svg" width={80} height={80} alt="" />
            <p>jyp930</p>
          </div>
        </Players>

        <Link href={{ pathname: '/game', query: { session: sessionId } }}>
          <a>START</a>
        </Link>
      </Main>
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

const Main = styled.main`
  width: 100%;
  height: 100%;
  background: url('/background.png') no-repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  a {
    width: 90%;
    max-width: 300px;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;

    opacity: 0.7;
    font-weight: bold;
    text-shadow: 0 0 3px #0267ff;
    color: #0267ff;
    font-size: 20px;

    border-radius: 21px;
    background-color: rgba(255, 255, 255, 0.7);
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.05) !important;
    }
  }
`;

const Team = styled.p`
  text-align: center;
  margin: 22px 0 28px;

  opacity: 0.7;
  color: #0267ff;
  text-shadow: 0 0 2px #0267ff;
  font-weight: bold;
  line-height: 1.6;
`;

const Players = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 32px;

  .player {
    position: relative;

    p {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);

      color: #0267ff;
      text-shadow: 0 0 2px #0267ff;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
    }
  }
`;
