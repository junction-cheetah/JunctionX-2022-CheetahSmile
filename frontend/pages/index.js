import { NextSeo } from 'next-seo';
import { useEffect, useMemo } from 'react';
import styled from '@emotion/styled';
import { useRouter } from 'next/router';
import jwtDecode from 'jwt-decode';
import useSWR, { mutate } from 'swr';
import { USER_KEY } from '../swr/user';

export default function Home() {
  const router = useRouter();

  // router
  const goToLobby = () => {
    router.push('/lobby');
  };
  useEffect(() => {
    router.prefetch('/lobby');
  }, [router]);

  // login
  const login = () => {
    window.open(
      'https://cobuilding.auth.ap-northeast-2.amazoncognito.com/login?client_id=2jkdlb41uc8gvv3krs0uldaplf&response_type=token&scope=aws.cognito.signin.user.admin+email+openid+phone+profile&redirect_uri=https://cobuilding.vercel.app/',
      '_self'
    );
  };
  useEffect(() => {
    let token = router.asPath.split('id_token=')?.[1]?.split('&')[0];
    if (token) {
      // 방금 최초 로그인
      localStorage.setItem('aws-google-oauth-token', token);
      // NOTE: QR 코드 로그인 후 바로 방으로 입장
      const tempSession = localStorage.getItem('temp-session');
      if (tempSession) {
        localStorage.removeItem('temp-session');
        router.push(`/room?session=${tempSession}`);
      }
    } else {
      // 이미 로그인
      token = localStorage.getItem('aws-google-oauth-token');
    }

    if (token) {
      const decoded = jwtDecode(token);
      mutate(USER_KEY, { token, email: decoded.email });
    } else {
      mutate(USER_KEY, null);
    }
  }, [router]);

  const { data: user } = useSWR(USER_KEY);
  const isAuthenticated = useMemo(() => !!user, [user]);

  return (
    <>
      <NextSeo title="Co-Building" description="BUILD YOUR POTENTIAL!" />
      <Main onClick={() => (isAuthenticated ? goToLobby() : null)}>
        <h1>
          BUILD <br /> YOUR <br /> POTENTIAL
        </h1>
        {user === undefined ? null : (
          <>
            {!isAuthenticated && (
              <button onClick={login}>Login with Google</button>
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

  h1 {
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
      transform: scale(1.1);
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
    animation: pulse 0.8s infinite alternate;
  }
`;
