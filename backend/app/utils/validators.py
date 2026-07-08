"""
Common Pydantic validation helpers.
"""

import re

def validate_phone_number(value: str) -> str:
    """Validate standard phone format."""
    pattern = re.compile(r"^\+?[1-9]\d{1,14}$")  # E.164 phone format
    if not pattern.match(value):
        raise ValueError("Invalid phone number format. Must be E.164 compliant.")
    return value

def validate_password_strength(value: str) -> str:
    """Ensure passwords meet minimal security strength requirements."""
    if len(value) < 8:
        raise ValueError("Password must be at least 8 characters long.")
    if not any(char.isupper() for char in value):
        raise ValueError("Password must contain at least one uppercase letter.")
    if not any(char.islower() for char in value):
        raise ValueError("Password must contain at least one lowercase letter.")
    if not any(char.isdigit() for char in value):
        raise ValueError("Password must contain at least one numeric digit.")
    if not any(char in "!@#$%^&*()_+-=[]{}|;':\",./<>?" for char in value):
        raise ValueError("Password must contain at least one special character.")
    return value
