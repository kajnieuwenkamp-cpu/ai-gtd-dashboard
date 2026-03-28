import { useState } from 'react'

export default function TaskForm({ onAdd }) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState('medium')

  function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    onAdd({ title: title.trim(), priority, status: 'inbox' })
    setTitle('')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Nieuwe taak toevoegen..."
        style={{ flex: 1, padding: '8px 12px', borderRadius: 6, border: '1px solid #ccc' }}
      />
      <select
        value={priority}
        onChange={e => setPriority(e.target.value)}
        style={{ padding: '8px', borderRadius: 6, border: '1px solid #ccc' }}
      >
        <option value="low">Laag</option>
        <option value="medium">Medium</option>
        <option value="high">Hoog</option>
      </select>
      <button type="submit" style={{ padding: '8px 16px', borderRadius: 6, background: '#4f46e5', color: '#fff', border: 'none', cursor: 'pointer' }}>
        Toevoegen
      </button>
    </form>
  )
}
