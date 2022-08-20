import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { generateUniqueId } from '../utils/functions/generator';
import { useRouter } from 'next/router';
import styled from '@emotion/styled';
import Image from 'next/future/image';
import RankingComponent from '../containers/Ranking';

export default function Result({ sessionId }) {
  const router = useRouter();
  const recreateGame = () => {
    const sessionId = generateUniqueId();
    router.push(`/room?session=${sessionId}`);
  };

  return (
    <>
      <NextSeo title="Result" description="TODO" />
      <Main>
        <Team>
          <span>TEAM</span>
          <br />
          <span>핀란 드가자</span>
        </Team>

        <Score>503</Score>
        <You>
          <Image src="/icons/crown.svg" width={25} height={20} alt="" />
          <p>핀란 드가자</p>
        </You>

        <div
          style={{
            display: 'flex',
            width: '100%',
            justifyContent: 'center',
            marginBottom: 60,
          }}
        >
          <Link href="/lobby">
            <a>
              <span>HOME</span>
            </a>
          </Link>
          <button onClick={recreateGame}>
            <span>RETRY</span>
          </button>
        </div>

        <RankingComponent />
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
  position: relative;
  width: 100%;
  min-height: 100%;
  padding: 48px 0;
  background: url('/background.png') repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  button,
  a {
    width: 40%;
    max-width: 150px;
    height: 60px;
    margin: 20px 6px;

    display: flex;
    align-items: center;
    justify-content: center;

    border-radius: 21px;
    background-color: rgba(255, 255, 255, 0.5);
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.05) !important;
    }

    span {
      opacity: 0.7;
      text-shadow: 0 0 3px #0267ff;
      font-size: 18px;
      font-weight: bold;
      text-align: center;
      color: #0267ff;
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
  line-height: 1.8;
`;

const Score = styled.p`
  text-shadow: 0 0 20px rgba(2, 103, 255, 0.21);
  font-size: 50px;
  font-weight: 900;
  text-align: center;
  color: #fff;
  margin-bottom: 28px;
`;

const You = styled.div`
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: center;

  opacity: 0.9;
  text-shadow: 0 0 3px rgba(2, 103, 255, 0.38);
  font-size: 16px;
  font-weight: bold;
  color: #0267ff;

  p {
    margin-top: 2px;
    margin-left: 8px;
  }
`;
