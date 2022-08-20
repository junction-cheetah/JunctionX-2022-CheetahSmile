import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { generateUniqueId } from '../utils/functions/generator';
import Image from 'next/image';
import Modal from 'react-modal';
import { mutate } from 'swr';
import { USER_KEY } from '../swr/user';
import useNewSession from '../utils/functions/sessionConnector';

export default function Lobby() {
  const router = useRouter();
  const createRoom = () => {
    const sessionId = generateUniqueId();
    router.push(`/room?session=${sessionId}`);
  };
  useEffect(() => {
    router.prefetch('/room');
  }, [router]);

  const [roomName, setRoomName] = useState('team23');
  const [open, setOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem('aws-google-oauth-token');
    mutate(USER_KEY, null);
  };

  const a = useNewSession();

  return (
    <>
      <NextSeo title="Lobby" description="BUILD YOUR POTENTIAL!" />
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
              <Image src="/icons/people.svg" width={40} height={30} alt="" />
              <span>CREATE ROOM</span>
            </button>
            <Link href="/ranking">
              <a>
                <Image src="/icons/trophy.svg" width={40} height={33} alt="" />
                <span>RANKING</span>
              </a>
            </Link>
            <Link href="/achievement">
              <a>
                <Image src="/icons/badge.svg" width={40} height={40} alt="" />
                <span>ACHIEVEMENT</span>
              </a>
            </Link>
          </>
        )}
        <Logout onClick={logout}>
          <Image src="/icons/logout.svg" alt="" width={30} height={26} />
        </Logout>
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
    width: 132px;
    text-align: left;
    opacity: 0.7;
    font-size: 18px;
    font-weight: bold;
    color: #0267ff;
    text-shadow: 0 0 3px #0267ff;

    margin-left: 12px;
  }
`;

const ModalContent = styled.div`
  width: 320px;
  max-width: 100%;
  height: 300px;
  border-radius: 20px;

  /* From https://css.glass */
  background: rgba(255, 255, 255, 0.4);
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

const Logout = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;

  width: fit-content !important;
  height: fit-content !important;
  background-color: unset !important;
`;
