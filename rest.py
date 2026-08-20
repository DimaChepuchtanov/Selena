from __future__ import annotations

from typing import Final, Any


REST_FRAMEWORK: Final[dict[str, Any]] = {
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}
