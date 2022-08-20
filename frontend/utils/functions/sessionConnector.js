import axios from 'axios';

export const requestNewGameSession = (playerIds) => {
  const playerIds = playerIds.join()
  axios
      .get(`https://b9otw2e9p0.execute-api.ap-northeast-2.amazonaws.com/default/connectClientToServer?playerIds=${playerIds}`)
      .then((response) => {
          console.log(response.statusCode);
          console.log(response.body);
      })
      .catch((e) => console.log('something went wrong :(', e));
};