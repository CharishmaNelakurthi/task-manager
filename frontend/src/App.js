import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API = 'http://localhost:5000/api/tasks';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [filter, setFilter] = useState('all');
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    const res = await axios.get(API);
    setTasks(res.data);
  };

  const addTask = async () => {
    if (!title.trim()) return;
    await axios.post(API, { title, priority, dueDate });
    setTitle(''); setPriority('medium'); setDueDate('');
    fetchTasks();
  };

  const toggleTask = async (id) => {
    await axios.patch(`${API}/${id}`);
    fetchTasks();
  };

  const deleteTask = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchTasks();
  };

  const handleKey = (e) => { if (e.key === 'Enter') addTask(); };

  const filtered = tasks.filter(t => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    if (filter === 'high') return t.priority === 'high';
    return true;
  });

  const completed = tasks.filter(t => t.completed).length;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  const isOverdue = (date) => date && new Date(date) < new Date();

  return (
    <div className={`app ${darkMode ? 'dark' : ''}`}>
      <div className="card">
        <div className="header">
          <div>
            <h1>✅ Task Manager</h1>
            <p className="subtitle">Stay organized, stay productive</p>
          </div>
          <button className="dark-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-label">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
          <div className="stats">
            <span>📝 {tasks.length} total</span>
            <span>⏳ {tasks.length - completed} remaining</span>
            <span>✅ {completed} done</span>
          </div>
        </div>

        {/* Input */}
        <div className="input-section">
          <div className="input-row">
            <input
              type="text"
              placeholder="Add a new task..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={handleKey}
            />
            <button onClick={addTask}>Add</button>
          </div>
          <div className="input-extra">
            <select value={priority} onChange={e => setPriority(e.target.value)}>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>
            <input
              type="date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Filters */}
        <div className="filters">
          {['all', 'active', 'completed', 'high'].map(f => (
            <button key={f} className={filter === f ? 'active' : ''} onClick={() => setFilter(f)}>
              {f === 'all' ? '📋 All' : f === 'active' ? '⏳ Active' : f === 'completed' ? '✅ Done' : '🔴 High'}
            </button>
          ))}
        </div>

        {/* Task List */}
        <ul>
          {filtered.length === 0 && <p className="empty">No tasks here!</p>}
          {filtered.map(task => (
            <li key={task._id} className={`${task.completed ? 'done' : ''} priority-${task.priority || 'medium'}`}>
              <input type="checkbox" checked={task.completed} onChange={() => toggleTask(task._id)} />
              <div className="task-info">
                <span className="task-title">{task.title}</span>
                <div className="task-meta">
                  <span className={`badge ${task.priority || 'medium'}`}>
                    {task.priority === 'high' ? '🔴 High' : task.priority === 'low' ? '🟢 Low' : '🟡 Medium'}
                  </span>
                  {task.dueDate && (
                    <span className={`due ${isOverdue(task.dueDate) && !task.completed ? 'overdue' : ''}`}>
                      📅 {new Date(task.dueDate).toLocaleDateString()}
                      {isOverdue(task.dueDate) && !task.completed ? ' ⚠️ Overdue' : ''}
                    </span>
                  )}
                </div>
              </div>
              <button className="del" onClick={() => deleteTask(task._id)}>🗑</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default App;