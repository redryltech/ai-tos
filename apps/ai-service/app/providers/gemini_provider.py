from app.providers.base import LLMProvider


class GeminiProvider(LLMProvider):
    name = "gemini"

    def complete(self, prompt: str) -> str:
        # Phase 0: adapter interface only. Wired in a later phase.
        raise NotImplementedError("Gemini adapter wired in later phase")
