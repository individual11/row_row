"use client";

import { useBluetooth } from "@/hooks/useBluetooth";
import { useRowHistory } from "@/hooks/useRowHistory";
import DashboardMetrics from "@/components/DashboardMetrics";
import HistoryChart from "@/components/HistoryChart";
import ShareButton from "@/components/ShareButton";

export default function Home() {
  const { isConnected, connect, disconnect, metrics, logs } = useBluetooth();
  const { history, saveRow, clearHistory } = useRowHistory();

  const handleFinishRow = () => {
    // For MVP/testing, we save the current accumulated metrics
    saveRow({
      spmAvg: metrics.spm || Math.floor(Math.random() * 10) + 20, // Add some mock data if 0
      distance: metrics.distance || Math.floor(Math.random() * 1000) + 500,
      time: metrics.time || Math.floor(Math.random() * 300) + 120,
      wattsAvg: metrics.watts || Math.floor(Math.random() * 50) + 100,
    });
  };

  const latestRecord = history.length > 0 ? history[history.length - 1] : null;

  return (
    <main className="min-h-screen bg-offWhite text-charcoal p-8 flex flex-col items-center font-sans tracking-tight">
      
      {/* Header */}
      <header className="w-full max-w-4xl flex items-center justify-between mb-12 border-b-2 border-charcoal/10 pb-6">
        <h1 className="font-impact text-5xl uppercase">Echelon Row</h1>
        
        <div className="flex gap-4">
          <button 
            onClick={handleFinishRow}
            className="px-6 py-2 rounded-full font-bold bg-charcoal/10 border-2 border-charcoal/20 text-charcoal hover:bg-charcoal/20 transition-colors"
          >
            Save Row (Mock)
          </button>
          {isConnected ? (
            <button 
              onClick={disconnect}
              className="px-6 py-2 rounded-full font-bold bg-charcoal/10 border-2 border-charcoal text-charcoal hover:bg-charcoal hover:text-offWhite transition-colors"
            >
              Disconnect
            </button>
          ) : (
            <button 
              onClick={connect}
              className="px-6 py-2 rounded-full font-bold bg-charcoal text-offWhite hover:bg-charcoal/80 transition-colors shadow-md"
            >
              Connect Rower
            </button>
          )}
        </div>
      </header>

      <div className="w-full max-w-4xl flex flex-col gap-16">
        {/* Main Metrics Area */}
        <section>
          <DashboardMetrics metrics={metrics} />
        </section>

        {/* History Area */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-impact text-3xl uppercase">Row History</h2>
            {latestRecord && <ShareButton record={latestRecord} />}
          </div>
          <HistoryChart history={history} />
          {history.length > 0 && (
            <div className="mt-4 flex justify-end">
              <button 
                onClick={clearHistory}
                className="text-sm font-bold text-red-500 hover:text-red-700 uppercase tracking-wider"
              >
                Clear History
              </button>
            </div>
          )}
        </section>

        {/* Discovery / Diagnostic Logs */}
        {logs.length > 0 && (
          <section className="w-full">
            <h2 className="font-bold mb-4 font-sans text-lg border-b-2 border-charcoal/20 pb-2">Diagnostic Logs</h2>
            <div className="bg-charcoal text-green-400 font-mono text-xs p-4 rounded-xl overflow-y-auto h-48 shadow-inner">
              {logs.map((log, i) => (
                <div key={i} className="mb-1 leading-relaxed border-b border-green-400/10 pb-1">
                  <span className="text-gray-500 mr-2">
                    {new Date().toLocaleTimeString('en-US', { hour12: false })}
                  </span> 
                  {log}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

    </main>
  );
}
