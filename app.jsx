// app.jsx — Bugg app: home + challenge + result, in 3 visual directions

const { useState, useEffect, useRef, useMemo } = React;

// ─────────────────────────────────────────────────────────────
// Type system
// ─────────────────────────────────────────────────────────────
const FONT_DISPLAY = '"Instrument Serif", "Cormorant Garamond", "Playfair Display", Georgia, serif';
const FONT_BODY = '-apple-system, "Inter", system-ui, sans-serif';
const FONT_MONO = '"JetBrains Mono", "SF Mono", Menlo, monospace';

// Palette (option 0): cream bg + pink + dark green + purple + extras
const PAL = {
  bg: '#fafaf7',
  ink: '#0f0f0d',
  pink: '#ff5fa2',
  green: '#1a3a2e',
  purple: '#7c3aed',
  yellow: '#fcd34d',
  orange: '#fb923c',
  red: '#be123c',
  lime: '#a3e635',
  blue: '#2a4cd9',
  cream: '#fef9ee',
  pinkSoft: '#ffd1e0',
  oliveGold: '#a3851a',
};

// ─────────────────────────────────────────────────────────────
// Bug-of-the-day picker — derived from streak so it advances
// ─────────────────────────────────────────────────────────────
function bugForStreak(streak) {
  return BUGS[Math.min(streak, BUGS.length - 1)];
}

// ─────────────────────────────────────────────────────────────
// Home screens — 3 visual directions
// ─────────────────────────────────────────────────────────────

// V1 — "Scattered" — Très Figma, lots of small shapes around a black title
function HomeScattered({ streak, bug, speed, palette, onStart }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: PAL.bg,
      position: 'relative', overflow: 'hidden',
      paddingTop: 64,
      fontFamily: FONT_BODY,
    }}>
      {/* TOP META */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '12px 22px 0', position: 'relative', zIndex: 5,
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4, color: PAL.ink, textTransform: 'uppercase' }}>
          Bugg
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* Shape garden — many small playful shapes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Pin x={28} y={130} size={62} outer={palette[0]} inner={palette[1]} speed={speed} delay={0} rotate={-8} />
        <Checker x={36} y={460} size={70} color1={palette[3]} color2={palette[2]} cells={4} speed={speed} delay={0.3} rotate={-6} />
        <Squiggle x={130} y={245} w={140} h={44} color={palette[5]} strokeW={18} speed={speed} delay={0.4} rotate={4} />
        <ArcStripes x={140} y={500} w={150} h={95} colors={[palette[7], palette[8], palette[7]]} speed={speed} delay={0.6} rotate={-4} />
        <Diamond x={285} y={155} size={70} color={palette[1]} rotate={45} speed={speed} delay={0.5} />
        <Circle x={310} y={210} size={66} color={palette[0]} speed={speed} delay={0.7} />
        <Scallop x={300} y={180} size={92} color={palette[6]} lobes={14} speed={speed * 0.5} delay={0.2} />
        <Squircle x={290} y={420} size={72} color={palette[4]} speed={speed} delay={0.1} />
        <Drop x={36} y={600} size={56} color={palette[8]} accent={palette[3]} speed={speed} delay={0.2} rotate={20} />
        <Blob x={280} y={620} size={66} color={palette[2]} speed={speed} delay={0.5} variant={2} />
      </div>

      {/* Centered black title pill */}
      <div style={{
        position: 'absolute', top: '38%', left: '50%', transform: 'translate(-50%,-50%)',
        background: PAL.ink, color: '#fff',
        padding: '14px 22px', borderRadius: 18,
        fontFamily: FONT_DISPLAY, fontSize: 38, lineHeight: 1.0,
        letterSpacing: -0.5, fontWeight: 400,
        boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        whiteSpace: 'nowrap',
        zIndex: 4,
      }}>
        Bug du jour
      </div>

      {/* Today card */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 110,
        background: '#fff', borderRadius: 22,
        padding: '18px 18px 16px',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 12px 28px rgba(0,0,0,0.06)',
        zIndex: 5,
      }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
          {bug.day} · {bug.difficulty} · +{bug.xp} XP
        </div>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, lineHeight: 1.05, marginTop: 6, color: PAL.ink }}>
          {bug.title}
        </div>
        <div style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.55)', marginTop: 6, lineHeight: 1.4 }}>
          {bug.desc}
        </div>
        <button onClick={onStart} style={ctaBtn(PAL.ink, '#fff')}>
          Trouver le bug →
        </button>
      </div>
    </div>
  );
}

// V2 — "Hero composition" — centered Figma-style overlapping shapes
function HomeHero({ streak, bug, speed, palette, onStart }) {
  return (
    <div style={{
      width: '100%', height: '100%', background: PAL.bg,
      position: 'relative', overflow: 'hidden',
      paddingTop: 64, fontFamily: FONT_BODY,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        padding: '14px 22px 0',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: 0.4, color: PAL.ink, textTransform: 'uppercase' }}>Bugg</div>
        <StreakBadge streak={streak} />
      </div>

      {/* Big hero composition centered */}
      <div style={{ position: 'absolute', top: 130, left: 0, right: 0, height: 280 }}>
        {/* Background squircle for grounding */}
        <Squircle x={110} y={20} size={170} color={palette[8]} speed={speed * 0.7} delay={0} />
        {/* The classic 3-shape stack */}
        <Diamond x={50} y={100} size={120} color={palette[1]} rotate={45} speed={speed} delay={0} />
        <Circle x={130} y={90} size={140} color={palette[0]} speed={speed} delay={0.5} />
        <Scallop x={210} y={70} size={160} color={palette[6]} lobes={14} speed={speed * 0.5} delay={0.2} />
        {/* Floating accents */}
        <Squiggle x={20} y={32} w={90} h={36} color={palette[5]} strokeW={14} speed={speed} delay={0.3} rotate={-8} />
        <Pin x={310} y={20} size={48} outer={palette[8]} inner={palette[5]} speed={speed} delay={0.6} rotate={12} />
      </div>

      <div style={{
        position: 'absolute', left: 0, right: 0, top: 430,
        textAlign: 'center', padding: '0 28px',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 0.8, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
          {bug.day} · {bug.difficulty}
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 44, lineHeight: 0.95,
          marginTop: 10, color: PAL.ink, letterSpacing: -1,
        }}>
          Trouve le<br/>bug du jour.
        </div>
        <div style={{ fontSize: 14, color: 'rgba(0,0,0,0.55)', marginTop: 14, lineHeight: 1.4 }}>
          Une ligne de C cassée. Un fix. Tous les jours.
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 56,
      }}>
        <button onClick={onStart} style={{
          ...ctaBtn(PAL.ink, '#fff'),
          width: '100%', marginTop: 0, fontSize: 16,
          padding: '16px 24px', borderRadius: 999,
        }}>
          Commencer
        </button>
      </div>
    </div>
  );
}

// V3 — "Journey" — Duolingo-like vertical map of shapes
function HomeJourney({ streak, bug, speed, palette, onStart }) {
  // Past days completed, today active, future days locked
  const days = [
    { n: 1, state: 'done' },
    { n: 2, state: 'done' },
    { n: 3, state: 'done' },
    { n: 4, state: 'done' },
    { n: 5, state: 'today' },
    { n: 6, state: 'lock' },
    { n: 7, state: 'lock' },
  ];
  const shapeTypes = ['blob', 'diamond', 'scallop', 'squircle', 'circle', 'pin', 'drop'];
  const xpos = [60, 200, 110, 260, 140, 250, 70]; // zigzag

  return (
    <div style={{
      width: '100%', height: '100%', background: PAL.bg,
      position: 'relative', overflow: 'hidden', fontFamily: FONT_BODY,
      paddingTop: 64,
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 22px 12px',
      }}>
        <div>
          <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'rgba(0,0,0,0.4)', textTransform: 'uppercase', fontWeight: 600 }}>Bugg</div>
          <div style={{ fontFamily: FONT_DISPLAY, fontSize: 26, color: PAL.ink, marginTop: 2 }}>Semaine 1</div>
        </div>
        <StreakBadge streak={streak} />
      </div>

      {/* Map */}
      <div style={{ position: 'relative', height: 580, marginTop: 8 }}>
        {days.map((d, i) => {
          const x = xpos[i];
          const y = 24 + i * 80;
          const color = d.state === 'lock'
            ? '#d4d2cc'
            : d.state === 'today'
              ? palette[(i) % palette.length]
              : palette[(i + 2) % palette.length];
          const size = d.state === 'today' ? 96 : 70;
          return (
            <div key={i}>
              {/* dotted connector */}
              {i < days.length - 1 && (
                <svg style={{ position: 'absolute', left: 0, top: y + size/2, width: '100%', height: 80, pointerEvents: 'none' }}>
                  <path
                    d={`M ${x + size/2},0 Q ${(x + xpos[i+1])/2 + size/2},40 ${xpos[i+1] + size/2},80`}
                    stroke="rgba(0,0,0,0.18)" strokeWidth="3" strokeDasharray="2 8" strokeLinecap="round" fill="none"
                  />
                </svg>
              )}
              <div style={{ position: 'absolute', left: x, top: y, opacity: d.state === 'lock' ? 0.5 : 1 }}>
                <JourneyShape kind={shapeTypes[i % shapeTypes.length]} color={color} size={size} speed={speed} delay={i * 0.2} state={d.state} />
                <div style={{
                  position: 'absolute', top: size + 6, left: 0, width: size, textAlign: 'center',
                  fontSize: 11, fontWeight: 600, color: d.state === 'lock' ? 'rgba(0,0,0,0.3)' : 'rgba(0,0,0,0.6)',
                }}>
                  {d.state === 'today' ? 'Aujourd\'hui' : d.state === 'lock' ? `Jour ${d.n}` : `J${d.n} ✓`}
                </div>
              </div>
            </div>
          );
        })}

        {/* Today CTA pop-out tooltip */}
        <div style={{
          position: 'absolute', left: xpos[4] + 110, top: 24 + 4 * 80 + 30,
          background: PAL.ink, color: '#fff', padding: '8px 12px',
          borderRadius: 12, fontSize: 12, fontWeight: 600,
          boxShadow: '0 6px 18px rgba(0,0,0,0.18)',
          whiteSpace: 'nowrap',
        }}>
          {bug.title} →
        </div>
      </div>

      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 56,
      }}>
        <button onClick={onStart} style={{
          ...ctaBtn(PAL.ink, '#fff'),
          width: '100%', padding: '16px 24px', borderRadius: 999, fontSize: 16,
        }}>
          Démarrer aujourd'hui
        </button>
      </div>
    </div>
  );
}

function JourneyShape({ kind, color, size, speed, delay, state }) {
  if (kind === 'blob') return <Blob x={0} y={0} size={size} color={color} speed={speed} delay={delay} />;
  if (kind === 'diamond') return <Diamond x={0} y={0} size={size} color={color} rotate={45} speed={speed} delay={delay} />;
  if (kind === 'scallop') return <Scallop x={0} y={0} size={size + 10} color={color} lobes={12} speed={speed * 0.5} delay={delay} />;
  if (kind === 'squircle') return <Squircle x={0} y={0} size={size} color={color} speed={speed} delay={delay} />;
  if (kind === 'circle') return <Circle x={0} y={0} size={size} color={color} speed={speed} delay={delay} />;
  if (kind === 'pin') return <Pin x={0} y={0} size={size} outer={'#1a3a2e'} inner={color} speed={speed} delay={delay} rotate={-10} />;
  if (kind === 'drop') return <Drop x={0} y={0} size={size} color={color} accent={'#fcd34d'} speed={speed} delay={delay} />;
}

// ─────────────────────────────────────────────────────────────
// Streak badge
// ─────────────────────────────────────────────────────────────
function StreakBadge({ streak }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 4,
      background: '#fff', padding: '6px 12px', borderRadius: 999,
      boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.04)',
      border: '0.5px solid rgba(0,0,0,0.06)',
    }}>
      <span style={{ fontSize: 14, lineHeight: 1 }}>🔥</span>
      <span style={{ fontSize: 13, fontWeight: 700, color: PAL.ink, fontVariantNumeric: 'tabular-nums' }}>{streak}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Challenge screen — interactive code editor
// ─────────────────────────────────────────────────────────────
function ChallengeScreen({ bug, palette, onSubmit, onSkip, onBack, speed }) {
  const [lines, setLines] = useState([...bug.code]);
  const [editingLine, setEditingLine] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (editingLine !== null && inputRef.current) inputRef.current.focus();
  }, [editingLine]);

  function updateLine(i, val) {
    setLines(prev => { const next = [...prev]; next[i] = val; return next; });
  }

  function stopEditing() { setEditingLine(null); }

  function submit() {
    // Send full code so multi-line fixes are validated correctly.
    onSubmit({ draft: lines.join('\n') });
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: PAL.bg,
      position: 'relative', overflow: 'hidden',
      paddingTop: 64, fontFamily: FONT_BODY,
    }}>
      {/* small floating shapes */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.85 }}>
        <Diamond x={300} y={64} size={32} color={palette[1]} rotate={45} speed={speed} delay={0} />
        <Circle x={20} y={70} size={36} color={palette[0]} speed={speed} delay={0.3} />
        <Squiggle x={280} y={780} w={80} h={28} color={palette[5]} strokeW={9} speed={speed} delay={0.2} rotate={4} />
        <Scallop x={-30} y={750} size={70} color={palette[6]} lobes={12} speed={speed * 0.5} delay={0} />
      </div>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', position: 'relative', zIndex: 5,
      }}>
        <button onClick={onBack} style={{ ...iconBtn() }}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1L3 7l6 6" stroke={PAL.ink} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.55)', fontWeight: 600, letterSpacing: 0.4 }}>
          {bug.day} · {bug.difficulty}
        </div>
        <div style={{ width: 32 }} />
      </div>

      {/* Title */}
      <div style={{ padding: '8px 22px 0', position: 'relative', zIndex: 5 }}>
        <div style={{ fontFamily: FONT_DISPLAY, fontSize: 28, lineHeight: 1.05, color: PAL.ink }}>
          {bug.title}
        </div>
        <div style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.6)', marginTop: 6, lineHeight: 1.4 }}>
          {bug.desc}
        </div>
      </div>

      {/* Code block — all lines editable on tap */}
      <div style={{
        margin: '16px 16px 0', padding: '14px 0',
        background: PAL.ink, color: '#e8e8e3', borderRadius: 18,
        fontFamily: FONT_MONO, fontSize: 12.5, lineHeight: 1.6,
        overflow: 'hidden',
        boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        position: 'relative', zIndex: 5,
      }}>
        <div style={{ padding: '0 14px', color: 'rgba(255,255,255,0.4)', fontSize: 10.5, letterSpacing: 0.5, marginBottom: 6, textTransform: 'uppercase', fontWeight: 600 }}>
          challenge.c — appuie sur une ligne pour la modifier
        </div>
        {lines.map((line, i) => {
          const isBug = i === bug.bugLine;
          const isEditing = editingLine === i;
          const changed = line !== bug.code[i];
          return (
            <div key={i} style={{
              display: 'flex', padding: '2px 14px',
              background: isBug ? 'rgba(255,95,162,0.12)' : changed ? 'rgba(62,234,132,0.07)' : 'transparent',
              borderLeft: isBug ? `3px solid ${palette[0]}` : changed ? '3px solid #3eea84' : '3px solid transparent',
            }}>
              <span style={{ width: 22, color: 'rgba(255,255,255,0.3)', textAlign: 'right', marginRight: 12, userSelect: 'none', flexShrink: 0 }}>{i+1}</span>
              {isEditing ? (
                <input
                  ref={inputRef}
                  value={line}
                  onChange={(e) => updateLine(i, e.target.value)}
                  onBlur={stopEditing}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); stopEditing(); } }}
                  style={{
                    flex: 1, background: 'rgba(255,255,255,0.08)',
                    border: `1px solid ${isBug ? 'rgba(255,95,162,0.6)' : 'rgba(255,255,255,0.3)'}`,
                    borderRadius: 4, padding: '0 6px',
                    fontFamily: FONT_MONO, fontSize: 12.5, color: '#fff', outline: 'none',
                  }}
                />
              ) : (
                <span
                  onClick={() => setEditingLine(i)}
                  style={{ flex: 1, cursor: 'text', whiteSpace: 'pre', color: line.startsWith('#') ? '#a8d4b0' : '#e8e8e3', minHeight: '1em', display: 'block' }}
                >
                  {line || ' '}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Hint pill (collapsible) */}
      <Hint hint={bug.hint} accent={palette[0]} />

      {/* Bottom action bar */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 56,
        display: 'flex', gap: 10,
      }}>
        <button onClick={onSkip} style={{
          flex: 1, ...ctaBtn('#fff', PAL.ink),
          border: '1px solid rgba(0,0,0,0.1)', boxShadow: 'none', fontSize: 14,
        }}>
          Passer →
        </button>
        <button onClick={submit} style={{
          flex: 2, ...ctaBtn(PAL.ink, '#fff'), fontSize: 14,
        }}>
          Soumettre
        </button>
      </div>
    </div>
  );
}

function Hint({ hint, accent }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ margin: '12px 16px 0', position: 'relative', zIndex: 5 }}>
      <button onClick={() => setOpen(o => !o)} style={{
        background: 'transparent', border: 'none', padding: '6px 10px',
        fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer',
      }}>
        <span style={{
          display: 'inline-block', width: 8, height: 8, borderRadius: 999, background: accent,
        }}/>
        {open ? 'Masquer l\'indice' : 'Voir l\'indice'}
      </button>
      {open && (
        <div style={{
          background: '#fff', borderRadius: 14, padding: '10px 14px',
          fontSize: 13, color: 'rgba(0,0,0,0.7)', lineHeight: 1.45,
          marginTop: 4,
          boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.04)',
        }}>
          {hint}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Result screen
// ─────────────────────────────────────────────────────────────
function ResultScreen({ bug, correct, draft, palette, speed, onContinue, answer, explanation, xp_awarded }) {
  // Prefer props (server response) over bug fields (offline/canvas fallback)
  const _answer      = (answer !== undefined && answer !== null) ? answer : bug.answer;
  const _explanation = (explanation !== undefined && explanation !== null) ? explanation : bug.explanation;
  const _xp          = (xp_awarded !== undefined && xp_awarded !== null) ? xp_awarded : (bug.xp || 0);
  return (
    <div style={{
      width: '100%', height: '100%', background: correct ? PAL.bg : PAL.bg,
      position: 'relative', overflow: 'hidden', paddingTop: 64,
      fontFamily: FONT_BODY,
    }}>
      {/* Celebration shape garden if correct, muted if wrong */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: correct ? 1 : 0.45 }}>
        <Scallop x={-40} y={120} size={150} color={correct ? palette[6] : '#d1cdc4'} lobes={14} speed={speed * 0.5} delay={0} />
        <Diamond x={310} y={140} size={70} color={correct ? palette[1] : '#d1cdc4'} rotate={45} speed={speed} delay={0.3} />
        <Circle x={280} y={200} size={56} color={correct ? palette[0] : '#d1cdc4'} speed={speed} delay={0.4} />
        <Squiggle x={20} y={260} w={140} h={40} color={correct ? palette[5] : '#d1cdc4'} strokeW={16} speed={speed} delay={0.6} rotate={-6} />
        <Squircle x={300} y={750} size={60} color={correct ? palette[4] : '#d1cdc4'} speed={speed} delay={0} />
        <Drop x={32} y={760} size={50} color={correct ? palette[8] : '#d1cdc4'} accent={correct ? palette[3] : '#fff'} speed={speed} delay={0.2} rotate={20} />
      </div>

      {/* Hero status */}
      <div style={{
        position: 'absolute', top: 110, left: 0, right: 0, padding: '0 28px',
        textAlign: 'center', zIndex: 5,
      }}>
        <div style={{
          fontSize: 11, letterSpacing: 0.8, fontWeight: 700,
          color: correct ? palette[6] : palette[1], textTransform: 'uppercase',
        }}>
          {correct ? 'Bug résolu !' : 'Pas tout à fait…'}
        </div>
        <div style={{
          fontFamily: FONT_DISPLAY, fontSize: 52, lineHeight: 0.95,
          color: PAL.ink, marginTop: 8, letterSpacing: -1,
        }}>
          {correct ? `+${_xp} XP` : 'Réessaie'}
        </div>
      </div>

      {/* Explanation card */}
      <div style={{
        position: 'absolute', left: 16, right: 16, top: 360, zIndex: 5,
        background: '#fff', borderRadius: 22, padding: '18px 18px',
        boxShadow: '0 1px 0 rgba(0,0,0,0.04), 0 12px 28px rgba(0,0,0,0.06)',
      }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
          {correct ? 'Pourquoi ça marche' : 'Le bon fix'}
        </div>
        <div style={{
          fontFamily: FONT_MONO, fontSize: 12, color: PAL.ink,
          background: '#f5f4ef', padding: '8px 10px', borderRadius: 8,
          marginTop: 8, lineHeight: 1.4,
        }}>
          {_answer}
        </div>
        <div style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.65)', marginTop: 10, lineHeight: 1.45 }}>
          {_explanation}
        </div>
      </div>

      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 56 }}>
        <button onClick={() => onContinue(correct)} style={{
          ...ctaBtn(PAL.ink, '#fff'), width: '100%',
          padding: '16px 24px', borderRadius: 999, fontSize: 16,
        }}>
          {correct ? 'Continuer la série →' : 'Réessayer'}
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// Style helpers
// ─────────────────────────────────────────────────────────────
function ctaBtn(bg, fg) {
  return {
    marginTop: 14,
    padding: '12px 20px',
    background: bg, color: fg,
    border: 'none', borderRadius: 14,
    fontFamily: FONT_BODY, fontSize: 14, fontWeight: 600,
    cursor: 'pointer',
    boxShadow: bg === '#fff' ? '0 1px 0 rgba(0,0,0,0.04), 0 6px 18px rgba(0,0,0,0.04)' : '0 6px 18px rgba(0,0,0,0.18)',
    letterSpacing: 0.2,
  };
}
function iconBtn() {
  return {
    width: 32, height: 32, borderRadius: 999,
    background: '#fff', border: '0.5px solid rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0,
    boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
  };
}

// ─────────────────────────────────────────────────────────────
// Per-variation app (manages screen state)
// ─────────────────────────────────────────────────────────────
function BuggApp({ variant, palette, speed }) {
  const [screen, setScreen] = useState('home');
  const [streak, setStreak] = useState(4);
  const [result, setResult] = useState(null);
  const bug = bugForStreak(streak);

  function start() { setScreen('challenge'); }
  function submit({ correct, draft }) {
    setResult({ correct, draft });
    setScreen('result');
  }
  function next(correct) {
    if (correct) setStreak(s => s + 1);
    setScreen('home');
  }

  if (screen === 'home') {
    if (variant === 'scattered') return <HomeScattered streak={streak} bug={bug} speed={speed} palette={palette} onStart={start} />;
    if (variant === 'hero')      return <HomeHero      streak={streak} bug={bug} speed={speed} palette={palette} onStart={start} />;
    if (variant === 'journey')   return <HomeJourney   streak={streak} bug={bug} speed={speed} palette={palette} onStart={start} />;
  }
  if (screen === 'challenge') {
    return <ChallengeScreen bug={bug} palette={palette} onSubmit={submit} onBack={() => setScreen('home')} speed={speed} />;
  }
  if (screen === 'result') {
    return <ResultScreen bug={bug} correct={result.correct} draft={result.draft} palette={palette} speed={speed} onContinue={next} />;
  }
}

Object.assign(window, {
  BuggApp, HomeScattered, HomeHero, HomeJourney,
  ChallengeScreen, ResultScreen, PAL,
});
