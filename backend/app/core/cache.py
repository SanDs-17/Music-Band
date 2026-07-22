"""
Redis-backed cache helpers for lightweight application caching.
"""

import json
from functools import lru_cache
from typing import Any

import redis

from app.core.config import settings


@lru_cache
def get_cache_client() -> redis.Redis:
    return redis.Redis.from_url(
        settings.REDIS_URL,
        socket_connect_timeout=1,
        decode_responses=True,
    )


def cache_get(key: str) -> Any | None:
    try:
        client = get_cache_client()
        value = client.get(key)
        if value is None:
            return None
        return json.loads(value)
    except redis.RedisError:
        return None


def cache_set(key: str, value: Any, ttl: int = 60) -> None:
    try:
        client = get_cache_client()
        client.set(key, json.dumps(value, default=str), ex=ttl)
    except redis.RedisError:
        pass


def cache_delete(key: str) -> None:
    try:
        client = get_cache_client()
        client.delete(key)
    except redis.RedisError:
        pass
