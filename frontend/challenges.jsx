// challenges.jsx — 3 variants of the daily-bug challenge screen

const { useState: useStateC, useRef: useRefC, useEffect: useEffectC } = React;

const FONT_DISPLAY_C = '"Instrument Serif", Georgia, serif';
const FONT_BODY_C = '-apple-system, "Inter", system-ui, sans-serif';
const FONT_MONO_C = '"JetBrains Mono", "SF Mono", Menlo, monospace';

// Tokenize a C source line for syntax highlighting (very small, on purpose)
function tokenizeC(line) {
  const tokens = [];
  const re = /(\/\/.*$|"[^"]*"|\b(?:int|char|float|double|void|return|if|else|for|while|struct|sizeof|malloc|free|include|NULL|long|short|unsigned|static|const)\b|\b\d+\b|[A-Za-z_]\w*|\s+|[^\s])/g;
  let m;
  while ((m = re.exec(line)) !== null) {
    const t = m[0];
    let cls = 'plain';
    if (t.startsWith('//')) cls = 'comment';
    else if (t.startsWith('"')) cls = 'string';
    else if (/^\b(int|char|float|double|void|long|short|unsigned|static|const)\b$/.test(t)) cls = 'type';
    else if (/^\b(return|if|else|for|while|struct|sizeof)\b$/.test(t)) cls = 'kw';
    else if (/^\b(malloc|free|strcpy|printf)\b$/.test(t)) cls = 'fn';
    else if (/^\d+$/.test(t)) cls = 'num';
    else if (/^[(){};=+\-*/<>!,.\[\]]+$/.test(t)) cls = 'punct';
    tokens.push({ t, cls });
  }
  return tokens;
}

const SYNTAX_COLORS = {
  plain: '#e8e8e3',
  comment: 'rgba(255,255,255,0.35)',
  string: '#a3e635',
  type: '#7dd3fc',
  kw: '#ff9ed8',
  fn: '#fbbf24',
  num: '#fb923c',
  punct: 'rgba(255,255,255,0.6)',
};

function HighlightedLine({ line }) {
  const tokens = tokenizeC(line);
  return (
    <span style={{ whiteSpace: 'pre', fontFamily: FONT_MONO_C }}>
      {tokens.map((tk, i) => (
        <span key={i} style={{ color: SYNTAX_COLORS[tk.cls] }}>{tk.t}</span>
      ))}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────
// A — Composer: dark code, fix bar at bottom (terminal vibe)
// ─────────────────────────────────────────────────────────────
function ChallengeA({ bug, palette, speed, onSubmit, onBack }) {
  const [draft, setDraft] = useStateC('');
  const [focused, setFocused] = useStateC(false);
  function submit() {
    const ok = bug.accept.some(re => re.test(draft));
    onSubmit?.({ correct: ok, draft });
  }
  return (
    <div style={{
      width: '100%', height: '100%', background: '#0c0d0a',
      position: 'relative', overflow: 'hidden',
      paddingTop: 64, fontFamily: FONT_BODY_C, color: '#fff',
    }}>
      {/* dark, single-shape backdrop */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.5 }}>
        <Blob x={-60} y={-40} size={220} color={palette[0]} speed={speed * 0.7} delay={0} variant={2} />
        <Squiggle x={260} y={760} w={120} h={36} color={palette[5]} strokeW={10} speed={speed} delay={0.2} rotate={-6} />
      </div>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', position: 'relative', zIndex: 5,
      }}>
        <button onClick={onBack} style={iconBtnDark()}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1L3 7l6 6" stroke="#fff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 11, color: 'rgba(255,255,255,0.55)', fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: palette[0] }} />
          {bug.day} · {bug.difficulty}
        </div>
        <button style={iconBtnDark()}>
          <svg width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="5.5" stroke="#fff" strokeWidth="1.5" fill="none"/><path d="M7 4v3M7 10h.01" stroke="#fff" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>

      {/* Title + desc */}
      <div style={{ padding: '6px 22px 0', position: 'relative', zIndex: 5 }}>
        <div style={{ fontFamily: FONT_DISPLAY_C, fontSize: 30, lineHeight: 1.0, color: '#fff', letterSpacing: -0.5 }}>
          {bug.title}
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.45 }}>
          {bug.desc}
        </div>
      </div>

      {/* Code block — fullscreen-feeling */}
      <div style={{
        margin: '18px 18px 0', position: 'relative', zIndex: 5,
        background: 'rgba(255,255,255,0.04)',
        border: '0.5px solid rgba(255,255,255,0.08)',
        borderRadius: 16, padding: '12px 0', overflow: 'hidden',
      }}>
        <div style={{
          padding: '0 14px 8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '0.5px solid rgba(255,255,255,0.06)', marginBottom: 8,
        }}>
          <span style={{ fontFamily: FONT_MONO_C, fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>challenge.c</span>
          <span style={{
            fontSize: 10, color: palette[0], background: 'rgba(255,95,162,0.12)',
            padding: '3px 8px', borderRadius: 999, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase',
          }}>1 bug</span>
        </div>
        {bug.code.map((line, i) => {
          const isBug = i === bug.bugLine;
          return (
            <div key={i} style={{
              display: 'flex', padding: '2px 14px', fontFamily: FONT_MONO_C, fontSize: 12.5, lineHeight: 1.65,
              background: isBug ? 'rgba(255,95,162,0.10)' : 'transparent',
              borderLeft: isBug ? `2px solid ${palette[0]}` : '2px solid transparent',
              position: 'relative',
            }}>
              <span style={{ width: 22, color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginRight: 12, userSelect: 'none', flexShrink: 0 }}>{i+1}</span>
              {isBug ? (
                <span style={{ flex: 1, position: 'relative' }}>
                  <span style={{ color: 'rgba(255,255,255,0.25)', textDecoration: `underline wavy ${palette[0]}`, textUnderlineOffset: 4, textDecorationThickness: 1.5 }}>
                    <HighlightedLine line={line} />
                  </span>
                  <span style={{
                    position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 9, color: palette[0], fontWeight: 700, letterSpacing: 0.5,
                  }}>BUG</span>
                </span>
              ) : (
                <HighlightedLine line={line} />
              )}
            </div>
          );
        })}
      </div>

      {/* Bottom: composer / fix bar */}
      <div style={{
        position: 'absolute', left: 12, right: 12, bottom: 48, zIndex: 6,
      }}>
        <div style={{
          background: '#16170f', borderRadius: 22,
          padding: '10px 12px',
          border: focused ? `1px solid ${palette[0]}` : '0.5px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
          transition: 'border-color 120ms',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '0 4px 6px',
            fontSize: 10, color: 'rgba(255,255,255,0.5)', fontWeight: 600, letterSpacing: 0.6, textTransform: 'uppercase',
          }}>
            <span style={{ color: palette[5] }}>›</span> Remplace la ligne {bug.bugLine + 1}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => { if (e.key === 'Enter') submit(); }}
              placeholder={bug.code[bug.bugLine].trim()}
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: FONT_MONO_C, fontSize: 13, color: '#fff',
                padding: '8px 6px',
              }}
            />
            <button onClick={submit} disabled={!draft.trim()} style={{
              background: draft.trim() ? palette[0] : 'rgba(255,255,255,0.08)',
              color: draft.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
              border: 'none', borderRadius: 999, padding: '8px 14px',
              fontSize: 13, fontWeight: 600, cursor: draft.trim() ? 'pointer' : 'default',
              transition: 'background 150ms',
            }}>
              ↑
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
          Indice : {bug.hint}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// B — Inline: tap the buggy line to edit, shapes in background
// ─────────────────────────────────────────────────────────────
function ChallengeB({ bug, palette, speed, onSubmit, onBack }) {
  const [draft, setDraft] = useStateC(bug.code[bug.bugLine]);
  const [editing, setEditing] = useStateC(false);
  const [hintOpen, setHintOpen] = useStateC(false);
  const inp = useRefC(null);
  useEffectC(() => { if (editing && inp.current) inp.current.focus(); }, [editing]);
  function submit() {
    const ok = bug.accept.some(re => re.test(draft));
    onSubmit?.({ correct: ok, draft });
  }
  return (
    <div style={{
      width: '100%', height: '100%', background: '#fafaf7',
      position: 'relative', overflow: 'hidden',
      paddingTop: 64, fontFamily: FONT_BODY_C,
    }}>
      {/* shapes — moderate presence */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Scallop x={-50} y={80} size={130} color={palette[6]} lobes={14} speed={speed * 0.5} delay={0} />
        <Squiggle x={250} y={70} w={130} h={40} color={palette[5]} strokeW={14} speed={speed} delay={0.3} rotate={6} />
        <Diamond x={310} y={680} size={70} color={palette[1]} rotate={45} speed={speed} delay={0.4} />
        <Circle x={280} y={750} size={50} color={palette[0]} speed={speed} delay={0.6} />
        <Squircle x={20} y={730} size={60} color={palette[4]} speed={speed} delay={0.2} />
        <Blob x={-30} y={760} size={80} color={palette[2]} speed={speed} delay={0.5} variant={2} />
      </div>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', position: 'relative', zIndex: 5,
      }}>
        <button onClick={onBack} style={iconBtnLight()}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1L3 7l6 6" stroke="#0f0f0d" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            fontSize: 11, color: 'rgba(0,0,0,0.6)', fontWeight: 700, letterSpacing: 0.5,
            background: '#fff', padding: '5px 10px', borderRadius: 999,
            border: '0.5px solid rgba(0,0,0,0.06)',
          }}>+{bug.xp} XP</span>
        </div>
        <button style={iconBtnLight()}>
          <svg width="3" height="14" viewBox="0 0 3 14"><circle cx="1.5" cy="2" r="1.5" fill="#0f0f0d"/><circle cx="1.5" cy="7" r="1.5" fill="#0f0f0d"/><circle cx="1.5" cy="12" r="1.5" fill="#0f0f0d"/></svg>
        </button>
      </div>

      {/* Title block — large serif */}
      <div style={{ padding: '6px 22px 0', position: 'relative', zIndex: 5 }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
          {bug.day} · {bug.difficulty}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY_C, fontSize: 36, lineHeight: 1.0, marginTop: 4, color: '#0f0f0d', letterSpacing: -0.5 }}>
          {bug.title}
        </div>
        <div style={{ fontSize: 13.5, color: 'rgba(0,0,0,0.6)', marginTop: 8, lineHeight: 1.45 }}>
          {bug.desc}
        </div>
      </div>

      {/* Code block */}
      <div style={{
        margin: '14px 16px 0', padding: '14px 0',
        background: '#0c0d0a', color: '#e8e8e3', borderRadius: 20,
        fontFamily: FONT_MONO_C, fontSize: 12.5, lineHeight: 1.65,
        boxShadow: '0 16px 36px rgba(0,0,0,0.16)',
        position: 'relative', zIndex: 5,
      }}>
        <div style={{ padding: '0 16px 10px', borderBottom: '0.5px solid rgba(255,255,255,0.06)', marginBottom: 6,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.4 }}>challenge.c</span>
          <span style={{ display: 'flex', gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#444' }}/>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#444' }}/>
            <span style={{ width: 8, height: 8, borderRadius: 999, background: '#444' }}/>
          </span>
        </div>
        {bug.code.map((line, i) => {
          const isBug = i === bug.bugLine;
          return (
            <div key={i} style={{
              display: 'flex', padding: '1px 14px',
              background: isBug ? 'rgba(255,95,162,0.10)' : 'transparent',
              borderLeft: isBug ? `2px solid ${palette[0]}` : '2px solid transparent',
            }}>
              <span style={{ width: 22, color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginRight: 12, userSelect: 'none', flexShrink: 0 }}>{i+1}</span>
              {isBug ? (
                editing ? (
                  <input
                    ref={inp}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={() => setEditing(false)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); setEditing(false); } }}
                    style={{
                      flex: 1, background: 'rgba(255,255,255,0.08)',
                      border: `1px solid ${palette[0]}`, borderRadius: 4, padding: '0 6px',
                      fontFamily: FONT_MONO_C, fontSize: 12.5, color: '#fff', outline: 'none',
                    }}
                  />
                ) : (
                  <span onClick={() => setEditing(true)} style={{
                    flex: 1, cursor: 'text',
                    color: draft === bug.code[bug.bugLine] ? 'rgba(255,255,255,0.45)' : '#fff',
                  }}>
                    <HighlightedLine line={draft} />
                  </span>
                )
              ) : (
                <HighlightedLine line={line} />
              )}
            </div>
          );
        })}
      </div>

      {/* Hint chip */}
      <div style={{ position: 'relative', zIndex: 5, margin: '12px 16px 0' }}>
        <button onClick={() => setHintOpen(o => !o)} style={{
          background: 'rgba(0,0,0,0.04)', border: '0.5px solid rgba(0,0,0,0.06)',
          padding: '8px 12px', borderRadius: 999, fontSize: 12, fontWeight: 600,
          color: 'rgba(0,0,0,0.7)', display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
        }}>
          <span style={{ width: 6, height: 6, borderRadius: 999, background: palette[5] }}/>
          {hintOpen ? 'Indice : ' + bug.hint : 'Voir l\'indice'}
        </button>
      </div>

      {/* Bottom action */}
      <div style={{
        position: 'absolute', left: 16, right: 16, bottom: 48, zIndex: 6,
        display: 'flex', gap: 10,
      }}>
        <button onClick={() => setEditing(true)} style={{
          flex: 1, padding: '14px 18px', background: '#fff', color: '#0f0f0d',
          border: '0.5px solid rgba(0,0,0,0.08)', borderRadius: 14,
          fontSize: 14, fontWeight: 600, cursor: 'pointer',
        }}>
          {editing ? 'Édition…' : 'Tap pour éditer'}
        </button>
        <button onClick={submit} disabled={draft === bug.code[bug.bugLine]} style={{
          flex: 1, padding: '14px 18px',
          background: draft !== bug.code[bug.bugLine] ? '#0f0f0d' : 'rgba(0,0,0,0.15)',
          color: '#fff', border: 'none', borderRadius: 14,
          fontSize: 14, fontWeight: 600,
          cursor: draft !== bug.code[bug.bugLine] ? 'pointer' : 'default',
          boxShadow: draft !== bug.code[bug.bugLine] ? '0 6px 18px rgba(0,0,0,0.2)' : 'none',
        }}>
          Soumettre
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// C — QCM: choose between 3 candidate fixes (Duolingo-style)
// ─────────────────────────────────────────────────────────────
function ChallengeC({ bug, palette, speed, onSubmit, onBack }) {
  // Build 3 choices: the right one + 2 close-but-wrong
  const choices = useStateC(() => {
    const right = bug.answer.trim();
    const buggy = bug.code[bug.bugLine].trim();
    // a third "looks plausible" wrong answer
    const decoys = {
      1: 'for (int i = 1; i < n; i++) {',
      2: 'if (score === 100) {',
      3: '  char buf[8];',
      4: '  malloc(arr);',
      5: '  return sum / (n + 1);',
    };
    const decoy = decoys[bug.id] || buggy.replace(/=\s*0/, '= 1');
    const arr = [
      { txt: right, ok: true },
      { txt: buggy, ok: false },
      { txt: decoy, ok: false },
    ];
    // shuffle (deterministic by id so it doesn't reshuffle on every render)
    const seed = bug.id;
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = (i * seed * 7 + 3) % (i + 1);
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  })[0];

  const [picked, setPicked] = useStateC(null);

  function submit() {
    if (picked == null) return;
    onSubmit?.({ correct: choices[picked].ok, draft: choices[picked].txt });
  }

  return (
    <div style={{
      width: '100%', height: '100%', background: '#fef9ee',
      position: 'relative', overflow: 'hidden',
      paddingTop: 64, fontFamily: FONT_BODY_C,
    }}>
      {/* shape accents */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Pin x={300} y={75} size={48} outer={palette[1]} inner={palette[5]} speed={speed} delay={0} rotate={12} />
        <Squiggle x={20} y={130} w={90} h={30} color={palette[5]} strokeW={11} speed={speed} delay={0.2} rotate={-6} />
        <Scallop x={310} y={750} size={90} color={palette[6]} lobes={12} speed={speed * 0.5} delay={0.3} />
        <Diamond x={-20} y={770} size={70} color={palette[1]} rotate={45} speed={speed} delay={0.4} />
        <Blob x={350} y={390} size={50} color={palette[0]} speed={speed} delay={0.6} />
      </div>

      {/* Top bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '12px 18px', position: 'relative', zIndex: 5,
      }}>
        <button onClick={onBack} style={iconBtnLight()}>
          <svg width="14" height="14" viewBox="0 0 14 14"><path d="M9 1L3 7l6 6" stroke="#0f0f0d" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        {/* progress bar */}
        <div style={{ flex: 1, margin: '0 14px', height: 8, background: 'rgba(0,0,0,0.06)', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: '40%', height: '100%', background: palette[0], borderRadius: 999, transition: 'width 200ms' }} />
        </div>
        <div style={{
          width: 32, height: 32, borderRadius: 999, background: '#fff',
          border: '0.5px solid rgba(0,0,0,0.08)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#0f0f0d',
        }}>
          ❤︎
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: '18px 22px 0', position: 'relative', zIndex: 5 }}>
        <div style={{ fontSize: 11, letterSpacing: 0.6, color: 'rgba(0,0,0,0.5)', textTransform: 'uppercase', fontWeight: 600 }}>
          {bug.day} · {bug.difficulty}
        </div>
        <div style={{ fontFamily: FONT_DISPLAY_C, fontSize: 30, lineHeight: 1.0, marginTop: 6, color: '#0f0f0d', letterSpacing: -0.4 }}>
          Quelle ligne corrige le bug ?
        </div>
      </div>

      {/* Code preview with the buggy line redacted */}
      <div style={{
        margin: '14px 16px 0', padding: '12px 0',
        background: '#0c0d0a', color: '#e8e8e3', borderRadius: 18,
        fontFamily: FONT_MONO_C, fontSize: 12, lineHeight: 1.65,
        position: 'relative', zIndex: 5,
        boxShadow: '0 14px 32px rgba(0,0,0,0.14)',
      }}>
        {bug.code.map((line, i) => {
          const isBug = i === bug.bugLine;
          return (
            <div key={i} style={{
              display: 'flex', padding: '1px 14px',
              background: isBug ? 'rgba(252,211,77,0.16)' : 'transparent',
              borderLeft: isBug ? `2px solid ${palette[3]}` : '2px solid transparent',
            }}>
              <span style={{ width: 22, color: 'rgba(255,255,255,0.25)', textAlign: 'right', marginRight: 12, userSelect: 'none', flexShrink: 0 }}>{i+1}</span>
              {isBug ? (
                <span style={{
                  flex: 1, color: 'rgba(255,255,255,0.4)',
                  fontStyle: 'italic',
                }}>
                  ╳   ╳   ╳
                </span>
              ) : (
                <HighlightedLine line={line} />
              )}
            </div>
          );
        })}
      </div>

      {/* Choice cards */}
      <div style={{
        position: 'absolute', left: 16, right: 16, top: 540, zIndex: 5,
        display: 'flex', flexDirection: 'column', gap: 10,
      }}>
        {choices.map((c, i) => {
          const active = picked === i;
          return (
            <button
              key={i}
              onClick={() => setPicked(i)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 14px', borderRadius: 16,
                background: active ? `${palette[0]}` : '#fff',
                color: active ? '#fff' : '#0f0f0d',
                border: active ? `2px solid ${palette[0]}` : '0.5px solid rgba(0,0,0,0.08)',
                cursor: 'pointer', textAlign: 'left',
                boxShadow: active ? `0 8px 22px ${palette[0]}55` : '0 1px 0 rgba(0,0,0,0.04), 0 4px 14px rgba(0,0,0,0.04)',
                transition: 'all 150ms',
                fontFamily: FONT_MONO_C, fontSize: 12.5,
              }}>
              <span style={{
                width: 24, height: 24, borderRadius: 999, flexShrink: 0,
                background: active ? '#fff' : 'rgba(0,0,0,0.06)',
                color: active ? palette[0] : 'rgba(0,0,0,0.55)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: FONT_BODY_C, fontSize: 11, fontWeight: 700,
              }}>{['A','B','C'][i]}</span>
              <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.txt}</span>
            </button>
          );
        })}
      </div>

      {/* Submit */}
      <div style={{ position: 'absolute', left: 16, right: 16, bottom: 48, zIndex: 6 }}>
        <button onClick={submit} disabled={picked == null} style={{
          width: '100%', padding: '16px 24px',
          background: picked != null ? '#0f0f0d' : 'rgba(0,0,0,0.15)',
          color: '#fff', border: 'none', borderRadius: 999,
          fontSize: 16, fontWeight: 600,
          cursor: picked != null ? 'pointer' : 'default',
          boxShadow: picked != null ? '0 8px 22px rgba(0,0,0,0.22)' : 'none',
          transition: 'background 150ms',
        }}>
          Vérifier
        </button>
      </div>
    </div>
  );
}

// ─── helpers
function iconBtnDark() {
  return {
    width: 32, height: 32, borderRadius: 999,
    background: 'rgba(255,255,255,0.06)',
    border: '0.5px solid rgba(255,255,255,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0,
  };
}
function iconBtnLight() {
  return {
    width: 32, height: 32, borderRadius: 999,
    background: '#fff',
    border: '0.5px solid rgba(0,0,0,0.08)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', padding: 0,
    boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
  };
}

Object.assign(window, { ChallengeA, ChallengeB, ChallengeC });
