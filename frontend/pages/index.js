import { NextSeo } from 'next-seo';
import { useEffect } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import useAuth from '../utils/hooks/useAuth';

export default function Home() {
  const [isAuthenticated, setToken] = useAuth();

  const router = useRouter();
  const goToLobby = () => {
    router.push('/lobby');
  };
  useEffect(() => {
    router.prefetch('/lobby');
  }, [router]);

  return (
    <>
      <NextSeo title="Home" description="TODO" />
      <Main onClick={() => (isAuthenticated ? goToLobby() : null)}>
        <h2>
          BUILD <br /> YOUR <br /> POTENTIAL
        </h2>
        {isAuthenticated === 'loading' ? null : (
          <>
            {!isAuthenticated && (
              <button
                onClick={() => {
                  localStorage.setItem('cheetahToken', 'test');
                  setToken('test');
                }}
              >
                Login with Google
              </button>
            )}
            {isAuthenticated && <p>Tab to Start</p>}
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

  h2 {
    text-align: center;
    color: white;
    font-size: 40px;
    font-weight: 900;
    line-height: 1.5;

    text-shadow: 0 0 5px rgba(2, 103, 255, 0.26);

    margin-bottom: 70px;
  }

  @keyframes pulse {
    from {
      transform: scale(1);
    }
    to {
      transform: scale(1.05);
    }
  }

  button,
  p {
    width: 300px;
    max-width: 90%;
    height: 60px;

    text-align: center;
    text-shadow: 0 0 6px rgba(255, 255, 255, 0.64);
    font-size: 20px;
    color: white;
  }

  button {
    border-radius: 21px;
    background-color: rgba(255, 255, 255, 0.5);
    transition: transform 0.3s;
    &:hover {
      transform: scale(1.05) !important;
    }
  }

  p {
    animation: pulse 1s infinite alternate;
  }
`;
