import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './layout/header/header';
import { Footer } from './layout/footer/footer';
import { AuthService } from './services/auth';
import { LibraryService } from './services/library';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Depeche Music');
  private authService = inject(AuthService);
  private libraryService = inject(LibraryService);

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.libraryService.getUserLibrary().subscribe();
    }
  }
}
