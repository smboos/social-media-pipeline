import { useState, useEffect } from 'react';

function getDaysLeft(lastPostDate, intervalDays = 7) {
  if (!lastPostDate) return '-';
  const lastDate = new Date(lastPostDate);
  const nextDue = new Date(lastDate);
  nextDue.setDate(lastDate.getDate() + Number(intervalDays));
  const today = new Date();
  const diffTime = nextDue - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 ? diffDays : 0;
}

const LOCAL_STORAGE_KEY = 'socialMediaChannels';

function App() {
  const [channels, setChannels] = useState([]);
  const [channelName, setChannelName] = useState('');
  const [lastPostDate, setLastPostDate] = useState('');
  const [intervalDays, setIntervalDays] = useState(7);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editName, setEditName] = useState('');
  const [editInterval, setEditInterval] = useState(7);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setChannels(JSON.parse(stored));
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(channels));
  }, [channels]);

  const addChannel = (e) => {
    e.preventDefault();
    if (!channelName || !lastPostDate || !intervalDays) return;
    if (channels.some(ch => ch.name.toLowerCase() === channelName.toLowerCase())) {
      alert('Channel name already exists!');
      return;
    }
    setChannels([
      ...channels,
      { name: channelName, lastPostDate, intervalDays: Number(intervalDays) }
    ]);
    setChannelName('');
    setLastPostDate('');
    setIntervalDays(7);
  };

  const updateLastPostDate = (idx, date) => {
    const updated = [...channels];
    updated[idx].lastPostDate = date;
    setChannels(updated);
  };

  const updateInterval = (idx, interval) => {
    const updated = [...channels];
    updated[idx].intervalDays = Number(interval);
    setChannels(updated);
  };

  const removeChannel = (idx) => {
    setChannels(channels.filter((_, i) => i !== idx));
  };

  const startEdit = (idx) => {
    setEditingIdx(idx);
    setEditName(channels[idx].name);
    setEditInterval(channels[idx].intervalDays);
  };

  const saveEdit = (idx) => {
    if (!editName) return;
    if (
      channels.some(
        (ch, i) =>
          ch.name.toLowerCase() === editName.toLowerCase() && i !== idx
      )
    ) {
      alert('Channel name already exists!');
      return;
    }
    const updated = [...channels];
    updated[idx].name = editName;
    updated[idx].intervalDays = Number(editInterval);
    setChannels(updated);
    setEditingIdx(null);
  };

  const clearAll = () => {
    if (window.confirm('Are you sure you want to clear all channels?')) {
      setChannels([]);
    }
  };

  return (
    <div className="app-container">
      <h1>Social Media Pipeline</h1>
      <form onSubmit={addChannel} style={{ marginBottom: '1rem', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Channel name"
          value={channelName}
          onChange={e => setChannelName(e.target.value)}
          required
        />
        <input
          type="date"
          value={lastPostDate}
          onChange={e => setLastPostDate(e.target.value)}
          required
        />
        <input
          type="number"
          min={1}
          value={intervalDays}
          onChange={e => setIntervalDays(e.target.value)}
          style={{ width: 60 }}
          required
          title="Days between posts"
        />
        <button type="submit">Add</button>
      </form>
      <div className="tip">
        <b>Tip:</b> Set the posting interval (days) for each channel.
      </div>
      {channels.length === 0 ? (
        <div className="empty-state">
          No channels yet. Add your first one above!
        </div>
      ) : (
        <ul style={{ padding: 0, listStyle: 'none' }}>
          {channels.map((ch, idx) => (
            <li key={idx} style={{ marginBottom: '1.5rem', borderBottom: '1px solid #eee', paddingBottom: 12 }}>
              {editingIdx === idx ? (
                <div>
                  <input
                    type="text"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    style={{ marginRight: 8 }}
                  />
                  <input
                    type="number"
                    min={1}
                    value={editInterval}
                    onChange={e => setEditInterval(e.target.value)}
                    style={{ width: 60, marginRight: 8 }}
                  />
                  <button onClick={() => saveEdit(idx)}>Save</button>
                  <button onClick={() => setEditingIdx(null)} style={{ marginLeft: 4 }}>Cancel</button>
                </div>
              ) : (
                <div>
                  <strong>{ch.name}</strong> (every {ch.intervalDays} days)
                  <button onClick={() => startEdit(idx)} style={{ marginLeft: 8 }}>Edit</button>
                </div>
              )}
              <div style={{ marginTop: 4 }}>
                Last post:
                <input
                  type="date"
                  value={ch.lastPostDate}
                  onChange={e => updateLastPostDate(idx, e.target.value)}
                  style={{ marginLeft: 8 }}
                />
              </div>
              <div style={{ marginTop: 4 }}>
                Days left until pipeline empty: <b>{getDaysLeft(ch.lastPostDate, ch.intervalDays)}</b>
              </div>
              <button onClick={() => removeChannel(idx)} className="remove-btn">Remove</button>
            </li>
          ))}
        </ul>
      )}
      {channels.length > 0 && (
        <button onClick={clearAll} className="clear-btn">
          Clear All
        </button>
      )}
    </div>
  );
}

export default App;