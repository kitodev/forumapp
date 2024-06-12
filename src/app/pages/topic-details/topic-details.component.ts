import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TopicDTO } from '../../dtos/topic.dto';
import {CommentDTO} from "../../dtos/comment.dto";

@Component({
  selector: 'app-topic-details',
  templateUrl: './topic-details.component.html',
  styleUrls: ['./topic-details.component.css']
})
export class TopicDetailsComponent implements OnInit {
  @Input() topic!: TopicDTO;
  @Output() editCommentEvent = new EventEmitter<{ topicId: number, comment: CommentDTO }>();
  @Output() deleteCommentEvent = new EventEmitter<{ topicId: number, commentId: number }>();
  commentForm: FormGroup;
  editCommentForm: FormGroup;
  currentUser: any;
  commentsVisibility: { [key: number]: boolean } = {};
  canEditOwnComment: boolean = false;
  canDeleteOwnComment: boolean = false;
  canDeleteOthersComment: boolean = false;
  canAddComment: boolean = false;
  selectedComment: CommentDTO | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private authService: AuthService,
    private modalService: NgbModal
  ) {
    this.commentForm = this.fb.group({
      body: ['', Validators.required]
    });

    this.editCommentForm = this.fb.group({
      body: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.checkPermissions();
    });

    this.currentUser = this.authService.currentUserValue;
    this.checkPermissions();
  }

  checkPermissions() {
    if (this.currentUser && this.currentUser.loggedIn) {
      this.apiService.getRole(this.currentUser.role).subscribe(role => {
        const rights = role.rights;
        this.canAddComment = (rights & 2) !== 0; // Add/Delete Comments
        this.canEditOwnComment = (rights & 2) !== 0; // Add/Delete Comments
        this.canDeleteOwnComment = (rights & 2) !== 0; // Add/Delete Comments
        this.canDeleteOthersComment = (rights & 8) !== 0; // Delete Others' Comments/Topics
      });
    } else {
      this.canAddComment = false;
      this.canEditOwnComment = false;
      this.canDeleteOwnComment = false;
      this.canDeleteOthersComment = false;
    }
  }

  toggleComments(commentId: number): void {
    this.commentsVisibility[commentId] = !this.commentsVisibility[commentId];
  }

  addComment(): void {
    if (!this.currentUser || !this.currentUser.loggedIn) {
      alert('You need to be logged in to add a comment.');
      return;
    }

    if (this.commentForm.valid) {
      const newComment: Partial<CommentDTO> = {
        body: this.commentForm.value.body,
        author: this.currentUser
      };

      this.apiService.addCommentToRoot(this.topic.id, newComment).subscribe((comment) => {
        this.topic.comments.push(comment);
        this.commentForm.reset();
      });
    }
  }

  openEditCommentModal(comment: CommentDTO, editCommentModal: any): void {
    this.selectedComment = comment;
    this.editCommentForm.setValue({ body: comment.body });
    this.modalService.open(editCommentModal);
  }

  editComment(modal: any): void {
    if (this.selectedComment && this.editCommentForm.valid) {
      if (this.canEditOwnComment && this.selectedComment.author.id === this.currentUser.id || this.canDeleteOthersComment) {
        const updatedComment: Partial<CommentDTO> = {
          body: this.editCommentForm.value.body
        };

        this.apiService.updateComment(this.topic.id, this.selectedComment.id, updatedComment).subscribe(() => {
          if (this.selectedComment) {
            this.selectedComment.body = this.editCommentForm.value.body;
            this.editCommentEvent.emit({topicId: this.topic.id, comment: this.selectedComment});
            modal.close();
            alert('Comment updated successfully.');
          }
        });
      } else {
        alert('You do not have permission to edit this comment.');
      }
    }
  }

  deleteComment(commentId: number): void {
    const comment = this.topic.comments.find(c => c.id === commentId);
    if (comment && (this.canDeleteOwnComment && comment.author.id === this.currentUser.id || this.canDeleteOthersComment)) {
      this.apiService.removeComment(this.topic.id, commentId).subscribe(() => {
        this.deleteCommentEvent.emit({ topicId: this.topic.id, commentId: commentId });
        alert('Comment deleted successfully.');
      });
    } else {
      alert('You do not have permission to delete this comment.');
    }
  }
}
