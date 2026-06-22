import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { API_BASE } from '../core/api.config';
import { ApiResponse } from '../core/models';
import { SupportStats, SupportConversation, SupportChatMessage } from '../core/admin-models';

@Injectable({ providedIn: 'root' })
export class SupportLogService {
  private base = `${API_BASE}/api/admin/v1/support`;
  constructor(private http: HttpClient) {}

  stats(): Observable<SupportStats> {
    return this.http.get<ApiResponse<SupportStats>>(`${this.base}/stats`).pipe(map((r) => r.data));
  }

  conversations(): Observable<SupportConversation[]> {
    return this.http.get<ApiResponse<SupportConversation[]>>(`${this.base}/conversations`).pipe(map((r) => r.data));
  }

  messages(conversationId: string): Observable<SupportChatMessage[]> {
    const params = new HttpParams().set('conversationId', conversationId);
    return this.http
      .get<ApiResponse<SupportChatMessage[]>>(`${this.base}/messages`, { params })
      .pipe(map((r) => r.data));
  }
}
