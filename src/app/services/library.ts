import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { UserLibraryItem } from '../models/library';
import { catchError, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://depeche-music-api.onrender.com/api/library';

  // Signal to hold the user's library items
  private _userLibrary = signal<UserLibraryItem[]>([]);
  // Readonly version of the user library signal
  public userLibrary = this._userLibrary.asReadonly();

  getUserLibrary() {
    return this.http.get<UserLibraryItem[]>(`${this.apiUrl}/get`).pipe(
      tap((items) => {
        this._userLibrary.set(items);
      }),
      catchError((error) => {
        console.error('Failed to fetch user library:', error);
        throw error;
      })
    );
  }

  addToUserLibrary(spotifyItemId: string, itemType: string, status: string) {
    return this.http
      .post<{ message: string; item: UserLibraryItem }>(`${this.apiUrl}/add`, {
        spotifyItemId,
        itemType,
        status,
      })
      .pipe(
        tap((response) => {
          this._userLibrary.update((items) => [...items, response.item]);
        }),
        catchError((error) => {
          console.error('Failed to add item to library:', error);
          throw error;
        })
      );
  }

  updateItemStatus(libraryItemId: string, newStatus: 'love' | 'explore' | 'listened') {
    return this.http
      .put<{ message: string; updatedItem: UserLibraryItem }>(
        `${this.apiUrl}/update/${libraryItemId}`,
        { status: newStatus }
      )
      .pipe(
        tap((response) => {
          this._userLibrary.update((items) =>
            items.map((item) => (item._id === libraryItemId ? response.updatedItem : item))
          );
        }),
        catchError((error) => {
          console.error('Failed to update item status:', error);
          throw error;
        })
      );
  }

  removeItem(libraryItemId: string) {
    return this.http
      .delete<{ message: string; deletedItem: UserLibraryItem }>(
        `${this.apiUrl}/remove/${libraryItemId}`
      )
      .pipe(
        tap(() => {
          this._userLibrary.update((items) => items.filter((item) => item._id !== libraryItemId));
        }),
        catchError((error) => {
          console.error('Failed to delete item:', error);
          throw error;
        })
      );
  }
}
