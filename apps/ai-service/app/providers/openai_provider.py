from app.providers.base import LLMProvider


class OpenAIProvider(LLMProvider):
    name = "openai"

    def complete(self, prompt: str) -> str:
        # Phase 0: adapter interface only. Wired in a later phase.
        raise NotImplementedError("OpenAI adapter wired in later phase")
