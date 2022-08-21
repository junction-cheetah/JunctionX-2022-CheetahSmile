import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import { useEffect, useLayoutEffect, useState } from 'react';
import { axiosInstance2, axiosInstance3 } from '../api';
import { useRouter } from 'next/router';
import { generateUniqueId } from '../utils/functions/generator';
import useSWR from 'swr';
import { USER_KEY } from '../swr/user';

export default function Game({ sessionId }) {
  const [size, setSize] = useState({ width: 414, height: 736 });
  useLayoutEffect(() => {
    setSize({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    });
  }, []);

  const router = useRouter();
  const { data: user } = useSWR(USER_KEY);
  useEffect(() => {
    window.addEventListener('message', function (e) {
      axiosInstance2
        .get('/default/handleGameResult', {
          params: {
            id: generateUniqueId(),
            username: user?.email?.split('@')?.[0],
            score: e.data,
          },
        })
        .then((result) => {
          console.log(result);
          router.push('/result');
        });
    });
  }, [router, user]);

  useEffect(() => {
    axiosInstance3
      .get('/default/getGameRanking')
      .then((result) => console.log(result));
  }, []);

  return (
    <>
      <NextSeo title="Game" description="BUILD YOUR POTENTIAL!" />
      <Main>
        <iframe
          id="gameIframe"
          width={size.width + 'px'}
          height={size.height + 'px'}
          src="/ingame/index.html"
        />
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
  min-height: 100%;
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
