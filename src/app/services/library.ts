import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { UserLibraryItem } from '../models/library';
import { of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://depeche-music-api.onrender.com/api/library';

  // Signal to hold the user's library items
  private _userLibrary = signal<UserLibraryItem[]>([]);

  ///
  // DETTA FUNGERAR INTE SOM DET SKA
  ///
  private libraryLoaded = false;

  // Readonly version of the user library signal
  public userLibrary = this._userLibrary.asReadonly();

  getUserLibrary() {
    if (this.libraryLoaded) return of(this._userLibrary());
    return this.http.get<UserLibraryItem[]>(`${this.apiUrl}/get`).pipe(
      tap((items) => {
        // Update the signal with the fetched items
        this._userLibrary.set(items);
        this.libraryLoaded = true;
      })
    );
  }

  addToUserLibrary(
    spotifyItemId: string,
    itemType: 'artist' | 'album' | 'track',
    status: 'love' | 'explore' | 'listened'
  ) {
    return this.http
      .post<{ message: string; item: UserLibraryItem }>(`${this.apiUrl}/add`, {
        spotifyItemId,
        itemType,
        status,
      })
      .pipe(
        tap((response) => {
          // Update the signal with the newly added item
          this._userLibrary.update((items) => [...items, response.item]);
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
        })
      );
  }
}
