const SERVER_API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

export const serverEndpoints = {
  root: SERVER_API_BASE_URL,
  
  internal: {
    auth: {
      root: `${SERVER_API_BASE_URL}/auth`,
      validate: (token: string) => `${SERVER_API_BASE_URL}/auth/validate/${token}`,
      refresh: `${SERVER_API_BASE_URL}/auth/refresh`,
    },
    users: {
      root: `${SERVER_API_BASE_URL}/users`,
      get: (id: string) => `${SERVER_API_BASE_URL}/users/${id}`,
      update: (id: string) => `${SERVER_API_BASE_URL}/users/${id}`,
      delete: (id: string) => `${SERVER_API_BASE_URL}/users/${id}`,
      list: `${SERVER_API_BASE_URL}/users`,
    },
  },
};
