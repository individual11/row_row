import { RowMetrics } from "@/hooks/useBluetooth";

export default function DashboardMetrics({ metrics }: { metrics: RowMetrics }) {
  return (
    <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-charcoal text-offWhite rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
          <span className="text-sm font-sans uppercase tracking-widest opacity-80 mb-2">SPM</span>
          <span className="font-impact text-7xl font-bold tracking-tight">
            {metrics.spm || "0"}
          </span>
        </div>
        <div className="bg-charcoal text-offWhite rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg">
          <span className="text-sm font-sans uppercase tracking-widest opacity-80 mb-2">Distance (m)</span>
          <span className="font-impact text-7xl font-bold tracking-tight">
            {metrics.distance || "0"}
          </span>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-charcoal/10 border-2 border-charcoal/20 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-xs font-sans uppercase tracking-widest opacity-60 mb-1">Time (s)</span>
          <span className="font-impact text-4xl font-bold text-charcoal">
            {metrics.time || "0"}
          </span>
        </div>
        <div className="bg-charcoal/10 border-2 border-charcoal/20 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-xs font-sans uppercase tracking-widest opacity-60 mb-1">Watts</span>
          <span className="font-impact text-4xl font-bold text-charcoal">
            {metrics.watts || "0"}
          </span>
        </div>
        <div className="bg-charcoal/10 border-2 border-charcoal/20 rounded-xl p-4 flex flex-col items-center justify-center">
          <span className="text-xs font-sans uppercase tracking-widest opacity-60 mb-1">Level</span>
          <span className="font-impact text-4xl font-bold text-charcoal">
            {metrics.resistance || "0"}
          </span>
        </div>
      </div>
    </div>
  );
}
