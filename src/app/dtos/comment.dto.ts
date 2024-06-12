import {UserDTO} from "./user.dto";

export interface CommentDTO {
  id: number;
  body: string;
  author: UserDTO;
  comments: CommentDTO[];
  removed?: boolean;
}
