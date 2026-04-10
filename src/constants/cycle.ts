import { Bucket } from "../interfaces/cycle.interface";

export const DEFAULT_BUCKETS: Bucket[] = [
  {
    id: 'rollover',
    userId: '',
    type: 'rollover',
    name: 'next_cycle',
    iconName: '🔄',
    totalAccumulated: 0,
    createdAt: '',
    updatedAt: '',
    color: '#63B3ED',
  },
  { id: 'savings', userId: '', type: 'savings', name: 'savings', iconName: '🐷', totalAccumulated: 0, createdAt: '', updatedAt: '', color: '#68D391' },
  { id: 'emergency', userId: '', type: 'emergency', name: 'emergency', iconName: '🛡️', totalAccumulated: 0, createdAt: '', updatedAt: '', color: '#F6AD55' },
  { id: 'investment', userId: '', type: 'investment', name: 'investment', iconName: '📈', totalAccumulated: 0, createdAt: '', updatedAt: '', color: '#B794F4' },
  { id: 'buffer', userId: '', type: 'buffer', name: 'buffer', iconName: '🧲', totalAccumulated: 0, createdAt: '', updatedAt: '', color: '#FC8181' },
];