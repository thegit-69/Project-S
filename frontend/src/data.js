export const models = [
  { id: 'llama-3-70b', name: 'Llama-3-70B-Sovereign', params: '70B', ctx: '64k', status: 'Loaded', tasks: ['Reasoning', 'Documents'] },
  { id: 'qwen-coder', name: 'Qwen2.5-Coder-32B', params: '32B', ctx: '32k', status: 'Loaded', tasks: ['Coding'] },
  { id: 'qwen-vl', name: 'Qwen2-VL-7B', params: '7B', ctx: '32k', status: 'Idle', tasks: ['Vision', 'OCR'] },
  { id: 'phi-mini', name: 'Phi-3-mini-4k', params: '3.8B', ctx: '4k', status: 'Idle', tasks: ['Summaries'] },
]

export const documents = [
  { id: 1, name: 'SOP-114 Pump Maintenance.pdf', kind: 'SOP', pages: 38, updated: '2026-08-02', excerpt: 'Feedwater pump casing vibration above 4.5 mm/s requires immediate isolation and inspection before restart.' },
  { id: 2, name: 'Inspection_Report_Q3.pdf', kind: 'Report', pages: 52, updated: '2026-09-14', excerpt: 'Corrosion identified at the secondary heat exchanger bypass flange weld seam. Wall thickness below allowable margin.' },
  { id: 3, name: 'Relief Valve Calibration Manual.pdf', kind: 'Manual', pages: 24, updated: '2026-06-30', excerpt: 'Re-calibration interval for isolation relief valves is 12 months; overdue valves must be tagged out.' },
  { id: 4, name: 'Vendor Correspondence 2026.eml', kind: 'Mail', pages: 9, updated: '2026-09-02', excerpt: 'Vendor confirms lead time of 6 weeks for replacement bearings on the 2B pump assembly.' },
]

export const logs = [
  { t: '14:28:12', tier: 'INFO', msg: 'Inference completed · Llama-3-70B-Sovereign · 4,120 tokens', hash: 'a91f3c' },
  { t: '14:27:48', tier: 'INFO', msg: 'Retrieved 6 chunks from local knowledge base', hash: '7be20d' },
  { t: '14:27:31', tier: 'WARN', msg: 'Model Qwen2-VL-7B loading time exceeded 3s', hash: 'c04e19' },
  { t: '14:26:02', tier: 'INFO', msg: 'Auto-route selected Llama-3-70B for task: document summary', hash: '2fd8a6' },
  { t: '14:21:55', tier: 'ERROR', msg: 'Sandbox exit code 1 · syntax error line 14', hash: '9e55b1' },
  { t: '14:20:09', tier: 'INFO', msg: 'Outbound network calls: 0 · air-gap verified', hash: '4b7a02' },
]
