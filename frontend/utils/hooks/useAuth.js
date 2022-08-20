import { useContext, useEffect, useState } from 'react';
import { TokenContext } from '../../pages/_app';

const useAuth = () => {
  const { token, setToken } = useContext(TokenContext);

  const [isAuthenticated, setIsAuthenticated] = useState('loading');
  useEffect(() => {
    setIsAuthenticated(!!token);
  }, [token]);

  return [isAuthenticated, setToken];
};
export default useAuth;
