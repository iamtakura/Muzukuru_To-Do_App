export interface User {
  id: number;
  username: string;
}

export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  owner_id: number;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, username: string) => void;
  logout: () => void;
  setUserInfo: (user: User) => void;
}

export interface ApiError {
  detail: string | { msg: string; type: string }[];
}
