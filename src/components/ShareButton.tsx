"use client";

import { useState } from 'react';
import { RowRecord } from '@/hooks/useRowHistory';

export default function ShareButton({ record }: { record: RowRecord | null }) {
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const handleShare = async () => {
    const minutes = Math.floor(record.time / 60);
    const seconds = record.time % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    const dateStr = new Date(record.date).toLocaleDateString();

    const text = `[${dateStr}] 🚣 Row Complete! | ⏱️ ${timeStr} | 📏 ${record.distance}m | ⚡ ${record.wattsAvg}W avg | 💪 +x%`;
    
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  return (
    <button 
      onClick={handleShare}
      className="bg-charcoal text-offWhite font-sans font-bold py-3 px-6 rounded-full hover:bg-charcoal/80 transition-colors flex items-center gap-2 shadow-md hover:shadow-lg hover:-translate-y-0.5"
    >
      <span className="text-xl">📋</span>
      <span>{copied ? "Copied to Clipboard!" : "Copy to Share"}</span>
    </button>
  );
}
