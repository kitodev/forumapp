import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { TopicDTO } from '../../dtos/topic.dto';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from '../../services/notification.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import {CommentDTO} from "../../dtos/comment.dto";

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  topics: TopicDTO[] = [];
  currentUser: any;
  canAddTopic: boolean = false;
  canEditOwnTopic: boolean = false;
  canDeleteOwnTopic: boolean = false;
  canEditOthersTopic: boolean = false;
  canDeleteOthersTopic: boolean = false;
  topicForm: FormGroup;
  editTopicForm: FormGroup;
  expandedTopicIds: number[] = [];
  loggedIn: boolean = false;
  selectedTopic: TopicDTO | null = null;

  constructor(
    private apiService: ApiService,
    protected router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private modalService: NgbModal
  ) {
    this.topicForm = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required]
    });

    this.editTopicForm = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.apiService.getTopics().subscribe((data) => {
      this.topics = data;
    });

    this.authService.currentUser.subscribe(user => {
      this.currentUser = user;
      this.checkPermissions();
    });

    this.notificationService.currentLoggedIn.subscribe(status => {
      this.loggedIn = status;
    });

    // Initial check for permissions
    this.currentUser = this.authService.currentUserValue;
    this.checkPermissions();
  }

  checkPermissions() {
    if (this.currentUser && this.currentUser.loggedIn) {
      this.apiService.getRole(this.currentUser.role).subscribe(role => {
        const rights = role.rights;
        this.canAddTopic = rights >= 4;
        this.canEditOwnTopic = rights >= 4;
        this.canDeleteOwnTopic = rights >= 4;
        this.canEditOthersTopic = rights >= 8;
        this.canDeleteOthersTopic = rights >= 8;
      });
    } else {
      this.canAddTopic = false;
      this.canEditOwnTopic = false;
      this.canDeleteOwnTopic = false;
      this.canEditOthersTopic = false;
      this.canDeleteOthersTopic = false;
    }
  }

  viewTopic(id: number): void {
    if (this.expandedTopicIds.includes(id)) {
      this.expandedTopicIds = this.expandedTopicIds.filter(topicId => topicId !== id);
    } else {
      this.expandedTopicIds.push(id);
    }
  }

  addTopic(): void {
    if (!this.currentUser || !this.currentUser.loggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    if (!this.canAddTopic) {
      alert('You do not have permission to add a topic.');
      return;
    }

    if (this.topicForm.valid) {
      const newTopic: Partial<TopicDTO> = {
        title: this.topicForm.value.title,
        body: this.topicForm.value.body,
        author: this.currentUser
      };

      this.apiService.addTopic(newTopic).subscribe((topic) => {
        this.topics.push(topic);
        this.topicForm.reset();
      });
    }
  }

  openEditModal(topic: TopicDTO, editTopicModal: any): void {
    this.selectedTopic = topic;
    this.editTopicForm.setValue({
      title: topic.title,
      body: topic.body
    });
    this.modalService.open(editTopicModal);
  }

  editTopic(modal: any): void {
    if (this.editTopicForm.valid) {
      const updatedTopic: Partial<TopicDTO> = {
        title: this.editTopicForm.value.title,
        body: this.editTopicForm.value.body
      };

      this.apiService.updateTopic(this.selectedTopic?.id ?? -1, updatedTopic).subscribe(() => {
        if (this.selectedTopic) {
          this.selectedTopic.title = this.editTopicForm.value.title;
          this.selectedTopic.body = this.editTopicForm.value.body;
          modal.close();
          alert('Topic updated successfully.');
        }
      });
    }
  }

  deleteTopic(topicId: number): void {
    const topic = this.topics.find(t => t.id === topicId);
    if (!this.canDeleteOwnTopic && (!this.canDeleteOthersTopic || topic?.author.id !== this.currentUser.id)) {
      alert('You do not have permission to delete this topic.');
      return;
    }

    this.apiService.removeTopic(topicId).subscribe(() => {
      this.topics = this.topics.filter(topic => topic.id !== topicId);
      alert('Topic deleted successfully.');
    });
  }

  handleEditComment(event: { topicId: number, comment: CommentDTO }): void {
    const topic = this.topics.find(t => t.id === event.topicId);
    const commentIndex = topic?.comments.findIndex(c => c.id === event.comment.id);
    if (topic && commentIndex !== undefined && commentIndex >= 0) {
      topic.comments[commentIndex] = event.comment;
    }
  }

  handleDeleteComment(event: { topicId: number, commentId: number }): void {
    const topic = this.topics.find(t => t.id === event.topicId);
    if (topic) {
      topic.comments = topic.comments.filter(c => c.id !== event.commentId);
    }
  }
}
