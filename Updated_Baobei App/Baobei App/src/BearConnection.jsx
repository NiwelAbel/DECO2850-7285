import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getBearStatus } from './lib/hardware';

const Connection = createContext(null);

export function BearProvider({ children }) {
  const [key, setKey] = useState(() => localStorage.getItem('baobeiPairingKey') || '');
  const [state, setState] = useState(null);
  const [error, setError] = useState('');
  const [reachable, setReachable] = useState(false);
  const [localActivities, setLocalActivities] = useState([]);
  const lightQueue = useRef(Promise.resolve());
  const request = useCallback(async (route, options = {}) => {
    const response = await fetch(route, { ...options, signal: options.signal || AbortSignal.timeout(6000),
      headers: { Authorization: `Bearer ${key}`, ...options.headers } });
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.error || `Request failed (${response.status})`);
    }
    return response;
  }, [key]);

  useEffect(() => {
    let disposed = false;
    let timer;
    const controller = new AbortController();
    setReachable(false);
    setState(null);
    async function poll() {
      try {
        const response = await request('/api/state', { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(6000)]) });
        const next = await response.json();
        if (!disposed) { setState(next); setReachable(true); setError(''); }
      } catch (failure) {
        if (!disposed) { setReachable(false); setError(failure.message); }
      }
      if (!disposed) timer = setTimeout(poll, 500);
    }
    if (key) poll();
    return () => { disposed = true; clearTimeout(timer); controller.abort(); };
  }, [key, request]);

  const activities = useMemo(() => [...(state?.events || []), ...localActivities].sort((a, b) => b.at - a.at).slice(0, 100), [state?.events, localActivities]);
  const status = getBearStatus(state, reachable, activities);
  const configure = next => {
    localStorage.setItem('baobeiPairingKey', next.trim());
    setKey(next.trim());
    setError('');
  };
  const sendLight = action => {
    const run = async () => {
      const response = await request('/api/light', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
      return response.json();
    };
    const result = lightQueue.current.then(run, run);
    lightQueue.current = result;
    return result;
  };
  const addVirtualHug = text => setLocalActivities(previous => [{ id: crypto.randomUUID(), type: 'hug', text, at: Date.now() }, ...previous].slice(0, 100));
  return <Connection.Provider value={{ state, status, activities, reachable, error, configured: Boolean(key), configure, request, sendLight, addVirtualHug }}>{children}</Connection.Provider>;
}

export function useBear() { return useContext(Connection); }

export function ConnectionPanel() {
  const { state, reachable, configured, error, configure } = useBear();
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(!configured);
  return <section className="connection-panel">
    <div className="section-head"><h3>Bear connection</h3><button onClick={() => setEditing(!editing)}>Pair bear</button></div>
    <p>{reachable ? `Buttons: ${state.devices.io.online ? 'online' : 'offline'} / Voice: ${state.devices.cardputer.online ? 'online' : 'offline'}` : 'Waiting for connection'}</p>
    {error && <p className="connection-error" role="alert">{error}</p>}
    {state && Object.entries(state.devices).filter(([, device]) => device.error).map(([role, device]) => <p className="connection-error" role="alert" key={role}>{role}: {device.error}</p>)}
    {editing && <form onSubmit={event => { event.preventDefault(); configure(draft); setEditing(false); }}>
      <label htmlFor="pairing-key">Bear pairing key</label>
      <input id="pairing-key" type="password" value={draft} onChange={event => setDraft(event.target.value)} required minLength={16} autoComplete="off" />
      <button className="primary" type="submit">Connect</button>
    </form>}
  </section>;
}

export function useVoiceUrl(route) {
  const { request } = useBear();
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    let disposed = false;
    let objectUrl;
    const controller = new AbortController();
    setUrl('');
    setError('');
    request(route, { signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]) })
      .then(response => response.blob())
      .then(blob => { if (!disposed) { objectUrl = URL.createObjectURL(blob); setUrl(objectUrl); } })
      .catch(failure => { if (!disposed) setError(failure.message); });
    return () => { disposed = true; controller.abort(); if (objectUrl) URL.revokeObjectURL(objectUrl); };
  }, [route, request]);
  return { url, error };
}
