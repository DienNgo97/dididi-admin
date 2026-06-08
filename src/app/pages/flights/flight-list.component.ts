import { Component, OnInit } from '@angular/core';
import { FlightService } from '../../api/flight.service';
import { AdminFlight, PagedResponse } from '../../core/admin-models';

@Component({
  selector: 'app-flight-list',
  templateUrl: './flight-list.component.html'
})
export class FlightListComponent implements OnInit {
  data?: PagedResponse<AdminFlight>;
  page = 0;
  size = 20;
  loading = false;
  error = '';

  constructor(private flightService: FlightService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.flightService.list(this.page, this.size).subscribe({
      next: (d) => { this.data = d; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  prev(): void { if (this.page > 0) { this.page--; this.load(); } }
  next(): void { if (this.data && this.page + 1 < this.data.totalPages) { this.page++; this.load(); } }
}
