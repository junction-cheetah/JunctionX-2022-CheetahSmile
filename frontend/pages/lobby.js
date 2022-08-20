import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Modal } from 'loplat-ui';
import { useRouter } from 'next/router';
import { generateUniqueId } from '../utils/functions/generator';

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
      <h2>Lobby</h2>
      <Button onClick={() => setOpen(true)}>Create Room</Button>
      {open && (
        <Modal isOpen={open} onClose={closeModal}>
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
      <Link href="/achievement">
        <a>Achievement</a>
      </Link>
      <br />
      <Link href="/ranking">
        <a>Ranking</a>
      </Link>
    </>
  );
}

const Button = styled.button`
  display: block;
`;
