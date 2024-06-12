export interface UserDTO {
  id: number;
  name: string;
  email: string;
  password: string;
  role: number;
  loggedIn?: boolean;
}
