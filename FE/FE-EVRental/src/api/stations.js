export async function fetchAllStations() {
  const res = await fetch('/api/Station/GetAllStations');
  if (!res.ok) throw new Error('Failed to fetch stations');
  return res.json();
}

export async function fetchActiveStations() {
  const res = await fetch('/api/Station/GetActiveStations');
  if (!res.ok) throw new Error('Failed to fetch active stations');
  return res.json();
}

export async function fetchStationById(id) {
  const res = await fetch(`/api/Station/GetStationById/${id}`);
  if (!res.ok) throw new Error('Failed to fetch station by id');
  return res.json();
}

