import { NextSeo } from 'next-seo';
import styled from '@emotion/styled';
import Image from 'next/future/image';
import { useRouter } from 'next/router';

export default function Achievement() {
  const router = useRouter();

  return (
    <>
      <NextSeo title="Achievement" description="BUILD YOUR POTENTIAL!" />
      <Main>
        <h1>ACHIEVEMENT</h1>
        <Badges>
          <div className="item">
            <div className="circle" style={{ border: '3px solid #226af6' }}>
              <Image
                src="/icons/arrival.png"
                alt=""
                width={110}
                height={90}
                style={{
                  marginRight: 10,
                  marginTop: 10,
                }}
              />
            </div>
            <p>Point of arrival</p>
          </div>
          <div className="item">
            <div className="circle">
              <Image
                src="/icons/butchered.png"
                alt=""
                width={60}
                height={60}
                style={{ marginBottom: 10 }}
              />
            </div>
            <p>Butchered!</p>
          </div>
          <div className="item">
            <div className="circle lock">
              <Image src="/icons/lock.png" alt="" width={30} height={34} />
            </div>
            <p>Lucky 77</p>
          </div>
          <div className="item">
            <div className="circle lock">
              <Image src="/icons/lock.png" alt="" width={30} height={34} />
            </div>
            <p>People person</p>
          </div>
          <div className="item">
            <div className="circle lock">
              <Image src="/icons/lock.png" alt="" width={30} height={34} />
            </div>
            <p>Best host</p>
          </div>
          <div className="item">
            <div className="circle lock">
              <Image src="/icons/lock.png" alt="" width={30} height={34} />
            </div>
            <p>Drop the beat</p>
          </div>
        </Badges>

        <Image
          src="/icons/back.svg"
          alt="←"
          width={40}
          height={35}
          style={{ position: 'fixed', top: 15, left: 10 }}
          onClick={() => router.push('/lobby')}
        />
      </Main>
    </>
  );
}

const Main = styled.main`
  width: 100%;
  min-height: 100%;
  padding: 48px 16px;
  background: url('/background.png') repeat center center fixed;
  -webkit-background-size: cover;
  -moz-background-size: cover;
  -o-background-size: cover;
  background-size: cover;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  h1 {
    opacity: 0.7;
    text-shadow: 0 0 5px rgba(2, 103, 255, 0.21);
    font-size: 20px;
    font-weight: 500;
    color: #0267ff;
    text-align: center;
    margin-bottom: 30px;
  }
`;

const Badges = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;

  & > .item {
    margin: 20px 4px;

    & > .circle {
      width: 94px;
      height: 94px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      margin-bottom: 8px;

      display: flex;
      align-items: center;
      justify-content: center;
    }
    & > .lock {
      background-color: rgba(2, 103, 255, 0.14);
    }
    p {
      opacity: 0.7;
      font-size: 12px;
      font-weight: bold;
      text-align: center;
      color: #0267ff;
    }
  }
`;
