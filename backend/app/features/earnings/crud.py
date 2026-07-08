from sqlalchemy.orm import Session
from sqlalchemy import func
from uuid import UUID
from datetime import datetime, timedelta
from typing import List, Dict, Any
from app.features.earnings.models import Transaction
from app.common.repositories.base import BaseRepository

class TransactionCRUD(BaseRepository[Transaction]):
    def __init__(self):
        super().__init__(Transaction)

    def get_by_artist(self, db: Session, artist_id: UUID, offset: int = 0, limit: int = 10) -> List[Transaction]:
        return db.query(Transaction).filter(
            Transaction.artist_profile_id == artist_id,
            Transaction.deleted_at.is_(None)
        ).order_by(Transaction.created_at.desc()).offset(offset).limit(limit).all()

    def get_summary_stats(self, db: Session, artist_id: UUID) -> Dict[str, Any]:
        # 1. Total Completed Credits (Total Earnings)
        total_earnings_query = db.query(func.sum(Transaction.amount)).filter(
            Transaction.artist_profile_id == artist_id,
            Transaction.type == "credit",
            Transaction.status == "completed",
            Transaction.deleted_at.is_(None)
        ).scalar()
        total_earnings = float(total_earnings_query) if total_earnings_query else 0.0

        # 2. Total Completed Debits (Withdrawals)
        total_withdrawals_query = db.query(func.sum(Transaction.amount)).filter(
            Transaction.artist_profile_id == artist_id,
            Transaction.type == "debit",
            Transaction.status == "completed",
            Transaction.deleted_at.is_(None)
        ).scalar()
        total_withdrawals = float(total_withdrawals_query) if total_withdrawals_query else 0.0

        # Wallet Balance = Credits - Debits
        wallet_balance = total_earnings - total_withdrawals

        # 3. Monthly Earnings (Credits this month)
        now = datetime.utcnow()
        start_of_month = datetime(now.year, now.month, 1)
        monthly_earnings_query = db.query(func.sum(Transaction.amount)).filter(
            Transaction.artist_profile_id == artist_id,
            Transaction.type == "credit",
            Transaction.status == "completed",
            Transaction.created_at >= start_of_month,
            Transaction.deleted_at.is_(None)
        ).scalar()
        monthly_earnings = float(monthly_earnings_query) if monthly_earnings_query else 0.0

        # 4. Pending Payments (Pending Credits)
        pending_payments_query = db.query(func.sum(Transaction.amount)).filter(
            Transaction.artist_profile_id == artist_id,
            Transaction.type == "credit",
            Transaction.status == "pending",
            Transaction.deleted_at.is_(None)
        ).scalar()
        pending_payments = float(pending_payments_query) if pending_payments_query else 0.0

        # 5. Completed Payments (Completed Credits + Completed Debits)
        completed_payments_query = db.query(func.sum(Transaction.amount)).filter(
            Transaction.artist_profile_id == artist_id,
            Transaction.status == "completed",
            Transaction.deleted_at.is_(None)
        ).scalar()
        completed_payments = float(completed_payments_query) if completed_payments_query else 0.0

        # 6. Revenue Chart (Aggregate credits by month for the last 6 months)
        chart_points = []
        for i in range(5, -1, -1):
            check_date = now - timedelta(days=i * 30)
            month_start = datetime(check_date.year, check_date.month, 1)
            if check_date.month == 12:
                month_end = datetime(check_date.year + 1, 1, 1)
            else:
                month_end = datetime(check_date.year, check_date.month + 1, 1)
                
            rev_val = db.query(func.sum(Transaction.amount)).filter(
                Transaction.artist_profile_id == artist_id,
                Transaction.type == "credit",
                Transaction.status == "completed",
                Transaction.created_at >= month_start,
                Transaction.created_at < month_end,
                Transaction.deleted_at.is_(None)
            ).scalar()
            
            month_name = check_date.strftime("%b")
            chart_points.append({
                "month": month_name,
                "revenue": float(rev_val) if rev_val else 0.0
            })

        return {
            "wallet_balance": wallet_balance,
            "total_earnings": total_earnings,
            "monthly_earnings": monthly_earnings,
            "pending_payments": pending_payments,
            "completed_payments": completed_payments,
            "revenue_chart": chart_points
        }

    def seed_mock_transactions_if_empty(self, db: Session, artist_id: UUID):
        # Seed some initial transactions so the dashboard has preloaded data to display
        count = db.query(Transaction).filter(Transaction.artist_profile_id == artist_id).count()
        if count == 0:
            now = datetime.utcnow()
            mock_data = [
                {"amount": 15000.0, "type": "credit", "status": "completed", "desc": "Performance booking fee - Priya Sharma Wedding Gig", "days_offset": 45},
                {"amount": 25000.0, "type": "credit", "status": "completed", "desc": "Stage concert fee - TechCorp corporate party", "days_offset": 15},
                {"amount": 5000.0, "type": "debit", "status": "completed", "desc": "Wallet withdrawal transfer to bank account", "days_offset": 10},
                {"amount": 12000.0, "type": "credit", "status": "pending", "desc": "Pending advance booking deposit - Pub Night Live Rock Show", "days_offset": 2}
            ]
            for data in mock_data:
                tx = Transaction(
                    artist_profile_id=artist_id,
                    amount=data["amount"],
                    type=data["type"],
                    status=data["status"],
                    description=data["desc"],
                    created_at=now - timedelta(days=data["days_offset"])
                )
                db.add(tx)
            db.commit()

transaction_crud = TransactionCRUD()
