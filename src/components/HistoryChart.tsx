"use client";

import { RowRecord } from '@/hooks/useRowHistory';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HistoryChart({ history }: { history: RowRecord[] }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center p-8 text-charcoal/60 bg-black/5 rounded-xl border border-charcoal/10">
        No history yet. Complete a row to see your progress!
      </div>
    );
  }

  // Format data for Recharts
  const data = history.map((record, i) => ({
    name: new Date(record.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    distance: record.distance,
    spm: record.spmAvg,
    watts: record.wattsAvg,
    index: i + 1,
  }));

  return (
    <div className="w-full h-72 min-h-[300px] bg-offWhite p-4 rounded-xl border-2 border-charcoal/10 shadow-sm relative z-0">
      <ResponsiveContainer width="100%" height="100%" minHeight={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333333" strokeOpacity={0.1} vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="#333333" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dy={10}
          />
          <YAxis 
            yAxisId="left" 
            stroke="#333333" 
            fontSize={12} 
            tickLine={false} 
            axisLine={false} 
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#FAF9F6', borderColor: '#333333', borderRadius: '8px', color: '#333333' }}
            itemStyle={{ color: '#333333', fontWeight: 'bold' }}
            cursor={{ stroke: '#333333', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          <Line 
            yAxisId="left" 
            type="monotone" 
            dataKey="distance" 
            name="Distance (m)" 
            stroke="#333333" 
            strokeWidth={3} 
            dot={{ r: 4, fill: '#333333', strokeWidth: 0 }} 
            activeDot={{ r: 6, strokeWidth: 0 }} 
            animationDuration={1500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
