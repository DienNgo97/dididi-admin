import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService } from '../../api/company.service';
import { Company } from '../../core/admin-models';

@Component({
  selector: 'app-company-list',
  templateUrl: './company-list.component.html'
})
export class CompanyListComponent implements OnInit {
  companies: Company[] = [];
  loading = false;
  error = '';

  constructor(private companyService: CompanyService, private router: Router) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading = true;
    this.error = '';
    this.companyService.list().subscribe({
      next: (data) => { this.companies = data; this.loading = false; },
      error: (err) => { this.error = err?.error?.message || 'Không tải được danh sách'; this.loading = false; }
    });
  }

  add(): void { this.router.navigate(['/companies/new']); }
  manage(c: Company): void { this.router.navigate(['/companies', c.id, 'edit']); }
}
