import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { generateUniqueId } from '../utils/functions/generator';
import Image from 'next/image';
import Modal from 'react-modal';

export default function Lobby() {
  const router = useRouter();
  const createRoom = () => {
    const sessionId = generateUniqueId();
    router.push(`/room?session=${sessionId}`);
  };
  useEffect(() => {
    router.prefetch('/room');
  }, [router]);

  const [roomName, setRoomName] = useState('cheetah');
  const [open, setOpen] = useState(false);

  return (
    <>
      <NextSeo title="Lobby" description="TODO" />
      <Main>
        {open && (
          <Modal
            isOpen={open}
            onRequestClose={() => {
              setOpen(false);
            }}
            style={customStyles}
            ariaHideApp={false}
          >
            <ModalContent>
              <h2>TEAM NAME</h2>
              <input
                type="text"
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);
                }}
              />
              <button onClick={createRoom}>CREATE</button>
            </ModalContent>
          </Modal>
        )}
        {!open && (
          <>
            <button onClick={() => setOpen(true)}>
              <Image src="/icons/people.svg" width={31} height={20} alt="" />
              <span>Create Room</span>
            </button>
            <Link href="/ranking">
              <a>
                <Image src="/icons/trophy.svg" width={31} height={20} alt="" />
                <span>Ranking</span>
              </a>
            </Link>
            <Link href="/achievement">
              <a>
                <Image src="/icons/people.svg" width={31} height={20} alt="" />
                <span>Achievement</span>
              </a>
            </Link>
          </>
        )}
      </Main>
    </>
  );
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

  button,
  a {
    width: 300px;
    max-width: 90%;
    height: 60px;
    margin: 20px 0;

    display: flex;
    align-items: center;
    justify-content: center;

    text-shadow: 0 0 6px rgba(255, 255, 255, 0.64);
    font-size: 20px;
    color: white;

    border-radius: 21px;
    background-color: rgba(255, 255, 255, 0.5);
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.05) !important;
    }
  }

  span {
    opacity: 0.7;
    font-size: 18px;
    font-weight: bold;
    text-align: center;
    color: #0267ff;
    text-shadow: 0 0 3px #0267ff;

    margin-left: 4px;
  }
`;

const ModalContent = styled.div`
  width: 320px;
  max-width: 100%;
  height: 300px;
  background: white;
  border-radius: 20px;

  /* From https://css.glass */
  background: rgba(255, 255, 255, 0.4);
  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(6.7px);
  -webkit-backdrop-filter: blur(6.7px);

  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;

  h2,
  button {
    opacity: 0.7;
    font-weight: bold;
    text-shadow: 0 0 3px #0267ff;
    color: #0267ff;
    background-color: transparent;
    font-size: 20px;
  }

  button {
    background-color: #0267ff1a;
    border-radius: 21px;
    padding: 15.5px 52px 15.5px 53px;
  }

  input {
    color: #171717;
    border: none;
    border-bottom: 1px solid #0267ff;
    background-color: transparent;
    outline: none;
    font-size: 16px;
    width: 70%;
    text-align: center;
  }
`;

const customStyles = {
  overlay: {
    backgroundColor: 'transparent',
  },
  content: {
    maxWidth: '100%',
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'transparent',
    padding: 0,
    border: 'none',
  },
};
