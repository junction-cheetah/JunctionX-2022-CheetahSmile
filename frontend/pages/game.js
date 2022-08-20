import { NextSeo } from 'next-seo';
import Link from 'next/link';
import styled from '@emotion/styled';
import { useLayoutEffect, useState } from 'react';

export default function Game({ sessionId }) {
  const [size, setSize] = useState({ width: 414, height: 736 });
  useLayoutEffect(() => {
    setSize({
      width: document.documentElement.clientWidth,
      height: document.documentElement.clientHeight,
    });
  }, []);

  return (
    <>
      <NextSeo title="Game" description="BUILD YOUR POTENTIAL!" />
      <Main>
        <iframe
          id="iframeExample"
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
