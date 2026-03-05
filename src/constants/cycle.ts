import { Bucket, BucketType } from "../stores/useCycleStore";


// export const DEFAULT_BUCKETS: Record<BucketType, Bucket> = {
//   rollover: { id: 'rollover', label: 'Mes siguiente', emoji: '🔄', color: '#63B3ED', totalAccumulated: 0, deposits: [] },
//   savings: { id: 'savings', label: 'Ahorro', emoji: '🐷', color: '#68D391', totalAccumulated: 0, deposits: [] },
//   emergency: { id: 'emergency', label: 'Emergencias', emoji: '🛡️', color: '#F6AD55', totalAccumulated: 0, deposits: [] },
//   investment: { id: 'investment', label: 'Inversión', emoji: '📈', color: '#B794F4', totalAccumulated: 0, deposits: [] },
//   buffer: { id: 'buffer', label: 'Amortiguador', emoji: '🧲', color: '#FC8181', totalAccumulated: 0, deposits: [] },
// };


export const DEFAULT_BUCKETS: Bucket[] = [
  { id: 'rollover', userId: '', type: 'rollover', name: 'Mes siguiente', iconName: '🔄', totalAccumulated: 0, createdAt: '', updatedAt: '' },
  { id: 'savings', userId: '', type: 'savings', name: 'Ahorro', iconName: '🐷', totalAccumulated: 0, createdAt: '', updatedAt: '' },
  { id: 'emergency', userId: '', type: 'emergency', name: 'Emergencias', iconName: '🛡️', totalAccumulated: 0, createdAt: '', updatedAt: '' },
  { id: 'investment', userId: '', type: 'investment', name: 'Inversión', iconName: '📈', totalAccumulated: 0, createdAt: '', updatedAt: '' },
  { id: 'buffer', userId: '', type: 'buffer', name: 'Amortiguador', iconName: '🧲', totalAccumulated: 0, createdAt: '', updatedAt: '' },
];