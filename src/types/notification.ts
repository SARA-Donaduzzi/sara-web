export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  isRead: boolean;
  userId: string;
  createdAt: Date;
  relatedEntityId?: string;
  relatedEntityType?: "ARTICLE" | "EVALUATION" | "EVENT";
}
