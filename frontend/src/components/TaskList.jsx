import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateTask, deleteTask } from '../api/tasks'

const STATUS_LABELS = {
  inbox: 'Inbox',
  next_action: 'Volgende actie',
  waiting: 'Wachten',
  someday: 'Ooit/misschien',
  done: 'Gedaan',
}

const PRIORITY_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' }

export default function TaskList({ tasks }) {
  const queryClient = useQueryClient()

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => updateTask(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteTask(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  if (!tasks?.length) return <p style={{ color: '#888' }}>Geen taken gevonden.</p>

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
      {tasks.map(task => (
        <li key={task.id} style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '10px 12px', marginBottom: 8,
          background: '#fff', borderRadius: 8,
          border: '1px solid #e5e7eb',
          opacity: task.status === 'done' ? 0.5 : 1,
        }}>
          <span style={{
            width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
            background: PRIORITY_COLORS[task.priority],
          }} />
          <span style={{ flex: 1, textDecoration: task.status === 'done' ? 'line-through' : 'none' }}>
            {task.title}
          </span>
          <select
            value={task.status}
            onChange={e => updateMutation.mutate({ id: task.id, data: { status: e.target.value } })}
            style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid #ccc', fontSize: 13 }}
          >
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
          <button
            onClick={() => deleteMutation.mutate(task.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: 16 }}
          >✕</button>
        </li>
      ))}
    </ul>
  )
}
