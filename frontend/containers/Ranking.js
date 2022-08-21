import styled from '@emotion/styled';
import ordinal from 'ordinal';
import { axiosInstance3 } from '../api';
import { useEffect, useState } from 'react';

const Ranking = () => {
  const [rankings, setRankings] = useState([]);
  useEffect(() => {
    axiosInstance3
      .get('/dev/getGameRanking')
      .then((result) => setRankings(result.data.Items));
  }, []);

  return (
    <Wrapper>
      <h1>RANKING</h1>
      <ul>
        {rankings
          .sort((a, b) => b.score - a.score)
          .map(({ score, username }, index) => (
            <li key={index}>
              <span className="ranking">{ordinal(index + 1)}</span>
              <span className="score">{score}</span>
              <span className="name">{username}</span>
            </li>
          ))}
      </ul>
    </Wrapper>
  );
};
export default Ranking;

const Wrapper = styled.div`
  h1 {
    opacity: 0.7;
    text-shadow: 0 0 5px rgba(2, 103, 255, 0.21);
    font-size: 20px;
    font-weight: 500;
    color: #0267ff;
    text-align: center;
    margin-bottom: 30px;
  }

  ul {
    li {
      margin: 16px 0;
      opacity: 0.7;
      text-shadow: 0 0 5px rgba(2, 103, 255, 0.21);
      font-size: 16px;
      font-weight: 500;
      color: #0267ff;
      display: flex;

      .ranking {
        width: 60px;
      }
      .score {
        width: 60px;
      }
      .name {
      }
    }
  }
`;
