import { UserDTO } from './user.dto';
import { CommentDTO } from './comment.dto';

export interface TopicDTO {
  id: number;
  author: UserDTO;
  title: string;
  body: string;
  comments: CommentDTO[];
}
