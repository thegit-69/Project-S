import json
import httpx
from typing import List, Dict, AsyncGenerator, Any
from app.config import get_settings
from app.services.retrieval_service import RetrievalService
from app.services.context_builder import ContextBuilder

class RAGService:
    def __init__(self, retrieval_service: RetrievalService):
        self.retrieval_service = retrieval_service
        self.settings = get_settings()

    async def chat_stream(self, messages: List[Dict[str, str]], rag_options: Dict[str, Any]) -> AsyncGenerator[str, None]:
        """
        Streams a response from the LLM, optionally injecting RAG context.
        Yields JSON strings formatted as Server-Sent Events (SSE).
        """
        sources_payload = []
        
        # 1. Handle RAG Context Injection
        if rag_options.get("enabled", False):
            # Extract the latest user query
            user_query = messages[-1]["content"] if messages and messages[-1]["role"] == "user" else ""
            
            if user_query:
                document_id = rag_options.get("document_id")
                top_k = rag_options.get("top_k", 5)
                
                # Retrieve chunks
                chunks = self.retrieval_service.search(query=user_query, top_k=top_k, document_id=document_id)
                context_string = ContextBuilder.build_context(chunks)
                
                # Format sources for the final event
                sources_payload = [c.model_dump() for c in chunks]
                
                # Inject System Prompt with Context
                system_prompt = (
                    "You are a helpful, factual assistant. Answer the user's question based strictly on the provided context. "
                    "If the context does not contain the answer, say 'I cannot answer this based on the provided documents.'\n"
                    "Always cite your sources using the headers provided in the context (e.g., [Source 1, Page 4]).\n\n"
                    "--- CONTEXT ---\n"
                    f"{context_string}"
                )
                
                # Ensure the first message is the system prompt
                if messages and messages[0]["role"] == "system":
                    messages[0]["content"] = system_prompt
                else:
                    messages.insert(0, {"role": "system", "content": system_prompt})

        # 2. Call local llama.cpp LLM via HTTP
        # llama.cpp supports the OpenAI /v1/chat/completions endpoint format
        llm_url = f"{self.settings.llm_base_url.rstrip('/')}/v1/chat/completions"
        payload = {
            "messages": messages,
            "stream": True
        }
        
        try:
            async with httpx.AsyncClient(timeout=self.settings.llm_timeout) as client:
                async with client.stream("POST", llm_url, json=payload) as response:
                    if response.status_code != 200:
                        yield f"data: {json.dumps({'error': f'LLM returned status {response.status_code}'})}\n\n"
                        return

                    async for line in response.aiter_lines():
                        if line:
                            yield f"{line}\n\n"
                            
        except httpx.RequestError as e:
            yield f"data: {json.dumps({'error': f'Failed to connect to local LLM: {str(e)}'})}\n\n"

        # 3. Yield the custom sources event at the very end
        if sources_payload:
            # We send a custom event type or simply a data block the frontend knows how to parse
            custom_event = json.dumps({"sources": sources_payload, "is_custom_metadata": True})
            yield f"data: {custom_event}\n\n"
            
        yield "data: [DONE]\n\n"
