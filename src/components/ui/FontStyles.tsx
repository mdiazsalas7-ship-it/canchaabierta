// =========================================================
// COMPONENT — Inyector de fuentes y keyframes
// =========================================================
export default function FontStyles() {
    return (
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Manrope:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
        .f-display { font-family: 'Bebas Neue', sans-serif; letter-spacing: 0.02em; }
        .f-body    { font-family: 'Manrope', sans-serif; }
        .f-mono    { font-family: 'JetBrains Mono', monospace; font-feature-settings: 'tnum'; }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(163,230,53, 0.5); }
          70% { box-shadow: 0 0 0 12px rgba(163,230,53, 0); }
          100% { box-shadow: 0 0 0 0 rgba(163,230,53, 0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes shimmer { 0% { background-position: -200px 0; } 100% { background-position: 200px 0; } }
        .animate-slide-up { animation: slideUp 0.4s ease-out forwards; }
        .pulse-fab { animation: pulse-ring 2s infinite; }
        .spin { animation: spin 1s linear infinite; }
        .skeleton {
          background: linear-gradient(90deg, #1a1a1a 0%, #232323 50%, #1a1a1a 100%);
          background-size: 400px 100%;
          animation: shimmer 1.5s infinite;
        }
      `}</style>
    );
  }