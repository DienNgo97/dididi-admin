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

  q = '';               // thanh tìm kiếm (tên / mã / email liên hệ, không dấu)

  /** Bỏ dấu tiếng Việt để tìm không dấu (go "ha noi" ra "Hà Nội"). */
  private strip(s?: string | null): string {
    return (s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  }

  onSearch(): void { this.page = 0; this.recompute(); }

  private recompute(): void {
    const q = this.strip(this.q);
    this.filtered = this.allCompanies.filter((c) => {
      if (this.status === 'active' && !c.active) { return false; }
      if (this.status === 'inactive' && c.active) { return false; }
      return !q || this.strip(c.name).includes(q) || this.strip(c.code).includes(q)
        || this.strip(c.contactEmail).includes(q);
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
