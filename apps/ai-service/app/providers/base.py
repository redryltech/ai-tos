from abc import ABC, abstractmethod


class LLMProvider(ABC):
    """Interface for LLM providers. Phase 0: no implementation logic."""

    name: str

    @abstractmethod
    def complete(self, prompt: str) -> str:
        """Return a completion for the given prompt."""
        raise NotImplementedError
