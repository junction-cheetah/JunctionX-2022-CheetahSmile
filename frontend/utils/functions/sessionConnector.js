import { useEffect } from 'react';
import useSWR from 'swr';
import { USER_KEY } from '../../swr/user';
import axiosInstance from '../../api';

const useNewSession = () => {
  const { data: user } = useSWR(USER_KEY);

  useEffect(() => {
    axiosInstance
      .get('/default/connectClientToServer?playerIds=test1,test2,test3')
      .then((response) => {
        console.log(response.statusCode);
        console.log(response.body);
      })
      .catch((e) => console.log('something went wrong :(', e));
  }, []);

  return null;
};
export default useNewSession;
