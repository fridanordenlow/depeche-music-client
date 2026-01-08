import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Search } from './pages/search/search';
import { Details } from './pages/details/details';
import { Auth } from './pages/auth/auth';
import { UserLibrary } from './pages/user-library/user-library';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'search', component: Search },
  { path: 'details/:type/:id', component: Details },
  { path: 'auth', component: Auth },
  { path: 'user-library', component: UserLibrary },
  { path: '**', redirectTo: '' },
];
