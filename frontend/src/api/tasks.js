import axios from 'axios'

const api = axios.create({ baseURL: 'http://localhost:8000' })

export const getTasks = (params) => api.get('/tasks', { params }).then(r => r.data)
export const createTask = (data) => api.post('/tasks', data).then(r => r.data)
export const updateTask = (id, data) => api.patch(`/tasks/${id}`, data).then(r => r.data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)
export const processInbox = (message) => api.post('/ai/process-inbox', { message }).then(r => r.data)
export const processNotes = (message) => api.post('/ai/process-notes', { message }).then(r => r.data)
