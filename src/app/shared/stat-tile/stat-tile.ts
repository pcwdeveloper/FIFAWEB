import { Component, Input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-stat-tile',
  imports: [MatCardModule],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.scss',
})
export class StatTile {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
}
