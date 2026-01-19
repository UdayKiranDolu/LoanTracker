const TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

const tokenService = {
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem(TOKEN_KEY, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
  
  getAccessToken: () => {
    return localStorage.getItem(TOKEN_KEY);
  },
  
  getRefreshToken: () => {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },
  
  clearTokens: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

export default tokenService;