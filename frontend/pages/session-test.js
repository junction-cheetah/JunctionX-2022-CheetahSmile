import { NextSeo } from 'next-seo';
import Link from 'next/link';
import { io } from 'socket.io-client';
import { GameLiftClient, AcceptMatchCommand } from '@aws-sdk/client-gamelift';
import { useState,useEffect } from 'react';
import styled from '@emotion/styled';


  const socket = io('ws://15.164.221.178:8000/');
export default function SessionTest() {

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [lastPong, setLastPong] = useState(null);

  const [timer,setTimer ] = useState(0)


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

    socket.on('stacked', function (msg) {});

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
    socket.emit('stack', timer.textContent);
  }

  function start(){
    console.log("START")
    socket.emit('start', "");

  }
  function end(){
    console.log("END")
    socket.emit('end', "");
  }
  function addListener() {
  }

  return (
    <>
      <NextSeo title="Room" description="TODO" />
      <h2>{timer}</h2>
      <p>person 1: jyp</p>
      <p>person 2: su</p>
      <MyButton onClick={start}>START</MyButton>
      <MyButton onClick={end}>END</MyButton>
    </>
  );
}


const MyButton = styled.button`

width: 50%;
height: 32px;
border-radius: 4px;

`