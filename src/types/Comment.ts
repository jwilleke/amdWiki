export interface PageComment {
  id: string;
  pageUuid: string;
  author: string;
  authorDisplayName: string;
  content: string;
  createdAt: string;
  deleted?: boolean;
  deletedBy?: string;
  deletedAt?: string;
}
