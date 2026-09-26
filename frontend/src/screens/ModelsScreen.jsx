import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, RefreshCw, Loader2, X, Trash2, Pencil, Cpu, Eye, Code2,
  Bot, Type, ShieldCheck, Zap, Route, CircleDot, Server,
} from 'lucide-react'
import {
  listModelCatalog,
  createModelDefinition,
  updateModelDefinition,
  deleteModelDefinition,
  reloadModels,
  runAgentTask,
} from '../services/api.js'

// Capability chips rendered on each model card.
const CAPS = [
  { key: 'vision', label: 'Vision', Icon: Eye },
  { key: 'code', label: 'Code', Icon: Code2 },
  { key: 'agentic', label: 'Agentic', Icon: Bot },
  { key: 'text', label: 'Text', Icon: Type },
]

// The deterministic routing rules, shown verbatim in the Auto-routing panel.
const ROUTING_RULES = [
  { Icon: Eye, title: 'Image input', rule: 'requires a vision-capable model', to: 'Gemma 3 4B' },
  { Icon: Code2, title: 'Code / agentic task', rule: 'code, agentic, multi-step or calculation', to: 'Qwen3 4B' },
  { Icon: Route, title: 'Everything else', rule: 'general question / synthesis', to: 'general model' },
]

const EMPTY_FORM = {
  key: '', display_name: '', base_url: 'http://127.0.0.1:8082', model_id: '',
  model_path: '', mmproj_path: '', timeout: 120, max_context_tokens: 8192,
  priority: 10, enabled: true,
  capabilities: { text: true, vision: false, code: false, agentic: false },
  task_types: 'general',
}

function statusColor(status) {
  if (status === 'available') return '#176B5B'
  if (status === 'timeout' || status === 'misconfigured') return '#C08A2D'
  return '#9AA09A'
}

// Convert a catalog card object into a POST/PUT body the backend accepts.
function toDefinition(m) {
  return {
    key: m.key, display_name: m.display_name, provider_type: 'llama_cpp',
    base_url: m.base_url, model_id: m.model_id, model_path: m.model_path || null,
    mmproj_path: m.mmproj_path || null, timeout: m.timeout ?? 120,
    max_context_tokens: m.max_context_tokens ?? 8192,
    capabilities: m.capabilities, task_types: m.task_types || [],
    priority: m.priority ?? 10, enabled: m.enabled,
  }
}

export default function ModelsScreen() {
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState(null) // null = closed; object = add/edit modal
  const [editingKey, setEditingKey] = useState(null)

  // Auto-routing tester
  const [testTask, setTestTask] = useState('')
  const [testResult, setTestResult] = useState(null)
  const [testing, setTesting] = useState(false)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const data = await listModelCatalog()
      setModels(data.models || [])
      setError('')
    } catch (err) {
      setError(err.message || 'Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleReload = async () => {
    setBusy(true)
    try { await reloadModels(); await refresh() } finally { setBusy(false) }
  }

  const toggleEnabled = async (m) => {
    setBusy(true)
    try {
      await updateModelDefinition(m.key, { ...toDefinition(m), enabled: !m.enabled })
      await refresh()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const handleDelete = async (key) => {
    if (!window.confirm(`Remove model "${key}" from the catalog?`)) return
    setBusy(true)
    try { await deleteModelDefinition(key); await refresh() }
    catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const openAdd = () => { setEditingKey(null); setForm({ ...EMPTY_FORM }) }
  const openEdit = (m) => {
    setEditingKey(m.key)
    setForm({
      ...m, model_path: m.model_path || '', mmproj_path: m.mmproj_path || '',
      task_types: (m.task_types || []).join(', ')
    })
  }

  const submitForm = async (e) => {
    e.preventDefault()
    setBusy(true)
    setError('')
    const payload = {
      ...form, provider_type: 'llama_cpp',
      model_path: form.model_path || null, mmproj_path: form.mmproj_path || null,
      timeout: Number(form.timeout) || 120,
      max_context_tokens: Number(form.max_context_tokens) || 8192,
      priority: Number(form.priority) || 10,
      task_types: String(form.task_types).split(',').map((s) => s.trim()).filter(Boolean),
    }
    try {
      if (editingKey) await updateModelDefinition(editingKey, payload)
      else await createModelDefinition(payload)
      setForm(null)
      await refresh()
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  const runRoutingTest = async () => {
    if (!testTask.trim()) return
    setTesting(true)
    try {
      const res = await runAgentTask(testTask, null)
      setTestResult({
        model: res.selected_model, reason: res.selection_reason, type: res.task_type,
      })
    } catch (err) {
      setTestResult({ model: '—', reason: err.message, type: 'error' })
    } finally { setTesting(false) }
  }

  return (
    <div className="min-h-screen bg-[#F7F6F2] dark:bg-[#151614] text-[#20211F] dark:text-[#ECEAE3]">
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h1 className="text-3xl font-normal tracking-tight">Models</h1>
            <p className="text-sm text-[#6B6E68] dark:text-[#9AA09A] mt-1">
              Multi-model registry · deterministic auto-routing · add models without a restart.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleReload}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-[#E2DED5] dark:border-[#30332B] bg-white dark:bg-[#1E201C] text-sm hover:bg-[#EFECE4] dark:hover:bg-[#262922] transition-colors disabled:opacity-50"
            >
              <RefreshCw size={15} className={busy ? 'animate-spin' : ''} /> Reload
            </button>
            <button
              onClick={openAdd}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-white text-sm font-medium shadow-sm transition-colors"
              style={{ backgroundColor: '#176B5B' }}
            >
              <Plus size={15} /> Add Model
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 px-4 py-2.5 rounded-md border border-[#D98C8C] bg-[#F8E9E9] dark:bg-[#2A1D1D] text-[#9B3B3B] dark:text-[#E0A0A0] text-sm">
            {error}
          </div>
        )}

        {/* Auto-routing panel */}
        <section className="mb-6 rounded-lg border border-[#E2DED5] dark:border-[#30332B] bg-white dark:bg-[#1E201C] p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Route size={18} style={{ color: '#176B5B' }} />
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#176B5B' }}>
              Auto-routing
            </h2>
            <span className="text-xs text-[#6B6E68] dark:text-[#9AA09A]">
              deterministic · no LLM call · fully auditable
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            {ROUTING_RULES.map(({ Icon, title, rule, to }) => (
              <div key={title} className="rounded-md border border-[#E2DED5] dark:border-[#30332B] bg-[#F7F6F2] dark:bg-[#151614] p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={15} style={{ color: '#176B5B' }} />
                  <span className="text-sm font-medium">{title}</span>
                </div>
                <p className="text-xs text-[#6B6E68] dark:text-[#9AA09A]">{rule}</p>
                <p className="text-xs mt-1 font-mono" style={{ color: '#176B5B' }}>→ {to}</p>
              </div>
            ))}
          </div>
          {/* Routing tester */}
          <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
            <input
              value={testTask}
              onChange={(e) => setTestTask(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runRoutingTest()}
              placeholder="Try a task, e.g. “refactor this python function”…"
              className="flex-1 px-3 py-2 rounded-md border border-[#E2DED5] dark:border-[#30332B] bg-[#F7F6F2] dark:bg-[#151614] text-sm outline-none focus:border-[#176B5B]"
            />
            <button
              onClick={runRoutingTest}
              disabled={testing}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-[#176B5B] text-sm font-medium transition-colors disabled:opacity-50"
              style={{ color: '#176B5B' }}
            >
              {testing ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />} Test routing
            </button>
          </div>
          {testResult && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-[#6B6E68] dark:text-[#9AA09A]">Routed to</span>
              <span className="px-2 py-0.5 rounded font-mono text-white" style={{ backgroundColor: '#176B5B' }}>
                {testResult.model}
              </span>
              <span className="px-2 py-0.5 rounded border border-[#E2DED5] dark:border-[#30332B] font-mono text-xs">
                {testResult.type}
              </span>
              <span className="text-[#6B6E68] dark:text-[#9AA09A] italic">{testResult.reason}</span>
            </div>
          )}
        </section>

        {/* Model cards */}
        {loading ? (
          <div className="flex items-center justify-center py-16 text-[#6B6E68]">
            <Loader2 size={22} className="animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {models.map((m) => (
              <ModelCard
                key={m.key} m={m} busy={busy}
                onToggle={() => toggleEnabled(m)}
                onEdit={() => openEdit(m)}
                onDelete={() => handleDelete(m.key)}
              />
            ))}
          </div>
        )}

        {/* Air-gap footer */}
        <div className="mt-8 flex items-center gap-2 text-xs text-[#6B6E68] dark:text-[#9AA09A]">
          <ShieldCheck size={14} style={{ color: '#176B5B' }} />
          All endpoints are loopback-enforced · zero external telemetry · sovereign air-gap verified.
        </div>
      </main>

      <AnimatePresence>
        {form && (
          <ModelFormModal
            form={form} setForm={setForm} onSubmit={submitForm}
            onClose={() => setForm(null)} busy={busy} isEdit={!!editingKey}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function ModelCard({ m, busy, onToggle, onEdit, onDelete }) {
  const enabledCaps = CAPS.filter((c) => m.capabilities?.[c.key])
  return (
    <div className={`rounded-lg border p-4 shadow-sm transition-opacity ${m.enabled ? 'opacity-100' : 'opacity-60'} border-[#E2DED5] dark:border-[#30332B] bg-white dark:bg-[#1E201C]`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Cpu size={16} style={{ color: '#176B5B' }} />
            <h3 className="text-lg font-medium tracking-tight truncate">{m.display_name}</h3>
            <span className="px-1.5 py-0.5 rounded font-mono text-[10px] border border-[#E2DED5] dark:border-[#30332B] text-[#6B6E68] dark:text-[#9AA09A]">
              {m.key}
            </span>
          </div>
          <p className="text-xs font-mono text-[#6B6E68] dark:text-[#9AA09A] mt-1 truncate">
            {m.model_id}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <CircleDot size={13} style={{ color: statusColor(m.status) }} />
          <span className="text-xs font-medium" style={{ color: statusColor(m.status) }}>
            {(m.status || 'unknown').toUpperCase()}
          </span>
        </div>
      </div>

      {/* Endpoint + priority */}
      <div className="flex items-center gap-3 mt-3 text-xs text-[#6B6E68] dark:text-[#9AA09A] font-mono">
        <span className="inline-flex items-center gap-1"><Server size={12} /> {m.base_url}</span>
        <span>priority {m.priority}</span>
      </div>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {enabledCaps.map(({ key, label, Icon }) => (
          <span key={key} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border"
            style={{ backgroundColor: '#E4F0EC', color: '#176B5B', borderColor: '#C0DED6' }}>
            <Icon size={12} /> {label}
          </span>
        ))}
      </div>

      {/* Routes */}
      {m.routes?.length > 0 && (
        <p className="text-xs text-[#6B6E68] dark:text-[#9AA09A] mt-2">
          <span className="font-medium">routes:</span> {m.routes.join(', ')}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#E2DED5] dark:border-[#30332B]">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" checked={!!m.enabled} disabled={busy}
            onChange={onToggle} className="sr-only peer" />
          <span className="relative w-9 h-5 rounded-full transition-colors bg-[#CFD2CB] dark:bg-[#3A3D35] peer-checked:bg-[#176B5B] after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-4" />
          <span className="text-xs text-[#6B6E68] dark:text-[#9AA09A]">
            {m.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>
        <div className="flex items-center gap-1">
          <button onClick={onEdit} disabled={busy}
            className="p-1.5 rounded-md hover:bg-[#EFECE4] dark:hover:bg-[#262922] transition-colors" title="Edit">
            <Pencil size={15} className="text-[#6B6E68] dark:text-[#9AA09A]" />
          </button>
          <button onClick={onDelete} disabled={busy}
            className="p-1.5 rounded-md hover:bg-[#F8E9E9] dark:hover:bg-[#2A1D1D] transition-colors" title="Delete">
            <Trash2 size={15} className="text-[#9B3B3B]" />
          </button>
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'w-full px-3 py-2 rounded-md border border-[#E2DED5] dark:border-[#30332B] bg-[#F7F6F2] dark:bg-[#151614] text-sm outline-none focus:border-[#176B5B]'
const labelCls = 'text-xs font-medium text-[#6B6E68] dark:text-[#9AA09A] mb-1 block'

function ModelFormModal({ form, setForm, onSubmit, onClose, busy, isEdit }) {
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setCap = (k, v) => setForm((f) => ({ ...f, capabilities: { ...f.capabilities, [k]: v } }))
  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        onSubmit={onSubmit} onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.96, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.96, opacity: 0 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-lg border border-[#E2DED5] dark:border-[#30332B] bg-white dark:bg-[#1E201C] p-5 shadow-xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-medium">{isEdit ? 'Edit model' : 'Add model'}</h2>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-[#EFECE4] dark:hover:bg-[#262922]">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Key</label>
            <input className={inputCls} value={form.key} required disabled={isEdit}
              onChange={(e) => set('key', e.target.value)} placeholder="e.g. coder" />
          </div>
          <div>
            <label className={labelCls}>Display name</label>
            <input className={inputCls} value={form.display_name} required
              onChange={(e) => set('display_name', e.target.value)} placeholder="Qwen3 4B" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Base URL (loopback only)</label>
            <input className={inputCls} value={form.base_url} required
              onChange={(e) => set('base_url', e.target.value)} placeholder="http://127.0.0.1:8082" />
          </div>
          <div>
            <label className={labelCls}>Model ID</label>
            <input className={inputCls} value={form.model_id} required
              onChange={(e) => set('model_id', e.target.value)} placeholder="qwen3-4b" />
          </div>
          <div>
            <label className={labelCls}>Priority</label>
            <input className={inputCls} type="number" value={form.priority}
              onChange={(e) => set('priority', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Model path (optional)</label>
            <input className={inputCls} value={form.model_path}
              onChange={(e) => set('model_path', e.target.value)} placeholder="models/qwen3-4b-Q4_K_M.gguf" />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>mmproj path (vision, optional)</label>
            <input className={inputCls} value={form.mmproj_path}
              onChange={(e) => set('mmproj_path', e.target.value)} placeholder="models/mmproj-…gguf" />
          </div>
          <div>
            <label className={labelCls}>Timeout (s)</label>
            <input className={inputCls} type="number" value={form.timeout}
              onChange={(e) => set('timeout', e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Max context tokens</label>
            <input className={inputCls} type="number" value={form.max_context_tokens}
              onChange={(e) => set('max_context_tokens', e.target.value)} />
          </div>
          <div className="col-span-2">
            <label className={labelCls}>Task types (comma-separated)</label>
            <input className={inputCls} value={form.task_types}
              onChange={(e) => set('task_types', e.target.value)} placeholder="code, agentic, multi_step" />
          </div>
        </div>

        <div className="mt-4">
          <label className={labelCls}>Capabilities</label>
          <div className="flex flex-wrap gap-3">
            {CAPS.map(({ key, label, Icon }) => (
              <label key={key} className="inline-flex items-center gap-1.5 text-sm cursor-pointer">
                <input type="checkbox" checked={!!form.capabilities[key]}
                  onChange={(e) => setCap(key, e.target.checked)}
                  className="accent-[#176B5B]" />
                <Icon size={14} /> {label}
              </label>
            ))}
          </div>
        </div>

        <label className="mt-4 inline-flex items-center gap-2 text-sm cursor-pointer">
          <input type="checkbox" checked={!!form.enabled}
            onChange={(e) => set('enabled', e.target.checked)} className="accent-[#176B5B]" />
          Enabled
        </label>

        <div className="flex justify-end gap-2 mt-5">
          <button type="button" onClick={onClose}
            className="px-3 py-2 rounded-md border border-[#E2DED5] dark:border-[#30332B] text-sm hover:bg-[#EFECE4] dark:hover:bg-[#262922]">
            Cancel
          </button>
          <button type="submit" disabled={busy}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-white text-sm font-medium shadow-sm disabled:opacity-50"
            style={{ backgroundColor: '#176B5B' }}>
            {busy && <Loader2 size={15} className="animate-spin" />}
            {isEdit ? 'Save changes' : 'Add model'}
          </button>
        </div>
      </motion.form>
    </motion.div>
  )
}



