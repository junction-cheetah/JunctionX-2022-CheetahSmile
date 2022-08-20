import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { GameLiftClient, AcceptMatchCommand } from '@aws-sdk/client-gamelift';
import { useState, useEffect, useRef } from 'react';
import styled from '@emotion/styled';

const socket = io('ws://15.164.221.178:8000/');
export default function SessionTest() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);

  const [stackData, setStackData] = useState([]);

  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (stackData.length > 0) {
      scrollUp();
    }
  }, [stackData]);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('pong', () => {
      setLastPong(new Date().toISOString());
    });

    socket.on('stacked', function (msg) {
      setStackData(msg.stack);
      console.log(msg);
    });

    socket.on('timer', function (time) {
      setTimer(time);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('pong');
      socket.off('stacked');
      socket.off('timer ');
    };
  }, []);

  const sendPing = () => {
    socket.emit('ping');
  };

  function stack() {
    socket.emit('stack', { clientTime: timer });
  }

  function start() {
    console.log('START');
    socket.emit('start', '');
  }
  function end() {
    console.log('END');
    socket.emit('end', '');
  }
  function addListener() {}

  const stackList = stackData.map((data, index) => {
    return <h3 key={index}> {data.serverTime}</h3>;
  });
  const stackContainerRef = useRef(null);

  function scrollDown() {
    stackContainerRef.current.scrollTop =
      stackContainerRef.current.scrollHeight;
  }
  function scrollUp() {
    stackContainerRef.current.scrollTop =
      stackContainerRef.current.scrollHeight;
  }

  return (
    <BigContainer>
      <NextSeo title="Room" description="TODO" />
      <h2>{timer}</h2>
      <p>person 1: jyp</p>
      <p>person 2: su</p>
      <StackContainer ref={stackContainerRef}>{stackList}</StackContainer>
      <RowContainer>
        <MyButton onClick={stack}>Stack</MyButton>
      </RowContainer>

      <RowContainer>
        <MyButton onClick={start}>START</MyButton>
        <MyButton onClick={end}>END</MyButton>
      </RowContainer>
    </BigContainer>
  );
}

const MyButton = styled.button`
  flex: 1;
  height: 32px;
  border-radius: 4px;
  margin: 5px 0;
`;

const RowContainer = styled.div`
  display: flex;
  justify-content: space-around;
`;
const StackContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column-reverse;
  justify-content: space-around;
  overflow: auto;
`;
const BigContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 100vh;
  width: 100vw;
`;
