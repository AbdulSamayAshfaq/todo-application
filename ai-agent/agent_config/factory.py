"""
Factory module for creating AI models based on provider.

This module centralizes the creation of different LLM models for the agent,
following the ChatKit backend pattern.
"""

import os
from agents import OpenAIChatCompletionsModel, AsyncOpenAI

OPENAI_BASE_URL = os.getenv("OPENAI_BASE_URL")  # optional override
GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

def create_model():
    """
    Factory method to create and return an appropriate model instance based on the provider.
    
    Returns:
        Initialized model instance appropriate for the provider
    """
    provider = os.getenv("LLM_PROVIDER", "openrouter").lower()

    if provider == "openrouter":
        # Use OpenRouter with its own API key
        client = AsyncOpenAI(
            api_key=os.getenv("OPENROUTER_API_KEY"),
            base_url=OPENROUTER_BASE_URL,
        )
        return OpenAIChatCompletionsModel(
            model=os.getenv("OPENROUTER_DEFAULT_MODEL", "z-ai/glm-4.5-air:free"),
            openai_client=client,
        )

    if provider == "gemini":
        client = AsyncOpenAI(
            api_key=os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY"),
            base_url=GEMINI_BASE_URL,
        )
        return OpenAIChatCompletionsModel(
            model=os.getenv("GEMINI_DEFAULT_MODEL", "gemini-2.5-flash"),
            openai_client=client,
        )

    # Default: OpenAI
    client = AsyncOpenAI(
        api_key=os.getenv("OPENAI_API_KEY"),
        base_url=OPENAI_BASE_URL or None,
    )
    return OpenAIChatCompletionsModel(
        model=os.getenv("OPENAI_DEFAULT_MODEL", "gpt-4o"),
        openai_client=client,
    )


# Convenience aliases
create_llm_model = create_model
get_model_for_provider = create_model