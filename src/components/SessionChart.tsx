"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface SessionChartProps {
  data?: any[];
}

export default function SessionChart({ data }: SessionChartProps) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full h-96 bg-offWhite p-6 rounded-2xl border-4 border-charcoal/10 shadow-sm relative z-0">
      <h3 className="font-sans font-black text-2xl uppercase tracking-tighter text-charcoal mb-4">Workout Analysis</h3>
      
      <div className="w-full h-72">
        <ResponsiveContainer width="100%" height="100%" minHeight={300}>
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#333333" strokeOpacity={0.05} vertical={false} />
            
            <XAxis 
              dataKey="timeStr" 
              stroke="#333333" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
              dy={10} 
            />
            
            {/* Overlay Multiple Y-Axes */}
            <YAxis 
              yAxisId="spm" 
              orientation="left" 
              stroke="#333333" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              yAxisId="watts" 
              orientation="right" 
              stroke="#333333" 
              fontSize={12} 
              tickLine={false} 
              axisLine={false} 
            />
            <YAxis 
              yAxisId="speed" 
              orientation="right" 
              hide={true} 
            />
            <YAxis 
              yAxisId="level" 
              orientation="right" 
              hide={true} 
            />
            
            <Tooltip 
              contentStyle={{ backgroundColor: '#FAF9F6', borderColor: '#333333', borderRadius: '12px', color: '#333333', fontWeight: 'bold' }}
              itemStyle={{ fontWeight: 'black', fontSize: '1.2rem' }}
              cursor={{ stroke: '#333333', strokeWidth: 1, strokeDasharray: '4 4' }}
            />
            
            <Legend 
              wrapperStyle={{ paddingTop: '20px', fontWeight: 'bold', fontFamily: 'var(--font-inter)' }} 
              iconType="plainline"
            />
            
            <Line yAxisId="spm" type="monotone" dataKey="spm" name="SPM" stroke="#333333" strokeWidth={3} dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#333333' }} />
            <Line yAxisId="watts" type="monotone" dataKey="watts" name="Watts" stroke="#333333" strokeWidth={3} strokeDasharray="8 8" dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#333333' }} />
            <Line yAxisId="speed" type="monotone" dataKey="speed" name="Speed (m/s)" stroke="#333333" strokeWidth={3} strokeDasharray="2 4" dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#333333' }} />
            <Line yAxisId="level" type="stepAfter" dataKey="level" name="Level" stroke="#333333" strokeWidth={2} strokeDasharray="16 4 4 4" dot={false} activeDot={{ r: 8, strokeWidth: 0, fill: '#333333' }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
