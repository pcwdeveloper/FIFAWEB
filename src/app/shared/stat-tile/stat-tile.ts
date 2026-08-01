import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-stat-tile',
  imports: [],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.scss',
})
export class StatTile {
  @Input({ required: true }) label!: string;
  @Input({ required: true }) value!: string;
  @Input() icon?: string;
}
