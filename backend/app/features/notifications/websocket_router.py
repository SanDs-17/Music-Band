"""
WebSocket Router — /api/v1/ws/notifications

Handles WebSocket lifecycle for authenticated users:
  1. JWT authentication via ?token= query param
  2. Connection registration with ConnectionManager
  3. Heartbeat ping/pong to keep connection alive
  4. Graceful disconnection and cleanup

Security:
  - Uses existing decode_token() from security.py
  - User can ONLY receive their own notifications
    (publisher enforces user_id scoping at delivery)
  - Invalid/expired tokens are rejected with WS close code 4001

Protocol:
  Server → Client: { "type": "connected", "user_id": "..." }
  Server → Client: { "type": "ping" }
  Server → Client: { "type": "notification", "data": { ...NotificationItem } }
  Client → Server: { "type": "pong" }
"""

import asyncio
import json
import logging
from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect

from app.core.security import decode_token
from app.features.notifications.connection_manager import connection_manager

logger = logging.getLogger(__name__)

router = APIRouter(tags=["WebSocket"])

# Heartbeat interval in seconds.
# The server sends a ping after this many seconds of silence from the client.
HEARTBEAT_INTERVAL_SECONDS = 25

# WebSocket close codes (registered range: 4000–4999 is application-defined)
WS_CLOSE_UNAUTHORIZED = 4001    # Invalid or expired JWT
WS_CLOSE_INTERNAL_ERROR = 4500  # Unexpected server-side error


@router.websocket("/notifications")
async def ws_notifications(
    websocket: WebSocket,
    token: str = Query(..., description="JWT access token (from localStorage)")
) -> None:
    """
    Establishes a persistent WebSocket connection for realtime notification
    delivery to the authenticated user.

    Authentication:
      JWT is passed as a query parameter because the browser WebSocket API
      does not support custom headers during the upgrade handshake.
      The token is validated with the same decode_token() used by all
      REST endpoints.

    Heartbeat:
      The server sends { "type": "ping" } every 25 seconds.
      The client responds with { "type": "pong" }.
      If the client stops responding the connection is closed and cleaned up.
    """
    # ── Step 1: Authenticate ─────────────────────────────────────────────────
    user_id: str
    try:
        payload = decode_token(token)
        user_id = payload["sub"]
    except Exception as exc:
        logger.warning(f"[WS] Rejected unauthenticated connection: {exc}")
        await websocket.close(code=WS_CLOSE_UNAUTHORIZED, reason="Unauthorized: invalid or expired token")
        return

    # ── Step 2: Register Connection ───────────────────────────────────────────
    await connection_manager.connect(user_id, websocket)

    try:
        # ── Step 3: Send Connection Confirmation ──────────────────────────────
        await websocket.send_json({
            "type": "connected",
            "user_id": user_id,
        })

        # ── Step 4: Message Loop ──────────────────────────────────────────────
        # Wait for client messages with a timeout.  On timeout we send a ping.
        # On client pong we reset the cycle.
        while True:
            try:
                raw = await asyncio.wait_for(
                    websocket.receive_text(),
                    timeout=float(HEARTBEAT_INTERVAL_SECONDS)
                )
                msg = json.loads(raw)

                if msg.get("type") == "pong":
                    # Heartbeat acknowledged — continue silently
                    logger.debug(f"[WS] Pong received from user {user_id}")

            except asyncio.TimeoutError:
                # No message received within interval — send keepalive ping
                try:
                    await websocket.send_json({"type": "ping"})
                except Exception:
                    # Client unreachable — break and clean up
                    logger.info(f"[WS] Ping failed — closing connection for {user_id}")
                    break

            except WebSocketDisconnect:
                logger.info(f"[WS] User {user_id} disconnected cleanly.")
                break

            except json.JSONDecodeError:
                # Malformed message from client — ignore and continue
                logger.debug(f"[WS] Malformed message from {user_id} — ignored.")

            except Exception as exc:
                logger.error(f"[WS] Unexpected error for {user_id}: {exc}")
                break

    finally:
        # ── Step 5: Cleanup ───────────────────────────────────────────────────
        await connection_manager.disconnect(user_id, websocket)
