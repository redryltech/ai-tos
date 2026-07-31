from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    log_level: str = "info"
    openai_api_key: str = ""
    gemini_api_key: str = ""
    claude_api_key: str = ""


settings = Settings()
