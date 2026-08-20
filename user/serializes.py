from __future__ import annotations

from typing import Any

from rest_framework import serializers

from .models import User


def serialize_user(user: User) -> dict[str, Any]:
    return {
        "uuid": str(user.uuid),
        "email": user.email,
        "is_verifaction": str(user.is_verification),
        "verification_code": user.verification_code,
        "tg": user.tg,
        "role": str(user.role),
        "created_at": user.created_at.isoformat()
    }