/**
 * API client service for Sovereign AI Workbench.
 * Connects frontend to the FastAPI backend (and local llama-server).
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

/**
 * Fetch overall system health from backend.
 */
export async function getSystemHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Health check failed:', err);
    return null;
  }
}

/**
 * Fetch registered models and provider health.
 */
export async function getModelsHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/models/health`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] Models health check failed:', err);
    return null;
  }
}

/**
 * Run a task through the Sovereign Agent pipeline (routing, planning, tools, verification, LLM).
 * Endpoint: POST /agent/run
 */
export async function runAgentTask(task, model = 'general') {
  const res = await fetch(`${API_BASE_URL}/agent/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ task, model }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Agent execution failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Direct local model inference via backend.
 * Endpoint: POST /models/inference
 */
export async function runModelInference({
  prompt,
  systemPrompt = 'You are Vault, an air-gapped sovereign AI assistant running purely on-premise.',
  maxTokens = 1024,
  temperature = 0.7,
  modelName = 'general',
  images = null,
}) {
  const res = await fetch(`${API_BASE_URL}/models/inference`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      system_prompt: systemPrompt,
      max_tokens: maxTokens,
      temperature,
      model_name: modelName,
      images,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Inference failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Upload a document (PDF, DOCX, TXT) to Document Intelligence.
 * Endpoint: POST /files/upload
 */
export async function uploadDocumentFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `File upload failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Ingest an uploaded document into the local Knowledge vector base.
 * Endpoint: POST /knowledge/ingest/{document_id}
 */
export async function ingestDocument(documentId) {
  const res = await fetch(`${API_BASE_URL}/knowledge/ingest/${documentId}`, {
    method: 'POST',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Ingestion failed (${res.status})`);
  }

  return await res.json();
}

/**
 * Combined upload and ingest workflow for seamless document chat.
 */
export async function uploadAndIngestDocument(file) {
  const uploadRes = await uploadDocumentFile(file);
  const ingestRes = await ingestDocument(uploadRes.document_id);
  return {
    ...uploadRes,
    chunks: ingestRes.chunk_count,
    ingestionTimeMs: ingestRes.ingestion_time_ms,
  };
}

/**
 * Perform semantic search and RAG synthesis against local knowledge base.
 * Endpoint: POST /knowledge/query
 */
export async function queryKnowledge(query, topK = 5, documentId = null) {
  const body = { query, top_k: topK };
  if (documentId) body.document_id = documentId;
  const res = await fetch(`${API_BASE_URL}/knowledge/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Knowledge query failed (${res.status})`);
  }

  return await res.json();
}

/**
 * High-level chat sender that routes multimodal images to local vision,
 * attached documents to local RAG, or queries to the Agent Orchestrator.
 */
export async function sendChatMessage(prompt, options = {}) {
  const startTime = performance.now();

  // 1. Multimodal Vision Route (Image attached)
  if (options.images && options.images.length > 0) {
    const infRes = await runModelInference({
      prompt,
      images: options.images,
      ...options,
    });
    const duration = infRes.duration_ms || Math.round(performance.now() - startTime);
    const timings = infRes.metadata?.timings || {};
    const tokensUsed = infRes.tokens_used || Math.max(1, Math.floor(infRes.text.length / 4));
    const tokensPerSec = infRes.metadata?.tokens_per_second || (timings.predicted_per_second ? Number(timings.predicted_per_second).toFixed(2) : null) || (duration > 0 ? (tokensUsed / (duration / 1000)).toFixed(2) : null);

    return {
      text: infRes.text,
      model: infRes.model_name || 'gemma-3-4b-it',
      durationMs: duration,
      tokensUsed,
      tokensPerSecond: tokensPerSec,
      promptTokens: infRes.metadata?.prompt_tokens,
      completionTokens: infRes.metadata?.completion_tokens,
      timings,
      mode: 'vision',
    };
  }

  // 2. Document Knowledge / RAG Route (Document attached or mode is knowledge)
  if (options.documentId || options.mode === 'knowledge') {
    const ragRes = await queryKnowledge(prompt, 5, options.documentId);
    const duration = ragRes.total_time_ms || Math.round(performance.now() - startTime);
    const tokensUsed = ragRes.tokens_used || Math.max(1, Math.floor(ragRes.answer.length / 4));
    const timings = ragRes.timings || {};
    const tokensPerSec = ragRes.tokens_per_second || (timings.predicted_per_second ? Number(timings.predicted_per_second).toFixed(2) : null) || (duration > 0 ? (tokensUsed / (duration / 1000)).toFixed(2) : null);

    return {
      text: ragRes.answer,
      citations: ragRes.citations || [],
      evidenceQuality: ragRes.evidence_quality,
      model: ragRes.model_used || 'gemma-3-4b-it',
      durationMs: duration,
      tokensUsed,
      tokensPerSecond: tokensPerSec,
      timings,
      mode: 'knowledge',
    };
  }

  // 3. Direct Model Inference Route
  if (options.mode === 'inference') {
    const infRes = await runModelInference({ prompt, ...options });
    const duration = infRes.duration_ms || Math.round(performance.now() - startTime);
    const timings = infRes.metadata?.timings || {};
    const tokensUsed = infRes.tokens_used || Math.max(1, Math.floor(infRes.text.length / 4));
    const tokensPerSec = infRes.metadata?.tokens_per_second || (timings.predicted_per_second ? Number(timings.predicted_per_second).toFixed(2) : null) || (duration > 0 ? (tokensUsed / (duration / 1000)).toFixed(2) : null);

    return {
      text: infRes.text,
      model: infRes.model_name || 'gemma-3-4b-it',
      durationMs: duration,
      tokensUsed,
      tokensPerSecond: tokensPerSec,
      promptTokens: infRes.metadata?.prompt_tokens,
      completionTokens: infRes.metadata?.completion_tokens,
      timings,
      mode: 'inference',
    };
  }

  // 4. Default: Sovereign Agent Orchestrator with fallback
  try {
    const agentRes = await runAgentTask(prompt);
    const duration = Math.round(performance.now() - startTime);

    if (agentRes.execution_status === 'error' && (!agentRes.result || agentRes.result.startsWith('Tool execution failed'))) {
      // Fallback to direct model inference if a tool failed
      console.warn('[API] Agent tool error, falling back to direct inference:', agentRes.result);
      const infRes = await runModelInference({ prompt, ...options });
      const infDuration = infRes.duration_ms || Math.round(performance.now() - startTime);
      const timings = infRes.metadata?.timings || {};
      const tokensUsed = infRes.tokens_used || Math.max(1, Math.floor(infRes.text.length / 4));
      const tokensPerSec = infRes.metadata?.tokens_per_second || (timings.predicted_per_second ? Number(timings.predicted_per_second).toFixed(2) : null) || (infDuration > 0 ? (tokensUsed / (infDuration / 1000)).toFixed(2) : null);

      return {
        text: infRes.text,
        model: infRes.model_name || 'gemma-3-4b-it',
        durationMs: infDuration,
        tokensUsed,
        tokensPerSecond: tokensPerSec,
        promptTokens: infRes.metadata?.prompt_tokens,
        completionTokens: infRes.metadata?.completion_tokens,
        timings,
        mode: 'inference_fallback',
        agentTrace: agentRes.trace,
      };
    }

    const completedEvent = (agentRes.trace || []).find((e) => e.event_type === 'TASK_COMPLETED');
    const meta = completedEvent?.metadata || {};
    const timings = meta.timings || {};
    const tokensUsed = meta.tokens_used || Math.max(1, Math.floor((agentRes.result || '').length / 4));
    const tokensPerSec = meta.tokens_per_second || (timings.predicted_per_second ? Number(timings.predicted_per_second).toFixed(2) : null) || (duration > 0 ? (tokensUsed / (duration / 1000)).toFixed(2) : null);

    return {
      text: agentRes.result,
      model: agentRes.selected_model || 'gemma-3-4b-it',
      taskType: agentRes.task_type,
      plan: agentRes.plan,
      toolCalls: agentRes.tool_calls,
      verification: agentRes.verification,
      trace: agentRes.trace,
      runId: agentRes.run_id,
      tokensUsed,
      tokensPerSecond: tokensPerSec,
      promptTokens: meta.prompt_tokens,
      completionTokens: meta.completion_tokens,
      timings,
      durationMs: duration,
      mode: 'agent',
    };
  } catch (err) {
    console.warn('[API] Agent execution threw error, falling back to inference:', err);
    const infRes = await runModelInference({ prompt, ...options });
    const duration = infRes.duration_ms || Math.round(performance.now() - startTime);
    const timings = infRes.metadata?.timings || {};
    const tokensUsed = infRes.tokens_used || Math.max(1, Math.floor(infRes.text.length / 4));
    const tokensPerSec = infRes.metadata?.tokens_per_second || (timings.predicted_per_second ? Number(timings.predicted_per_second).toFixed(2) : null) || (duration > 0 ? (tokensUsed / (duration / 1000)).toFixed(2) : null);

    return {
      text: infRes.text,
      model: infRes.model_name || 'gemma-3-4b-it',
      durationMs: duration,
      tokensUsed,
      tokensPerSecond: tokensPerSec,
      promptTokens: infRes.metadata?.prompt_tokens,
      completionTokens: infRes.metadata?.completion_tokens,
      timings,
      mode: 'inference_fallback',
    };
  }
}
