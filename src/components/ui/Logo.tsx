import logoSrc from '../../assets/logo.png';

interface LogoProps {
  size?: number;
  withText?: boolean;
  className?: string;
}

// =========================================================
// COMPONENT — Logo de Scout Ball
// Uso: <Logo size={48} /> o <Logo size={32} withText />
// =========================================================
export default function Logo({ size = 48, withText = false, className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt="Scout Ball"
        style={{ width: size, height: size }}
        className="object-contain flex-shrink-0"
      />
      {withText && (
        <div className="leading-none">
          <div className="f-display text-white tracking-wide" style={{ fontSize: size * 0.4 }}>
            SCOUT BALL
          </div>
          <div className="f-mono text-neutral-500 tracking-widest mt-0.5" style={{ fontSize: size * 0.18 }}>
            CAPTACIÓN DE TALENTO
          </div>
        </div>
      )}
    </div>
  );
}

// Re-export del src crudo por si alguien lo necesita (PDF, favicon dinámico, etc.)
export { logoSrc };