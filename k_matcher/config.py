from pathlib import Path
from typing import Any

from pydantic import SecretStr
from pydantic_settings import BaseSettings
from yaml import safe_load


class Config(BaseSettings):
    token: SecretStr


def load_config(path: Path) -> Config:
    return Config(**load_yaml(path))


def load_yaml(path: Path) -> dict[str, Any]:
    with open(path, 'r') as f:
        config = safe_load(f)
    if not isinstance(config, dict):
        raise TypeError(f"Config file has no top-level mapping: {path}")
    return config
