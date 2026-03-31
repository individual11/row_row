import { RowMetrics } from "@/hooks/useBluetooth";

export default function DashboardMetrics({ metrics }: { metrics: RowMetrics }) {
  const formatTime = (seconds: number) => {
    if (!seconds) return "0";
    if (seconds < 60) return seconds.toString();
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex-1 flex flex-col border-y-4 border-charcoal bg-charcoal/5">
      {/* Primary Metrics */}
      <div className="flex-1 grid grid-cols-2 divide-x-4 divide-charcoal">
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <span className="text-xl md:text-3xl font-sans uppercase tracking-[0.2em] text-charcoal/60 mb-2 mt-4 font-bold">SPM</span>
          <span className="font-sans font-black text-[min(24vw,30vh)] leading-none text-charcoal tracking-tighter">
            {metrics.spm || "0"}
          </span>
        </div>
        <div className="w-full h-full flex flex-col items-center justify-center p-4">
          <span className="text-xl md:text-3xl font-sans uppercase tracking-[0.2em] text-charcoal/60 mb-2 mt-4 font-bold">Distance</span>
          <div className="font-sans font-black text-[min(24vw,30vh)] leading-none text-charcoal tracking-tighter flex items-baseline">
            {metrics.distance || "0"}
            <span className="text-[min(8vw,10vh)] ml-4 text-charcoal/40 font-bold tracking-tighter lowercase">m</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-3 border-t-4 border-charcoal divide-x-4 divide-charcoal bg-offWhite">
        <div className="w-full flex flex-col items-center justify-center p-4 lg:p-8">
          <span className="text-lg md:text-xl font-sans uppercase tracking-[0.2em] text-charcoal/60 mb-1 font-bold">Time</span>
          <span className="font-sans font-black text-[min(10vw,12vh)] leading-none text-charcoal/90 tracking-tighter">
            {formatTime(metrics.time)}
          </span>
        </div>
        <div className="w-full flex flex-col items-center justify-center p-4 lg:p-8">
          <span className="text-lg md:text-xl font-sans uppercase tracking-[0.2em] text-charcoal/60 mb-1 font-bold">Watts</span>
          <span className="font-sans font-black text-[min(10vw,12vh)] leading-none text-charcoal/90 tracking-tighter">
            {metrics.watts || "0"}
          </span>
        </div>
        <div className="w-full flex flex-col items-center justify-center p-4 lg:p-8">
          <span className="text-lg md:text-xl font-sans uppercase tracking-[0.2em] text-charcoal/60 mb-1 font-bold">Level</span>
          <span className="font-sans font-black text-[min(10vw,12vh)] leading-none text-charcoal/90 tracking-tighter">
            {metrics.resistance || "0"}
          </span>
        </div>
      </div>
    </div>
  );
}
