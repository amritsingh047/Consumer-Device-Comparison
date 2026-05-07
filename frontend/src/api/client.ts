const API = '/api';

export async function searchDevices(q: string) {
  const res = await fetch(`${API}/devices/search?q=${encodeURIComponent(q)}`);
  if (!res.ok) throw new Error('Search failed');
  return res.json();
}

export async function getDevice(id: string) {
  const res = await fetch(`${API}/devices/${id}`);
  if (!res.ok) throw new Error('Device not found');
  return res.json();
}

export async function getAllDevices() {
  const res = await fetch(`${API}/devices`);
  if (!res.ok) throw new Error('Failed to load devices');
  return res.json();
}
