import { Component, computed, inject, resource, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LibraryService } from '../../services/library';
import { UserLibraryItem } from '../../models/library';
import { MatActionList, MatDivider, MatListItem } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-user-library',
  imports: [
    MatActionList,
    MatButtonModule,
    MatCardModule,
    MatDivider,
    MatIconModule,
    MatListItem,
    MatProgressSpinner,
    MatTabsModule,
  ],
  templateUrl: './user-library.html',
  styleUrl: './user-library.scss',
})
export class UserLibrary {
  private libraryService = inject(LibraryService);

  statusTitles: Record<string, string> = {
    love: 'Loved',
    explore: 'Wish to explore',
    listened: 'Already listened',
  };

  // resource() creates a signal that handles async data fetching
  libraryResource = resource({
    loader: async () => {
      // Convert the Observable returned by getUserLibrary() to a Promise
      const items = await firstValueFrom(this.libraryService.getUserLibrary());
      console.log(items);
      return items as UserLibraryItem[];
    },
  });

  private allItems = computed(() => {
    if (this.libraryResource.error()) {
      return [];
    }
    return this.libraryResource.value() ?? [];
  });

  artists = computed(() => this.allItems().filter((item) => item.itemType === 'artist'));
  albums = computed(() => this.allItems().filter((item) => item.itemType === 'album'));
  tracks = computed(() => this.allItems().filter((item) => item.itemType === 'track'));

  deleteItem(libraryItemId: string) {
    this.libraryService.removeItem(libraryItemId).subscribe(() => {
      this.libraryResource.reload();
    });
  }
}
