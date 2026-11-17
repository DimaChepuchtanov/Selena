"""Read configuration from the process environment and an optional local .env.

The real .env must never be committed or placed under the public web root.
"""
import os
from pathlib import Path

from dotenv import load_dotenv

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env", override=False)


class Config:
    PG_USER = os.getenv("PG_USER")
    PG_PASSWORD = os.getenv("PG_PASSWORD")
    PG_HOST = os.getenv("PG_HOST", "localhost")
    PG_PORT = os.getenv("PG_PORT", "5432")
    PG_DATABASE = os.getenv("PG_DATABASE")
    SECRET_KEY = os.getenv("SECRET_KEY")

    @classmethod
    def validate(cls) -> None:
        required = {
            "PG_USER": cls.PG_USER,
            "PG_PASSWORD": cls.PG_PASSWORD,
            "PG_DATABASE": cls.PG_DATABASE,
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            raise RuntimeError("Missing required environment variables: " + ", ".join(missing))


Config.validate()
