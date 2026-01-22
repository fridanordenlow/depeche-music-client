import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-footer',
  imports: [MatToolbarModule, MatButtonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly name = 'Frida Nordenlöw';
  readonly currentYear = signal(new Date().getFullYear());
  readonly title = 'Front End Developer';
  readonly school = 'Medieinstitutet';

  readonly githubUrl = 'https://github.com/fridanordenlow';
  readonly linkedInUrl = 'https://linkedin.com/in/fridanordenlow';
}
