// Base URL cua backend Spring Boot. Lay tu environment de override theo moi truong.
// Dev: http://localhost:8080 (environment.ts). Production: environment.prod.ts (fileReplacements).
import { environment } from '../../environments/environment';

export const API_BASE = environment.apiBase;
