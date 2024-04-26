from pydantic import SecretStr
from pydantic_settings import BaseSettings


class Config(BaseSettings):
    token: SecretStr = SecretStr("abc")
