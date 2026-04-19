export type SymptomCategory = 'detox' | 'digestive' | 'energy' | 'mood' | 'sleep' | 'skin';

export interface Symptom {
  key: string;
  label: string;
  emoji: string;
  category: SymptomCategory;
  aliases?: string[];
  defaultBodyAreas?: string[];
}

export const SYMPTOMS: Symptom[] = [
  { key: 'headache', label: 'Headache', emoji: 'H', category: 'detox', aliases: ['head pain'], defaultBodyAreas: ['head'] },
  { key: 'brain_fog', label: 'Brain fog', emoji: 'B', category: 'detox', aliases: ['foggy', 'mental fog'], defaultBodyAreas: ['head'] },
  { key: 'body_aches', label: 'Body aches', emoji: 'A', category: 'detox', aliases: ['aches', 'sore'], defaultBodyAreas: ['whole_body', 'joints'] },
  { key: 'metallic_taste', label: 'Metallic taste', emoji: 'T', category: 'detox', aliases: ['metal taste'], defaultBodyAreas: ['mouth'] },
  { key: 'chills', label: 'Chills', emoji: 'C', category: 'detox', aliases: ['cold feeling'], defaultBodyAreas: ['whole_body'] },

  { key: 'bloating', label: 'Bloating', emoji: 'G', category: 'digestive', aliases: ['distended'], defaultBodyAreas: ['gut'] },
  { key: 'nausea', label: 'Nausea', emoji: 'N', category: 'digestive', aliases: ['queasy'], defaultBodyAreas: ['gut'] },
  { key: 'cramping', label: 'Cramping', emoji: 'R', category: 'digestive', aliases: ['stomach cramps'], defaultBodyAreas: ['gut'] },
  { key: 'constipation', label: 'Constipation', emoji: 'K', category: 'digestive', aliases: ['hard stool'], defaultBodyAreas: ['gut'] },
  { key: 'diarrhea', label: 'Loose stool', emoji: 'L', category: 'digestive', aliases: ['diarrhea'], defaultBodyAreas: ['gut'] },
  { key: 'heartburn', label: 'Heartburn', emoji: 'F', category: 'digestive', aliases: ['acid reflux'], defaultBodyAreas: ['chest', 'gut'] },
  { key: 'cravings', label: 'Sugar cravings', emoji: 'S', category: 'digestive', aliases: ['sweet cravings'], defaultBodyAreas: ['gut'] },

  { key: 'fatigue', label: 'Fatigue', emoji: 'E', category: 'energy', aliases: ['exhausted', 'tired'], defaultBodyAreas: ['whole_body'] },
  { key: 'wired', label: 'Wired or restless', emoji: 'W', category: 'energy', aliases: ['restless'], defaultBodyAreas: ['whole_body'] },
  { key: 'dizzy', label: 'Dizzy', emoji: 'D', category: 'energy', aliases: ['lightheaded'], defaultBodyAreas: ['head'] },
  { key: 'energy_crash', label: 'Energy crash', emoji: 'X', category: 'energy', aliases: ['crash'], defaultBodyAreas: ['whole_body'] },

  { key: 'irritable', label: 'Irritable', emoji: 'I', category: 'mood', aliases: ['snappy'], defaultBodyAreas: ['head'] },
  { key: 'anxious', label: 'Anxious', emoji: 'Q', category: 'mood', aliases: ['anxiety'], defaultBodyAreas: ['chest', 'head'] },
  { key: 'low_mood', label: 'Low mood', emoji: 'M', category: 'mood', aliases: ['down'], defaultBodyAreas: ['head'] },
  { key: 'emotional', label: 'Emotional swings', emoji: 'Y', category: 'mood', aliases: ['emotional'], defaultBodyAreas: ['head'] },

  { key: 'hard_sleep', label: 'Hard to fall asleep', emoji: 'P', category: 'sleep', aliases: ['insomnia'], defaultBodyAreas: ['head'] },
  { key: 'night_waking', label: 'Night waking', emoji: 'U', category: 'sleep', aliases: ['wake up at night'], defaultBodyAreas: ['head'] },

  { key: 'skin_breakout', label: 'Skin breakout', emoji: 'Z', category: 'skin', aliases: ['acne', 'breakout'], defaultBodyAreas: ['skin'] },
  { key: 'skin_itchy', label: 'Itchy skin', emoji: 'J', category: 'skin', aliases: ['itch'], defaultBodyAreas: ['skin'] },
];

export const SYMPTOM_BY_KEY = SYMPTOMS.reduce((acc, symptom) => {
  acc[symptom.key] = symptom;
  return acc;
}, {} as Record<string, Symptom>);

export function getSymptomsByCategory() {
  const grouped = SYMPTOMS.reduce((acc, curr) => {
    if (!acc[curr.category]) acc[curr.category] = [];
    acc[curr.category].push(curr);
    return acc;
  }, {} as Record<SymptomCategory, Symptom[]>);

  return grouped;
}
