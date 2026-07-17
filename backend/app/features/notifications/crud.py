from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.features.notifications.models import Notification

class NotificationCRUD:
    def get_by_user(self, db: Session, user_id: UUID, page: int = 1, limit: int = 10) -> List[Notification]:
        offset = (page - 1) * limit
        return (
            db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.created_at.desc())
            .offset(offset)
            .limit(limit)
            .all()
        )

    def count_by_user(self, db: Session, user_id: UUID) -> int:
        return db.query(Notification).filter(Notification.user_id == user_id).count()

    def get(self, db: Session, notification_id: UUID) -> Optional[Notification]:
        return db.query(Notification).filter(Notification.id == notification_id).first()

    def create(self, db: Session, user_id: UUID, title: str, message: str) -> Notification:
        import uuid
        notification = Notification(
            id=uuid.uuid4(),
            user_id=user_id,
            title=title,
            message=message,
            is_read=False
        )
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    def mark_as_read(self, db: Session, notification: Notification) -> Notification:
        notification.is_read = True
        db.commit()
        db.refresh(notification)
        return notification

    def mark_all_as_read(self, db: Session, user_id: UUID):
        db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.is_read.is_(False)
        ).update({"is_read": True})
        db.commit()

notification_crud = NotificationCRUD()
