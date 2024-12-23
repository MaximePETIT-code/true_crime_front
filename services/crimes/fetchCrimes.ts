import { config } from '@/lib/config';

interface CrimeParams {
  longitude?: number;
  lattitude?: number;
  zoom?: number;
  rangeStartDate: string;
  rangeEndDate: string;
}

export const fetchCrimes = async (params?: CrimeParams, token?: string) => {
  const queryString = params
    ? `?${new URLSearchParams({
        longitude: params.longitude?.toString() || '',
        lattitude: params.lattitude?.toString() || '',
        zoomLevel: params.zoom?.toString() || '',
        rangeStartDate: params.rangeStartDate,
        rangeEndDate: params.rangeEndDate,
      }).toString()}`
    : '';

  const response = await fetch(`${config.apiUrl}/crimes${queryString}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  });

  if (!response.ok) throw new Error('Failed to fetch crimes');
  return response.json();
};

export const fetchCrime = async (id: string, token?: string) => {
  const response = await fetch(`${config.apiUrl}/crimes/${id}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: token ? `Bearer ${token}` : ''
    }
  });

  if (!response.ok) throw new Error('Failed to fetch crime');
  return response.json();
};
