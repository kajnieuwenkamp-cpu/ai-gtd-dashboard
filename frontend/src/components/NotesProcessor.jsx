import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { processNotes, createTask } from '../api/tasks'

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }
const PRIORITY_LABELS = { low: 'Laag', medium: 'Medium', high: 'Hoog' }

export default function NotesProcessor() {
  const [input, setInput] = useState('')
  const [results, setResults] = useState(null)
  const [added, setAdded] = useState(new Set())
  const queryClient = useQueryClient()

  const processMutation = useMutation({
    mutationFn: processNotes,
    onSuccess: (data) => {
      setResults(data.actions)
      setAdded(new Set())
    },
  })

  const addMutation = useMutation({
    mutationFn: createTask,
    onSuccess: (_, vars) => {
      setAdded(prev => new Set([...prev, vars._idx]))
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  function addAction(action, idx) {
    addMutation.mutate({
      title: action.next_action,
      priority: action.priority,
      status: action.action_type === 'waiting' ? 'waiting' : 'next_action',
      context: action.context,
      _idx: idx,
    })
  }

  function addAll() {
    results?.forEach((action, idx) => {
      if (!added.has(idx)) addAction(action, idx)
    })
  }

  return (
    <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 10, padding: 16, marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#0369a1' }}>📋 Vergadernotities verwerken</h3>

      <textarea
        value={input}
        onChange={e => setInput(e.target.value)}
        placeholder="Plak hier je vergadernotities..."
        rows={5}
        style={{ width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #bae6fd', fontFamily: 'inherit', fontSize: 14, resize: 'vertical', boxSizing: 'border-box' }}
      />

      <div style={{ display: 'flex', gap: 8, marginTop: 8, marginBottom: results ? 16 : 0 }}>
        <button
          onClick={() => input.trim() && processMutation.mutate(input)}
          disabled={processMutation.isPending || !input.trim()}
          style={{ padding: '8px 16px', borderRadius: 6, background: '#0ea5e9', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {processMutation.isPending ? 'Analyseren...' : 'Extraheer acties'}
        </button>
        {results && (
          <button
            onClick={() => { setResults(null); setInput('') }}
            style={{ padding: '8px 16px', borderRadius: 6, background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer' }}
          >
            Wissen
          </button>
        )}
      </div>

      {results && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: '#0369a1' }}>
              {results.length} acties gevonden
            </span>
            <button
              onClick={addAll}
              style={{ padding: '5px 12px', borderRadius: 6, background: '#0ea5e9', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}
            >
              Alles toevoegen
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {results.map((action, idx) => (
              <div key={idx} style={{
                background: added.has(idx) ? '#f0fdf4' : '#fff',
                border: `1px solid ${added.has(idx) ? '#bbf7d0' : '#e5e7eb'}`,
                borderRadius: 8, padding: '10px 12px',
                display: 'flex', alignItems: 'flex-start', gap: 10,
              }}>
                <span style={{
                  width: 10, height: 10, borderRadius: '50%', flexShrink: 0, marginTop: 4,
                  background: PRIORITY_COLORS[action.priority],
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontWeight: 500, fontSize: 14 }}>{action.next_action}</span>
                    {action.action_type === 'waiting' && (
                      <span style={{ fontSize: 11, background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: 10 }}>
                        Wachten op
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280', display: 'flex', gap: 8 }}>
                    <span>{PRIORITY_LABELS[action.priority]}</span>
                    {action.context && <span>{action.context}</span>}
                    {action.assignee !== 'ik' && <span>👤 {action.assignee}</span>}
                    {action.due_hint && <span>📅 {action.due_hint}</span>}
                  </div>
                </div>
                <button
                  onClick={() => addAction(action, idx)}
                  disabled={added.has(idx)}
                  style={{
                    padding: '4px 10px', borderRadius: 6, fontSize: 12, border: 'none', cursor: added.has(idx) ? 'default' : 'pointer',
                    background: added.has(idx) ? '#dcfce7' : '#0ea5e9',
                    color: added.has(idx) ? '#16a34a' : '#fff',
                    flexShrink: 0,
                  }}
                >
                  {added.has(idx) ? '✓ Toegevoegd' : '+ Voeg toe'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
