"use client";

import { useState, useEffect } from 'react';

export interface RowRecord {
  id: string;
  date: string;
  spmAvg: number;
  distance: number;
  time: number; // in seconds
  wattsAvg: number;
}

export function useRowHistory() {
  const [history, setHistory] = useState<RowRecord[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem('echelon_row_history');
    if (stored) {
      try {
        setHistory(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  const saveRow = (record: Omit<RowRecord, 'id' | 'date'>) => {
    const newRecord: RowRecord = {
      ...record,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
    };
    const newHistory = [...history, newRecord];
    setHistory(newHistory);
    localStorage.setItem('echelon_row_history', JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('echelon_row_history');
  };

  return { history, saveRow, clearHistory };
}
