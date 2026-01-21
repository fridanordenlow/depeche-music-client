export interface User {
  id: string;
  username: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  createdAt: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
  username?: string;
}

export interface LoginResponse {
  token: string;
  message: string;
  user: User;
}
