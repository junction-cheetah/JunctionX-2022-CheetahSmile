import styled from '@emotion/styled';
import ordinal from 'ordinal';

const Ranking = () => {
  return (
    <Wrapper>
      <h1>RANKING</h1>
      <ul>
        {[
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
          { score: 1023, name: '이수경수경' },
          { score: 857, name: '최강롯데' },
        ].map(({ score, name }, index) => (
          <li key={index}>
            <span className="ranking">{ordinal(index + 1)}</span>
            <span className="score">{score}</span>
            <span className="name">{name}</span>
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
