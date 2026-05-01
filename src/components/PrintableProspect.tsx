import { logoSrc } from './ui/Logo';
import { getScoreTier } from '../lib/helpers';
import { labelOfCategory, labelOfBasketCategory, labelOfSex } from '../constants/scouting';
import type { Prospect } from '../types';

interface PrintableProspectProps {
  prospect: Prospect;
}

// =========================================================
// COMPONENT — PrintableProspect (oculto, alimenta el PDF)
// Estilos inline porque html2canvas es más fiable así
// =========================================================
export default function PrintableProspect({ prospect }: PrintableProspectProps) {
  if (!prospect) return null;
  const tier = getScoreTier(prospect.score);
  const today = new Date().toLocaleDateString('es-ES', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

  const SkillBar = ({ name, value, max = 5 }: { name: string; value: number; max?: number }) => (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 11, color: '#333', fontFamily: 'sans-serif' }}>{name}</span>
        <span style={{ fontSize: 11, color: '#000', fontWeight: 700, fontFamily: 'monospace' }}>
          {value}/{max}
        </span>
      </div>
      <div style={{ background: '#e5e5e5', height: 6, borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ background: '#84cc16', height: '100%', width: `${(value / max) * 100}%` }} />
      </div>
    </div>
  );

  const Row = ({ label, value }: { label: string; value: any }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '6px 0', borderBottom: '1px solid #eee',
    }}>
      <span style={{ color: '#888', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, fontFamily: 'sans-serif' }}>{label}</span>
      <span style={{ color: '#000', fontSize: 13, fontFamily: 'monospace', fontWeight: 600 }}>{value || '—'}</span>
    </div>
  );

  const sectionStyle: React.CSSProperties = { marginTop: 18 };
  const h2Style: React.CSSProperties = {
    fontSize: 12, fontWeight: 800, letterSpacing: 2, color: '#000',
    margin: 0, marginBottom: 10, paddingBottom: 6,
    borderBottom: '2px solid #84cc16', fontFamily: 'sans-serif',
  };

  return (
    <div
      id="printable-area"
      style={{
        position: 'fixed', left: '-9999px', top: 0,
        width: '210mm', minHeight: '297mm',
        background: 'white', color: 'black',
        padding: '15mm',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        boxSizing: 'border-box',
      }}
    >
      {/* Header con logo */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        borderBottom: '3px solid #000', paddingBottom: 10, marginBottom: 18,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src={logoSrc} alt="Logo" style={{ width: 48, height: 48, objectFit: 'contain' }} />
          <div>
            <div style={{ fontSize: 9, letterSpacing: 3, color: '#84cc16', marginBottom: 2, fontWeight: 700 }}>
              // SCOUTING REPORT
            </div>
            <div style={{ fontSize: 22, fontWeight: 900, color: '#000', letterSpacing: -0.5, lineHeight: 1 }}>SCOUT BALL</div>
            <div style={{ fontSize: 9, color: '#666', marginTop: 2 }}>Captación de Talento</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 8, color: '#888', letterSpacing: 1 }}>EMITIDO</div>
          <div style={{ fontSize: 11, color: '#000', fontFamily: 'monospace', fontWeight: 600 }}>{today}</div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        {prospect.photoURL ? (
          <img
            src={prospect.photoURL}
            crossOrigin="anonymous"
            alt=""
            style={{ width: 110, height: 140, objectFit: 'cover', borderRadius: 6, background: '#f0f0f0', flexShrink: 0 }}
          />
        ) : (
          <div style={{
            width: 110, height: 140, background: '#f0f0f0', borderRadius: 6,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 36, fontWeight: 800, color: '#aaa', flexShrink: 0,
          }}>
            {prospect.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, margin: 0, lineHeight: 1.1, color: '#000', fontWeight: 800 }}>{prospect.name}</h1>
            <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
              {prospect.club} · {prospect.position} · {prospect.age} años
            </div>

            {/* Pills de categoría/sexo */}
            <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
              {prospect.basketCategory && (
                <span style={{
                  background: '#000', color: 'white', padding: '3px 8px',
                  borderRadius: 3, fontSize: 9, fontWeight: 800, letterSpacing: 1,
                }}>{prospect.basketCategory.toUpperCase()} · {labelOfBasketCategory(prospect.basketCategory)}</span>
              )}
              {prospect.sex && (
                <span style={{
                  background: '#84cc16', color: '#000', padding: '3px 8px',
                  borderRadius: 3, fontSize: 9, fontWeight: 800, letterSpacing: 1,
                }}>{labelOfSex(prospect.sex)}</span>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4, marginTop: 12, fontSize: 11 }}>
              <div><span style={{ color: '#888' }}>Estatura: </span><span style={{ fontWeight: 600 }}>{prospect.heightCm || '—'} cm</span></div>
              <div><span style={{ color: '#888' }}>Peso: </span><span style={{ fontWeight: 600 }}>{prospect.weight || '—'} kg</span></div>
              <div><span style={{ color: '#888' }}>Envergadura: </span><span style={{ fontWeight: 600 }}>{prospect.wingspan || '—'} cm</span></div>
              <div><span style={{ color: '#888' }}>% Grasa: </span><span style={{ fontWeight: 600 }}>{prospect.bodyFat || '—'}%</span></div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
            <div style={{
              background: tier.color, color: 'white', padding: '6px 14px',
              borderRadius: 6, fontSize: 28, fontWeight: 900, lineHeight: 1, fontFamily: 'monospace',
            }}>
              {prospect.score}<span style={{ fontSize: 12, opacity: 0.7 }}>/100</span>
            </div>
            <div style={{ textTransform: 'uppercase', fontSize: 10, fontWeight: 800, color: tier.color, letterSpacing: 2 }}>
              {tier.label}
            </div>
          </div>
        </div>
      </div>

      {/* Two columns: Antropometría / Pruebas */}
      <div style={{ display: 'flex', gap: 18 }}>
        <div style={{ flex: 1 }}>
          <div style={sectionStyle}>
            <h2 style={h2Style}>ANTROPOMETRÍA</h2>
            <Row label="Estatura" value={prospect.heightCm ? `${prospect.heightCm} cm` : null} />
            <Row label="Peso" value={prospect.weight ? `${prospect.weight} kg` : null} />
            <Row label="% Grasa" value={prospect.bodyFat ? `${prospect.bodyFat}%` : null} />
            <Row label="Envergadura" value={prospect.wingspan ? `${prospect.wingspan} cm` : null} />
            <Row label="Cintura" value={prospect.waist ? `${prospect.waist} cm` : null} />
            <Row label="Caderas" value={prospect.hips ? `${prospect.hips} cm` : null} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={sectionStyle}>
            <h2 style={h2Style}>PRUEBAS FÍSICAS</h2>
            <Row label="Test 6 min" value={prospect.enduranceTest ? `${prospect.enduranceTest} m` : null} />
            <Row label="Sprint 20m" value={prospect.bestSprint20m ? `${prospect.bestSprint20m} s` : null} />
            <Row label="Flexibilidad" value={prospect.bestFlexibility ? `${prospect.bestFlexibility} cm` : null} />
            <Row label="Alcance Vert." value={prospect.verticalReach ? `${prospect.verticalReach} cm` : null} />
            <Row label="Saltabilidad" value={prospect.bestVerticalJump ? `${prospect.bestVerticalJump} cm` : null} />
            <Row label="Flexiones" value={prospect.pushups ? `${prospect.pushups} reps` : null} />
            <Row label="Agilidad" value={prospect.bestAgility ? `${prospect.bestAgility} s` : null} />
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 18, marginTop: 4 }}>
        <div style={{ flex: 1 }}>
          <div style={sectionStyle}>
            <h2 style={h2Style}>TÉCNICA & TÁCTICA</h2>
            <SkillBar name="Mecánica de Tiro" value={prospect.shooting || 0} />
            <SkillBar name="Manejo de Balón" value={prospect.ballHandling || 0} />
            <SkillBar name="Toma de Decisiones" value={prospect.decisionMaking || 0} />
            <SkillBar name="Defensa" value={prospect.defense || 0} />
          </div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={sectionStyle}>
            <h2 style={h2Style}>PERFIL PSICOLÓGICO</h2>
            <SkillBar name="Liderazgo" value={prospect.leadership || 0} />
            <SkillBar name="Ética de Trabajo" value={prospect.workEthic || 0} />
            <SkillBar name="Tolerancia Frust." value={prospect.frustrationTolerance || 0} />
          </div>
        </div>
      </div>

      {/* Galería */}
      {prospect.measurementPhotos && prospect.measurementPhotos.length > 0 && (
        <div style={sectionStyle}>
          <h2 style={h2Style}>GALERÍA COMPARATIVA · {prospect.measurementPhotos.length} fotos</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6 }}>
            {prospect.measurementPhotos.slice(0, 20).map((p, i) => (
              <div key={i} style={{
                aspectRatio: '1', overflow: 'hidden', borderRadius: 4,
                background: '#f0f0f0', position: 'relative',
              }}>
                <img
                  src={p.url}
                  crossOrigin="anonymous"
                  alt=""
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'rgba(0,0,0,0.75)', color: 'white',
                  fontSize: 7, padding: '2px 3px', textAlign: 'center', fontWeight: 600,
                }}>
                  {labelOfCategory(p.category)}
                </div>
              </div>
            ))}
          </div>
          {prospect.measurementPhotos.length > 20 && (
            <p style={{ fontSize: 9, color: '#888', textAlign: 'center', marginTop: 6 }}>
              + {prospect.measurementPhotos.length - 20} fotos adicionales no incluidas
            </p>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{
        marginTop: 24, paddingTop: 10, borderTop: '1px solid #ddd',
        display: 'flex', justifyContent: 'space-between',
        fontSize: 8, color: '#999',
      }}>
        <span>SCOUT BALL · Módulo de Captación de Talento</span>
        <span>Documento confidencial · {today}</span>
      </div>
    </div>
  );
}