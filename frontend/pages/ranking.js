import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import RankingComponent from '../containers/Ranking';

export default function Ranking() {
  return (
    <>
      <NextSeo title="Ranking" description="TODO" />
      <Main>
        <RankingComponent />
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
