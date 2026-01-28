import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Details } from './pages/details/details';
import { Auth } from './pages/auth/auth';
import { UserLibrary } from './pages/user-library/user-library';
import { SearchResults } from './pages/search-results/search-results';
import { authGuard } from './guards/auth';
import { RecommendationForm } from './pages/recommendations/recommendation-form';
import { RecommendationDetail } from './pages/recommendation-detail/recommendation-detail';

export const routes: Routes = [
  { path: '', component: Home },
  { path: 'search', component: SearchResults },
  { path: 'details/:type/:id', component: Details },
  { path: 'auth', component: Auth },
  { path: 'library', component: UserLibrary, canActivate: [authGuard] },
  {
    path: 'recommendations/new/:type/:id',
    component: RecommendationForm,
    canActivate: [authGuard],
  },
  {
    path: 'recommendations/:id',
    component: RecommendationDetail,
  },
  { path: '**', redirectTo: '' },
];
