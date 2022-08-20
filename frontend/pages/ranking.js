import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import RankingComponent from '../containers/Ranking';
import Image from 'next/future/image';
import { useRouter } from 'next/router';

export default function Ranking() {
  const router = useRouter();

  return (
    <>
      <NextSeo title="Ranking" description="BUILD YOUR POTENTIAL!" />
      <Main>
        <RankingComponent />
        <Image
          src="/icons/back.svg"
          alt="←"
          width={40}
          height={35}
          style={{ position: 'fixed', top: 15, left: 10 }}
          onClick={() => router.push('/lobby')}
        />
      </Main>
    </>
  );
}

const Main = styled.main`
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
`;
