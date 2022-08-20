import React from 'react';
import styled from '@emotion/styled';
import useSWR from 'swr';
import { LOADING_KEY } from '../swr/loading';
import Image from 'next/image';

const Loading = () => {
  const { data: loading } = useSWR(LOADING_KEY);

  if (!loading) return null;
  return (
    <FullContainer>
      <Image src="/star.png" alt="" width={100} height={100} />
    </FullContainer>
  );
};

export default Loading;

const FullContainer = styled.div`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;

  display: flex;
  justify-content: center;
  align-items: center;

  pointer-events: none;
  z-index: 999;

  @keyframes rotateLoading {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  animation: rotateLoading 0.8s infinite linear;
`;
