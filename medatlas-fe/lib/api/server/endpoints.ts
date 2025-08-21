const SERVER_API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api';

export const serverEndpoints = {
  root: SERVER_API_BASE_URL,
  
  internal: {
    auth: {
      root: `${SERVER_API_BASE_URL}/auth`,
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
