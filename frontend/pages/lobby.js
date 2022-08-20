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
  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <>
      <NextSeo title="Lobby" description="TODO" />
      <Main>
        <button onClick={() => setOpen(true)}>
          <Image src="/icons/people.svg" width={31} height={20} alt="" />
          <span>Create Room</span>
        </button>
        {open && (
          <Modal isOpen={open} onRequestClose={closeModal} style={customStyles}>
            <div style={{ width: 200, height: 200, background: 'white' }}>
              <input
                type="text"
                value={roomName}
                onChange={(e) => {
                  setRoomName(e.target.value);
                }}
              />
              <button onClick={createRoom}>Create Room</button>
            </div>
          </Modal>
        )}
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
      </Main>
    </>
  );
}

const Main = styled.main`
  width: 100%;
  height: 100%;
  background-color: #9dbdec;

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
    background-color: rgba(255, 255, 255, 0.4);
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

const customStyles = {
  overlay: {
    backgroundColor: 'transparent',
  },
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};
