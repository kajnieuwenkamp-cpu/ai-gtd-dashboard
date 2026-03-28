import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask } from './api/tasks'
import TaskForm from './components/TaskForm'
import TaskList from './components/TaskList'
import InboxProcessor from './components/InboxProcessor'
import NotesProcessor from './components/NotesProcessor'
import { useState } from 'react'

const STATUS_FILTERS = [
  { value: '', label: 'Alle' },
  { value: 'inbox', label: 'Inbox' },
  { value: 'next_action', label: 'Volgende acties' },
  { value: 'waiting', label: 'Wachten' },
  { value: 'someday', label: 'Ooit/misschien' },
  { value: 'done', label: 'Gedaan' },
]

export default function App() {
  const [filter, setFilter] = useState('')
  const queryClient = useQueryClient()

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks', filter],
    queryFn: () => getTasks(filter ? { status: filter } : {}),
  })

  const addMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: '#111827' }}>
        AI GTD Dashboard
      </h1>
      <p style={{ margin: '0 0 24px', color: '#6b7280', fontSize: 14 }}>
        Getting Things Done — aangedreven door Claude AI
      </p>

      <NotesProcessor />
      <InboxProcessor />

      <TaskForm onAdd={data => addMutation.mutate(data)} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              padding: '4px 12px', borderRadius: 20, fontSize: 13, cursor: 'pointer',
              background: filter === f.value ? '#4f46e5' : '#f3f4f6',
              color: filter === f.value ? '#fff' : '#374151',
              border: 'none',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p style={{ color: '#9ca3af' }}>Laden...</p>
      ) : (
        <TaskList tasks={tasks} />
      )}
    </div>
  )
}
