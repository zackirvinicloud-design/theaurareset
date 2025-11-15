import { useState, useEffect } from 'react';

export interface Symptom {
  id: string;
  type: string;
  severity: number; // 1-10
  notes: string;
  protocolDay: number;
  protocolPhase: 1 | 2 | 3 | 4;
  timestamp: number;
}

interface SymptomsStore {
  symptoms: Symptom[];
}

const STORAGE_KEY = 'aura-protocol-symptoms';

const loadFromStorage = (): SymptomsStore => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load symptoms from storage:', error);
  }
  return { symptoms: [] };
};

const saveToStorage = (store: SymptomsStore) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (error) {
    console.error('Failed to save symptoms to storage:', error);
  }
};

export const useSymptomsStore = () => {
  const [store, setStore] = useState<SymptomsStore>(loadFromStorage);

  useEffect(() => {
    saveToStorage(store);
  }, [store]);

  const addSymptom = (symptom: Omit<Symptom, 'id' | 'timestamp'>) => {
    const newSymptom: Symptom = {
      ...symptom,
      id: `${Date.now()}-${Math.random()}`,
      timestamp: Date.now(),
    };
    setStore(prev => ({
      symptoms: [...prev.symptoms, newSymptom],
    }));
    return newSymptom;
  };

  const deleteSymptom = (id: string) => {
    setStore(prev => ({
      symptoms: prev.symptoms.filter(s => s.id !== id),
    }));
  };

  const getSymptomsByPhase = (phase: number) => {
    return store.symptoms.filter(s => s.protocolPhase === phase);
  };

  const getSymptomsByDateRange = (startDate: number, endDate: number) => {
    return store.symptoms.filter(
      s => s.timestamp >= startDate && s.timestamp <= endDate
    );
  };

  const exportSymptomsData = () => {
    return JSON.stringify(store.symptoms, null, 2);
  };

  return {
    symptoms: store.symptoms,
    addSymptom,
    deleteSymptom,
    getSymptomsByPhase,
    getSymptomsByDateRange,
    exportSymptomsData,
  };
};
