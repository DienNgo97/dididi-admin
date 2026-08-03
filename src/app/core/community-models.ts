// Kiểu dữ liệu cho tab "Quản lý cộng đồng" (khớp DTO backend /api/admin/v1/community).

export interface CommunityStats {
  postsByStatus: Record<string, number>;    // { PUBLISHED, HIDDEN, REMOVED }
  commentsByStatus: Record<string, number>;
  members: number;
  reports: Record<string, number>;          // { OPEN, REVIEWED, ACTIONED, DISMISSED }
  topHashtags: { tag: string; postCount: number }[];
}

export interface AdminSocialReport {
  id: number;
  targetType: string;      // POST | COMMENT
  targetId: number;
  reason: string;          // SPAM | HARASSMENT | NUDITY | VIOLENCE | MISINFO | OTHER
  status: string;          // OPEN | REVIEWED | ACTIONED | DISMISSED
  note?: string;
  reporterUserId: number;
  reporterName?: string;
  handledByUserId?: number;
  createdAt?: string;
}

export interface AdminSocialPost {
  id: number;
  authorUserId: number;
  authorName?: string;
  caption?: string;
  type: string;            // STANDARD | REVIEW | CHECKIN | REPOST
  status: string;          // PUBLISHED | HIDDEN | REMOVED
  visibility: string;      // PUBLIC | FOLLOWERS | PRIVATE
  likeCount: number;
  commentCount: number;
  repostCount: number;
  hotelId?: number;
  createdAt?: string;
}

export interface AdminSocialComment {
  id: number;
  postId: number;
  authorUserId: number;
  authorName?: string;
  content?: string;
  status: string;          // PUBLISHED | HIDDEN | REMOVED
  likeCount: number;
  createdAt?: string;
}

export interface AdminSocialMember {
  userId: number;
  handle?: string;
  displayName?: string;
  fullName?: string;
  email?: string;
  role?: string;           // CUSTOMER | VENDOR | ADMIN | SUPER_ADMIN
  accountStatus?: string;  // ACTIVE | INACTIVE | LOCKED | CLOSED
  postsCount: number;
  followersCount: number;
  followingCount: number;
  joinedAt?: string;
}
