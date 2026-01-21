import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserLibraryItem } from '../models/library';

@Injectable({
  providedIn: 'root',
})
export class LibraryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://depeche-music-api.onrender.com/api/library';

  addToUserLibrary(
    spotifyItemId: string,
    itemType: 'artist' | 'album' | 'track',
    status: 'love' | 'explore' | 'listened'
  ) {
    return this.http.post(`${this.apiUrl}/add`, {
      spotifyItemId,
      itemType,
      status,
    });
  }

  getUserLibrary() {
    return this.http.get(`${this.apiUrl}/get`);
  }

  updateItemStatus(libraryItemId: string, newStatus: 'love' | 'explore' | 'listened') {
    return this.http.put<{ message: string; updatedItem: UserLibraryItem }>(
      `${this.apiUrl}/update/${libraryItemId}`,
      { status: newStatus }
    );
  }

  removeItem(libraryItemId: string) {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/remove/${libraryItemId}`);
  }
}
