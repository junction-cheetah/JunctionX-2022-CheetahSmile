import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Modal } from 'loplat-ui';
import { useRouter } from 'next/router';

export default function Lobby() {
  const [open, setOpen] = useState(false);

  const router = useRouter();
  const createRoom = () => {
    router.push('/room');
  };
  useEffect(() => {
    router.prefetch('/room');
  }, [router]);

  return (
    <>
      <NextSeo title="Lobby" description="TODO" />
      <h2>Lobby</h2>
      <Button onClick={() => setOpen(true)}>Create Room</Button>
      {open && (
        <Modal isOpen={open} onClose={() => setOpen(false)}>
          <div style={{ width: 200, height: 200, background: 'white' }}>
            <input type="text" value="test" />
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
