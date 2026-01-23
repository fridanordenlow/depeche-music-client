import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, map } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-search-bar',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchBar {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);

  searchControl = new FormControl('');

  constructor() {
    this.route.queryParams
      .pipe(
        map((params) => params['q'] || ''),
        distinctUntilChanged(),
        takeUntilDestroyed()
      )
      .subscribe((urlValue) => {
        if (urlValue !== this.searchControl.value) {
          this.searchControl.setValue(urlValue, { emitEvent: false });
          this.cdr.markForCheck();
        }
      });

    this.searchControl.valueChanges
      .pipe(debounceTime(500), distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((query) => {
        const q = query?.trim();
        this.router.navigate(['/search'], {
          queryParams: { q: q || null },
          queryParamsHandling: 'merge',
        });
      });
  }
}
