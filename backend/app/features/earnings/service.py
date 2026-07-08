from sqlalchemy.orm import Session
from app.features.earnings.crud import transaction_crud
from app.features.artists.crud import ArtistProfileCRUD
from app.core.exceptions import NotFoundException

class EarningsService:
    def __init__(self):
        self.artist_crud = ArtistProfileCRUD()

    def get_artist_profile(self, db: Session, user_id: str):
        artist = self.artist_crud.get_by_user_id(db, user_id)
        if not artist:
            raise NotFoundException("Artist profile not found.")
        return artist

    def get_artist_earnings_summary(self, db: Session, user_id: str) -> dict:
        artist = self.get_artist_profile(db, user_id)
        
        # Seed mock data if none exists
        transaction_crud.seed_mock_transactions_if_empty(db, artist.id)
        
        stats = transaction_crud.get_summary_stats(db, artist.id)
        tx_history = transaction_crud.get_by_artist(db, artist.id, offset=0, limit=20)
        
        return {
            **stats,
            "transactions": tx_history
        }

earnings_service = EarningsService()
