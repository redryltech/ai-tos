from app.providers.base import LLMProvider


class ClaudeProvider(LLMProvider):
    name = "claude"

    def complete(self, prompt: str) -> str:
        # Phase 0: adapter interface only. Wired in a later phase.
        raise NotImplementedError("Claude adapter wired in later phase")
