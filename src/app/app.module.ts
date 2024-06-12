import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './pages/home/home.component';
import { TopicDetailsComponent } from './pages/topic-details/topic-details.component';
import { HeaderComponent } from './shared/header/header.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { AdminComponent } from './pages/admin/admin.component';
import { LoginComponent } from './pages/login/login.component';
import { HttpClientModule } from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AuthGuard} from "./auth.guard";
import {ApiService} from "./services/api.service";
import {AuthService} from "./services/auth.service";
import {NotificationService} from "./services/notification.service";
import {NgbModule} from "@ng-bootstrap/ng-bootstrap";
import {DragDropModule} from "@angular/cdk/drag-drop";

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    TopicDetailsComponent,
    HeaderComponent,
    ProfileComponent,
    AdminComponent,
    LoginComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    NgbModule,
    DragDropModule,
  ],
  providers: [NotificationService, AuthService, ApiService, AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
