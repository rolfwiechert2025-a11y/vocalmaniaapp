export default function Loading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3">
      <div className="bg-black/70 border border-white/20 px-5 py-3 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-xs font-bold tracking-wide text-indigo-200">Lade Daten aus Datenbank...</span>
      </div>
    </div>
  );
}