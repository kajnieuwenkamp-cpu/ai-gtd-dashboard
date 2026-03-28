import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { processInbox, createTask } from '../api/tasks'

export default function InboxProcessor() {
  const [input, setInput] = useState('')
  const [result, setResult] = useState(null)
  const queryClient = useQueryClient()

  const processMutation = useMutation({
    mutationFn: processInbox,
    onSuccess: (data) => setResult(data),
  })

  const addMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setResult(null)
      setInput('')
    },
  })

  const ACTION_LABELS = { do: 'Direct doen', delegate: 'Delegeren', defer: 'Uitstellen', delete: 'Verwijderen' }
  const ACTION_COLORS = { do: '#4f46e5', delegate: '#f59e0b', defer: '#6b7280', delete: '#ef4444' }

  return (
    <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: 16, marginBottom: 24 }}>
      <h3 style={{ margin: '0 0 12px', fontSize: 15, color: '#374151' }}>⚡ Inbox verwerken</h3>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Beschrijf een inbox-item..."
          style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
          onKeyDown={e => e.key === 'Enter' && input.trim() && processMutation.mutate(input)}
        />
        <button
          onClick={() => input.trim() && processMutation.mutate(input)}
          disabled={processMutation.isPending}
          style={{ padding: '8px 16px', borderRadius: 6, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer' }}
        >
          {processMutation.isPending ? '...' : 'Analyseer'}
        </button>
      </div>

      {result && (
        <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, padding: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{
              background: ACTION_COLORS[result.action_type], color: '#fff',
              padding: '2px 10px', borderRadius: 12, fontSize: 13, fontWeight: 600,
            }}>
              {ACTION_LABELS[result.action_type]}
            </span>
            <span style={{ fontSize: 13, color: '#6b7280' }}>{result.context}</span>
          </div>
          <p style={{ margin: '0 0 6px', fontWeight: 500 }}>{result.next_action}</p>
          {result.project && <p style={{ margin: '0 0 6px', fontSize: 13, color: '#6b7280' }}>📁 {result.project}</p>}
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#9ca3af' }}>{result.reasoning}</p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => addMutation.mutate({
                title: result.next_action,
                priority: result.priority,
                status: 'next_action',
                project: result.project,
                context: result.context,
              })}
              style={{ padding: '6px 14px', borderRadius: 6, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13 }}
            >
              Toevoegen als taak
            </button>
            <button
              onClick={() => { setResult(null); setInput('') }}
              style={{ padding: '6px 14px', borderRadius: 6, background: '#f3f4f6', color: '#374151', border: 'none', cursor: 'pointer', fontSize: 13 }}
            >
              Verwerpen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
