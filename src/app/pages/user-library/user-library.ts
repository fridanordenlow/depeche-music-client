import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../services/library';
import { UserLibraryItem } from '../../models/library';
import { MatActionList, MatDivider, MatListItem } from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { AuthService } from '../../services/auth';
import { ConfirmDialog } from '../../shared/confirm-dialog/confirm-dialog';
import { Loading } from '../../shared/loading/loading';

@Component({
  selector: 'app-user-library',
  imports: [
    MatActionList,
    MatButtonModule,
    MatCardModule,
    MatDivider,
    MatDialogModule,
    MatIconModule,
    MatListItem,
    MatTabsModule,
    RouterLink,
    Loading,
  ],
  templateUrl: './user-library.html',
  styleUrl: './user-library.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserLibrary {
  private libraryService = inject(LibraryService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  public readonly currentUser = this.authService.user;
  public readonly isLoading = signal(true);

  constructor() {
    effect(() => {
      this.libraryService.getUserLibrary().subscribe({
        next: () => this.isLoading.set(false),
        error: () => this.isLoading.set(false),
      });
    });
  }

  statusTitles: Record<string, string> = {
    love: 'Loved',
    explore: 'Wish to explore',
    listened: 'Already discovered',
  };

  private allItems = computed(() => {
    return this.libraryService.userLibrary();
  });

  artists = computed(() => this.allItems().filter((item) => item.itemType === 'artist'));
  albums = computed(() => this.allItems().filter((item) => item.itemType === 'album'));
  tracks = computed(() => this.allItems().filter((item) => item.itemType === 'track'));

  getItemsByStatus(items: UserLibraryItem[], status: string): UserLibraryItem[] {
    return items.filter((item) => item.status === status);
  }

  deleteItem(libraryItemId: string) {
    if (!libraryItemId) {
      console.error('Delete failed: No ID provided');
      return;
    }

    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '300px',
      data: {
        title: 'Remove from library?',
        message: 'Are you sure you want to remove this item from your library?',
        confirmText: 'Remove',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.libraryService.removeItem(libraryItemId).subscribe({
          next: () => {
            this.snackBar.open('Removed from library', 'Close', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'bottom',
            });
          },
          error: (err) => {
            console.error('Delete failed', err);
            this.snackBar.open('Could not remove item. Try again later.', 'OK');
          },
        });
      }
    });
  }
}
