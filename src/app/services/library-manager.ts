import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LibraryService } from './library';
import { ConfirmDialog } from '../shared/confirm-dialog/confirm-dialog';

@Injectable({ providedIn: 'root' })
export class LibraryManager {
  private libraryService = inject(LibraryService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  toggleItem(
    item: {
      id: string;
      type: 'artist' | 'album' | 'track';
      status: 'love' | 'explore' | 'listened';
    },
    existing: any | null
  ) {
    if (existing && existing.status === item.status) {
      this.confirmAndRemove(existing);
      return;
    }

    if (existing) {
      this.libraryService.updateItemStatus(existing._id, item.status).subscribe({
        next: () => this.showToast('Status updated!'),
        error: (err) => this.handleError(err),
      });
    } else {
      this.libraryService.addToUserLibrary(item.id, item.type, item.status).subscribe({
        next: () => this.showToast('Added to library!'),
        error: (err) => this.handleError(err),
      });
    }
  }

  private confirmAndRemove(existing: any) {
    const dialogRef = this.dialog.open(ConfirmDialog, {
      width: '300px',
      data: {
        title: 'Item already in library',
        message: 'This item is already in your library. Do you want to remove it?',
        confirmText: 'Remove',
        cancelText: 'Cancel',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.libraryService.removeItem(existing._id).subscribe({
          next: () => this.showToast('Removed from library'),
          error: (err) => this.handleError(err),
        });
      }
    });
  }

  private showToast(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: 'app-snackbar',
    });
  }

  private handleError(err: any) {
    let message = 'Could not update library';
    if (err.status === 401 || err.status === 403) {
      message = 'Authentication required. Please log in';
    } else if (err.status === 404) {
      message = 'Item not found';
    } else if (err.error?.message) {
      message = err.error.message;
    }
    this.snackBar.open(message, 'OK', { duration: 3000, panelClass: 'app-snackbar' });
  }
}
