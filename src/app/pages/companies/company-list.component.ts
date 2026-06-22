import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from '../../api/company.service';
import { Company } from '../../core/admin-models';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html'
})
export class CompanyListComponent implements OnInit {
  allCompanies: Company[] = [];
  filtered: Company[] = [];
  pageCompanies: Company[] = [];
  loading = false;
  error = '';

  // Bộ lọc trạng thái: '' = tất cả | 'active' = hoạt động | 'inactive' = khoá
  status = '';

  // Phân trang
  page = 0;
  size = 20;

  constructor(private companyService: CompanyService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.companyService.list().subscribe({
      next: (data) => {
        this.allCompanies = data || [];
        this.page = 0;
        this.recompute();
        this.loading = false;
      },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  private recompute(): void {
    this.filtered = this.allCompanies.filter((c) => {
      if (this.status === 'active') { return c.active; }
      if (this.status === 'inactive') { return !c.active; }
      return true;
    });
    const maxPage = Math.max(0, Math.ceil(this.filtered.length / this.size) - 1);
    if (this.page > maxPage) {
      this.page = maxPage;
    }
    const start = this.page * this.size;
    this.pageCompanies = this.filtered.slice(start, start + this.size);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filtered.length / this.size));
  }

  onFilterChange(): void {
    this.page = 0;
    this.recompute();
  }

  prev(): void {
    if (this.page > 0) {
      this.page--;
      this.recompute();
    }
  }

  next(): void {
    if (this.page + 1 < this.totalPages) {
      this.page++;
      this.recompute();
    }
  }

  add(): void { this.router.navigate(['/companies/new']); }
  manage(c: Company): void { this.router.navigate(['/companies', c.id, 'edit']); }
}
