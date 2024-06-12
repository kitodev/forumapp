import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { UserDTO } from '../dtos/user.dto';
import { RoleDTO } from '../dtos/role.dto';
import { TopicDTO } from '../dtos/topic.dto';
import { CommentDTO } from '../dtos/comment.dto';
import { ApiResponse } from '../dtos/response.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private baseUrl = environment.api;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<UserDTO[]> {
    return this.http.get<ApiResponse<UserDTO[]>>(`${this.baseUrl}/users`).pipe(
      map(response => response.data)
    );
  }

  getUser(id: number): Observable<UserDTO> {
    return this.http.get<ApiResponse<UserDTO>>(`${this.baseUrl}/user/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateUser(id: number, data: Partial<UserDTO>): Observable<UserDTO> {
    return this.http.put<ApiResponse<UserDTO>>(`${this.baseUrl}/user/${id}`, data).pipe(
      map(response => response.data)
    );
  }

  changePassword(id: number, password1: string, password2: string): Observable<UserDTO> {
    return this.http.put<ApiResponse<UserDTO>>(`${this.baseUrl}/user/${id}/password`, { password1, password2 }).pipe(
      map(response => response.data)
    );
  }

  getRoles(): Observable<RoleDTO[]> {
    return this.http.get<ApiResponse<RoleDTO[]>>(`${this.baseUrl}/roles`).pipe(
      map(response => response.data)
    );
  }

  getRole(id: number): Observable<RoleDTO> {
    return this.http.get<ApiResponse<RoleDTO>>(`${this.baseUrl}/role/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateRole(id: number, data: Partial<RoleDTO>): Observable<RoleDTO> {
    return this.http.put<ApiResponse<RoleDTO>>(`${this.baseUrl}/role/${id}`, data).pipe(
      map(response => response.data)
    );
  }

  getUsersOfRole(roleId: number): Observable<UserDTO[]> {
    return this.http.get<ApiResponse<UserDTO[]>>(`${this.baseUrl}/role/${roleId}/users`).pipe(
      map(response => response.data)
    );
  }

  getTopics(): Observable<TopicDTO[]> {
    return this.http.get<ApiResponse<TopicDTO[]>>(`${this.baseUrl}/topics`).pipe(
      map(response => response.data)
    );
  }

  addTopic(topic: Partial<TopicDTO>): Observable<TopicDTO> {
    return this.http.post<ApiResponse<TopicDTO>>(`${this.baseUrl}/topic/add`, topic).pipe(
      map(response => response.data)
    );
  }

  getTopic(id: number): Observable<TopicDTO> {
    return this.http.get<ApiResponse<TopicDTO>>(`${this.baseUrl}/topic/${id}`).pipe(
      map(response => response.data)
    );
  }

  updateTopic(id: number, data: Partial<TopicDTO>): Observable<TopicDTO> {
    return this.http.post<ApiResponse<TopicDTO>>(`${this.baseUrl}/topic/${id}`, data).pipe(
      map(response => response.data)
    );
  }

  removeTopic(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/topic/${id}`).pipe(
      map(response => response.data)
    );
  }

  addCommentToRoot(topicId: number, comment: Partial<CommentDTO>): Observable<CommentDTO> {
    return this.http.post<ApiResponse<CommentDTO>>(`${this.baseUrl}/topic/${topicId}/comment/add`, comment).pipe(
      map(response => response.data)
    );
  }

  updateComment(topicId: number, commentId: number, data: Partial<CommentDTO>): Observable<CommentDTO> {
    return this.http.put<ApiResponse<CommentDTO>>(`${this.baseUrl}/topic/${topicId}/comment/${commentId}`, data).pipe(
      map(response => response.data)
    );
  }

  removeComment(topicId: number, commentId: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/topic/${topicId}/comment/${commentId}`).pipe(
      map(response => response.data)
    );
  }

  addCommentToComment(topicId: number, commentId: number, comment: Partial<CommentDTO>): Observable<CommentDTO> {
    return this.http.post<ApiResponse<CommentDTO>>(`${this.baseUrl}/topic/${topicId}/comment/${commentId}/add`, comment).pipe(
      map(response => response.data)
    );
  }
}
