export interface Symptom {
  key: string;
  label: string;
  emoji: string;
  category: 'detox' | 'digestive' | 'energy' | 'mood';
}

export const SYMPTOMS: Symptom[] = [
  // Detox / Die-off
  { key: 'headache', label: 'Headache', emoji: '🤕', category: 'detox' },
  { key: 'brain_fog', label: 'Brain Fog', emoji: '😶‍🌫️', category: 'detox' },
  { key: 'body_aches', label: 'Body Aches', emoji: '🦴', category: 'detox' },
  { key: 'skin_breakout', label: 'Skin Breakout', emoji: '🦠', category: 'detox' },
  { key: 'metallic_taste', label: 'Metallic Taste', emoji: '👅', category: 'detox' },

  // Digestive
  { key: 'bloating', label: 'Bloating', emoji: '🎈', category: 'digestive' },
  { key: 'nausea', label: 'Nausea', emoji: '🤢', category: 'digestive' },
  { key: 'cramping', label: 'Cramping', emoji: '⚡', category: 'digestive' },
  { key: 'cravings', label: 'Sugar Cravings', emoji: '🍩', category: 'digestive' },

  // Energy
  { key: 'fatigue', label: 'Exhausted', emoji: '🥱', category: 'energy' },
  { key: 'wired', label: 'Wired / Can\'t Sleep', emoji: '👁️', category: 'energy' },
  { key: 'energy_spikes', label: 'Energy Waves', emoji: '🌊', category: 'energy' },

  // Mood
  { key: 'irritable', label: 'Irritable', emoji: '😤', category: 'mood' },
  { key: 'anxious', label: 'Anxious', emoji: '😰', category: 'mood' },
  { key: 'emotional', label: 'Emotional', emoji: '🥹', category: 'mood' },
];

export function getSymptomsByCategory() {
  const grouped = SYMPTOMS.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<string, Symptom[]>);

  return grouped;
}
