export function getBearStatus(snapshot, reachable, activities = snapshot?.events || []) {
  const connected = Boolean(reachable && snapshot?.devices.io.online && snapshot?.devices.cardputer.online);
  const latest = activities[0];
  const eventId = snapshot?.moment?.id || latest?.id || null;
  if (!connected) return { state: 'disconnected', connected, eventId, detail: 'Tap to check the connection' };
  if (snapshot.interaction.active) return { state: 'happy', connected, eventId, detail: 'A happy interaction just happened' };
  if (snapshot.moment?.type === 'parent.voice') return { state: 'message', connected, eventId, detail: 'Your voice reply was sent to BaoBei' };
  const illuminated = snapshot.led.enabled && (!snapshot.led.effectUntil || snapshot.led.effectUntil > snapshot.serverTime);
  if (snapshot.moment?.type === 'light.on' && illuminated && snapshot.ledApplied?.revision === snapshot.led.revision) {
    return { state: 'glowing', connected, eventId, detail: 'Your warm light was sent' };
  }
  return { state: 'calm', connected, eventId, detail: `Last active: ${latest?.text || 'No interaction yet'}` };
}

export function formatActivityTime(at) {
  return new Date(at).toLocaleString();
}

export function formatVoiceTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}
