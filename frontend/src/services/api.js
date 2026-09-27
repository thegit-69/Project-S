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

// --- Model catalog (multi-model management + hot-reload) ---

const MOCK_CATALOG = {
  catalog_path: 'config/models.json',
  models: [
    {
      key: 'general',
      display_name: 'Gemma 3 4B',
      provider_type: 'llama_cpp',
      base_url: 'http://127.0.0.1:8080',
      model_id: 'gemma-3-4b-it',
      model_path: 'models/gemma-3-4b-it-Q4_K_M.gguf',
      mmproj_path: 'models/mmproj-gemma-3-4b-it-f16.gguf',
      timeout: 120,
      max_context_tokens: 8192,
      capabilities: { text: true, vision: true, code: false, agentic: false },
      task_types: ['general', 'file_analysis', 'vision'],
      routes: ['general', 'file_analysis', 'vision'],
      priority: 10,
      enabled: true,
      status: 'available',
    },
    {
      key: 'coder',
      display_name: 'Qwen3 4B',
      provider_type: 'llama_cpp',
      base_url: 'http://127.0.0.1:8082',
      model_id: 'qwen3-4b',
      model_path: 'models/qwen3-4b-Q4_K_M.gguf',
      mmproj_path: null,
      timeout: 120,
      max_context_tokens: 8192,
      capabilities: { text: true, vision: false, code: true, agentic: true },
      task_types: ['code', 'agentic', 'multi_step', 'calculation'],
      routes: ['code', 'agentic', 'multi_step', 'calculation'],
      priority: 20,
      enabled: true,
      status: 'available',
    },
  ],
};

/**
 * Fetch the full model catalog with live health + routing info.
 * Endpoint: GET /models/catalog
 */
export async function listModelCatalog() {
  try {
    const res = await fetch(`${API_BASE_URL}/models/catalog`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] listModelCatalog failed, using MOCK fallback for demo', err);
    return structuredClone(MOCK_CATALOG);
  }
}

/**
 * Add a new model to the catalog (loopback-enforced) and hot-reload.
 * Endpoint: POST /models/catalog
 */
export async function createModelDefinition(definition) {
  const res = await fetch(`${API_BASE_URL}/models/catalog`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(definition),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Add model failed (${res.status})`);
  }
  return await res.json();
}

/**
 * Edit an existing model definition (enabled, priority, capabilities…) + hot-reload.
 * Endpoint: PUT /models/catalog/{key}
 */
export async function updateModelDefinition(key, definition) {
  const res = await fetch(`${API_BASE_URL}/models/catalog/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(definition),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Update model failed (${res.status})`);
  }
  return await res.json();
}

/**
 * Remove a model from the catalog and hot-reload.
 * Endpoint: DELETE /models/catalog/{key}
 */
export async function deleteModelDefinition(key) {
  const res = await fetch(`${API_BASE_URL}/models/catalog/${encodeURIComponent(key)}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Delete model failed (${res.status})`);
  }
  return await res.json();
}

/**
 * Re-read the catalog file from disk and rebuild the registry (no restart).
 * Endpoint: POST /models/reload
 */
export async function reloadModels() {
  try {
    const res = await fetch(`${API_BASE_URL}/models/reload`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] reloadModels failed (mock ok for demo)', err);
    return { status: 'reloaded', registered: MOCK_CATALOG.models.map((m) => m.key) };
  }
}

/**
 * Run a task through the Sovereign Agent pipeline (routing, planning, tools, verification, LLM).
 * Endpoint: POST /agent/run
 */
export async function runAgentTask(task, model = null) {
  try {
    const res = await fetch(`${API_BASE_URL}/agent/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // A null model lets the orchestrator auto-route; a key pins that model.
      body: JSON.stringify({ task, model }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Agent execution failed (${res.status})`);
    }

    return await res.json();
  } catch (err) {
    console.warn('[API] runAgentTask failed:', err);
    throw err;
  }
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
  try {
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
  } catch (err) {
    console.warn('[API] runModelInference failed:', err);
    throw err;
  }
}

/**
 * Upload a document (PDF, DOCX, TXT, CSV) to Document Intelligence.
 * Endpoint: POST /files/upload
 * NOTE: The backend now automatically schedules ingestion.
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
 * Poll document ingestion status.
 * Endpoint: GET /files/{document_id}
 */
export async function pollDocumentStatus(documentId) {
  const res = await fetch(`${API_BASE_URL}/files/${documentId}`, {
    headers: { 'Accept': 'application/json' }
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch document status (${res.status})`);
  }
  return await res.json();
}

/**
 * List all documents currently indexed in the backend.
 * Endpoint: GET /files/
 */
export async function listKnowledgeDocuments() {
  try {
    const res = await fetch(`${API_BASE_URL}/files/`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    return await res.json();
  } catch (err) {
    console.warn('[API] listKnowledgeDocuments failed', err);
    return [];
  }
}

/**
 * Remove a document (and all its chunks) from the local knowledge base.
 * Endpoint: DELETE /knowledge/documents/{document_id}
 */
export async function deleteKnowledgeDocument(documentId) {
  try {
    const res = await fetch(`${API_BASE_URL}/files/${documentId}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.detail || `Delete failed (${res.status})`);
    }
    return await res.json();
  } catch (err) {
    console.warn('[API] deleteKnowledgeDocument failed (mock ok for demo)', err);
    return { status: 'deleted', document_id: documentId };
  }
}

/**
 * Perform semantic search and RAG synthesis against local knowledge base.
 * Endpoint: POST /knowledge/query
 */
export async function queryKnowledge(query, topK = 5, documentId = null) {
  return new Promise((resolve, reject) => {
    let fullText = '';
    let finalCitations = [];

    streamChat(
      query,
      (chunk) => {
        if (chunk.content) fullText += chunk.content;
        if (chunk.citations) finalCitations = chunk.citations;
      },
      () => {
        resolve({
          answer: fullText,
          citations: finalCitations,
          total_time_ms: null,
          tokens_used: null,
        });
      },
      (err) => reject(err),
      { useRag: true, documentId } // documentId not strictly used by our chat endpoint yet, but passed
    );
  });
}

/**
 * High-level chat sender that routes multimodal images to local vision,
 * attached documents to local RAG, or queries to the Agent Orchestrator.
 */
export async function sendChatMessage(prompt, options = {}) {
  const startTime = performance.now();

  // A specific model key pins that model; 'auto' (or unset) lets the agent route.
  const modelName =
    options.model && options.model !== 'auto' ? options.model : undefined;

  // 1. Multimodal Vision Route (Image attached)
  if (options.images && options.images.length > 0) {
    const infRes = await runModelInference({
      prompt,
      images: options.images,
      ...options,
      modelName,
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
    const infRes = await runModelInference({ prompt, ...options, modelName });
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
    const agentRes = await runAgentTask(prompt, modelName ?? null);
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
      selectionReason: agentRes.selection_reason || '',
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

export async function streamChat(query, onChunk, onComplete, onError, options = {}) {
  try {
    let messageContent = query;
    if (options.images && options.images.length > 0) {
      messageContent = [
        { type: 'text', text: query },
        { type: 'image_url', image_url: { url: `data:${options.images[0].media_type};base64,${options.images[0].base64_data}` } }
      ];
    }

    const res = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: messageContent }],
        stream: true,
        rag_options: {
          enabled: options.useRag === true || !!options.documentId,
          document_id: options.documentId || null,
        }
      }),
    });

    if (!res.ok) {
      throw new Error(`Chat stream failed (${res.status})`);
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      buffer = lines.pop();

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim();
          if (data === '[DONE]') {
            if (onComplete) onComplete();
            return;
          }
          
          try {
            const parsed = JSON.parse(data);
            
            if (parsed.is_custom_metadata) {
              if (onChunk) onChunk({ citations: parsed.sources });
            } else if (parsed.choices && parsed.choices.length > 0) {
              const delta = parsed.choices[0].delta;
              if (delta && delta.content) {
                if (onChunk) onChunk({ content: delta.content });
              }
            } else if (parsed.error) {
              throw new Error(parsed.error);
            }

            if (parsed.timings) {
              if (onChunk) onChunk({
                tokens_used: parsed.timings.predicted_n,
                total_time_ms: parsed.timings.predicted_ms,
                tokens_per_sec: parsed.timings.predicted_per_second
              });
            }
          } catch (e) {
            // Ignoring JSON parse errors for incomplete chunks
          }
        }
      }
    }
    
    if (buffer.startsWith('data: ')) {
      const data = buffer.slice(6).trim();
      if (data === '[DONE]') {
        if (onComplete) onComplete();
      } else {
        try {
          const parsed = JSON.parse(data);
          if (parsed.is_custom_metadata) {
             if (onChunk) onChunk({ citations: parsed.sources });
          } else if (parsed.choices && parsed.choices.length > 0) {
             const delta = parsed.choices[0].delta;
             if (delta && delta.content) {
               if (onChunk) onChunk({ content: delta.content });
             }
          }
          if (parsed.timings) {
             if (onChunk) onChunk({
               tokens_used: parsed.timings.predicted_n,
               total_time_ms: parsed.timings.predicted_ms,
               tokens_per_sec: parsed.timings.predicted_per_second
             });
          }
          if (onComplete) onComplete();
        } catch (e) {}
      }
    } else {
        if (onComplete) onComplete();
    }
  } catch (err) {
    if (onError) onError(err)
    else console.error('[API] Stream chat failed:', err)
  }
}

/**
 * Export a Studio Notebook note to a DOCX file via the backend.
 * Endpoint: POST /studio/export
 *
 * @param {{ title: string, content: string }} note
 * @returns {Promise<Blob>} Binary DOCX blob
 */
export async function exportStudioNote(note) {
  const res = await fetch(`${API_BASE_URL}/studio/export`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: note.title,
      content: note.content,
      format: 'docx',
    }),
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `Export failed (${res.status})`)
  }
  return await res.blob()
}

// ---------------------------------------------------------------------------
// Library API
// ---------------------------------------------------------------------------

/**
 * List all library files.
 * @param {{ fileType?: string, search?: string }} opts
 */
export async function listLibraryFiles({ fileType = '', search = '' } = {}) {
  const params = new URLSearchParams()
  if (fileType) params.set('file_type', fileType)
  if (search) params.set('search', search)
  const qs = params.toString()
  const res = await fetch(`${API_BASE_URL}/files/${qs ? `?${qs}` : ''}`)
  if (!res.ok) throw new Error(`List files failed (${res.status})`)
  return await res.json()  // { files: [], total: N }
}

/**
 * Upload a file directly to the Library.
 * @param {File} file
 * @param {'library'|'knowledge'|'chat'} source
 */
export async function uploadToLibrary(file, source = 'library') {
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${API_BASE_URL}/files/upload?source=${encodeURIComponent(source)}`, {
    method: 'POST',
    body: form,
  })
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}))
    throw new Error(detail.detail || `Upload failed (${res.status})`)
  }
  return await res.json()  // { document_id, job_id, status, message }
}

/**
 * Download a file as a Blob.
 * @param {string} documentId
 */
export async function downloadLibraryFile(documentId) {
  const res = await fetch(`${API_BASE_URL}/files/${documentId}/download`)
  if (!res.ok) throw new Error(`Download failed (${res.status})`)
  return await res.blob()
}

/**
 * Delete a file from the Library (and its vectors).
 * @param {string} documentId
 */
export async function deleteLibraryFile(documentId) {
  const res = await fetch(`${API_BASE_URL}/files/${documentId}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`Delete failed (${res.status})`)
  return await res.json()
}
