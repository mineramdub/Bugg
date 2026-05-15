// shapes.jsx — Animated playful shapes for Bugg
// Composable, color-driven, slow morphing/drifting motion.
// All shapes accept { x, y, size, color, rotate, speed, delay } and absolute-position themselves.

const SHAPE_KEYFRAMES = `
  @keyframes bugg-blob1 {
    0%, 100% { border-radius: 70% 30% 30% 70% / 50% 70% 30% 50%; }
    25%      { border-radius: 30% 70% 70% 30% / 70% 30% 70% 30%; }
    50%      { border-radius: 50% 50% 20% 80% / 25% 80% 20% 75%; }
    75%      { border-radius: 80% 20% 60% 40% / 40% 60% 80% 20%; }
  }
  @keyframes bugg-blob2 {
    0%, 100% { border-radius: 20% 80% 80% 20% / 70% 30% 70% 30%; }
    33%      { border-radius: 70% 30% 20% 80% / 20% 80% 30% 70%; }
    66%      { border-radius: 80% 20% 70% 30% / 30% 70% 20% 80%; }
  }
  @keyframes bugg-squircle {
    0%, 100% { border-radius: 18%; }
    25%      { border-radius: 50%; }
    50%      { border-radius: 28%; }
    75%      { border-radius: 45%; }
  }
  @keyframes bugg-spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes bugg-spin-rev {
    from { transform: rotate(0deg); }
    to   { transform: rotate(-360deg); }
  }
  @keyframes bugg-wobble {
    0%, 100% { transform: rotate(0deg) scale(1); }
    25%      { transform: rotate(8deg) scale(1.08); }
    50%      { transform: rotate(-3deg) scale(0.95); }
    75%      { transform: rotate(-8deg) scale(1.05); }
  }
  @keyframes bugg-drift-y {
    0%, 100% { translate: 0 0; }
    50%      { translate: 0 -16px; }
  }
  @keyframes bugg-drift-x {
    0%, 100% { translate: 0 0; }
    50%      { translate: 14px 0; }
  }
  @keyframes bugg-pulse {
    0%, 100% { transform: scale(1); }
    50%      { transform: scale(1.18); }
  }
  @keyframes bugg-stretch {
    0%, 100% { transform: scaleY(1) scaleX(1); }
    25%     { transform: scaleY(1.15) scaleX(0.85); }
    50%     { transform: scaleY(0.9) scaleX(1.1); }
    75%     { transform: scaleY(1.08) scaleX(0.92); }
  }
  @keyframes bugg-rainbow-rot {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes bugg-fadein {
    from { opacity: 0; transform: scale(0.85); }
    to   { opacity: 1; transform: scale(1); }
  }
`;

if (typeof document !== 'undefined' && !document.getElementById('bugg-shape-keyframes')) {
  const s = document.createElement('style');
  s.id = 'bugg-shape-keyframes';
  s.textContent = SHAPE_KEYFRAMES;
  document.head.appendChild(s);
}

// ── helpers
function applySpeed(baseDur, speedMul = 1) {
  // higher speedMul = faster motion → shorter duration
  return `${(baseDur / Math.max(0.05, speedMul)).toFixed(2)}s`;
}

function abs(x, y, size, rotate, extra = {}) {
  return {
    position: 'absolute',
    left: x,
    top: y,
    width: size,
    height: size,
    transform: `rotate(${rotate || 0}deg)`,
    ...extra,
  };
}

// ── 1. Morphing blob — primary morphing shape
function Blob({ x = 0, y = 0, size = 80, color = '#ff5fa2', rotate = 0, speed = 1, delay = 0, variant = 1 }) {
  const morphAnim = variant === 2 ? 'bugg-blob2' : 'bugg-blob1';
  return (
    <div style={{
      ...abs(x, y, size, rotate),
      background: color,
      animation: `${morphAnim} ${applySpeed(2.6, speed)} ease-in-out ${delay}s infinite, bugg-drift-y ${applySpeed(3, speed)} ease-in-out ${delay}s infinite`,
    }} />
  );
}

// ── 2. Diamond (rotated square) with subtle wobble
function Diamond({ x = 0, y = 0, size = 70, color = '#1a3a2e', rotate = 45, speed = 1, delay = 0 }) {
  return (
    <div style={{
      ...abs(x, y, size, 0),
      animation: `bugg-drift-x ${applySpeed(2.4, speed)} ease-in-out ${delay}s infinite`,
    }}>
      <div style={{
        width: '100%', height: '100%', background: color,
        transform: `rotate(${rotate}deg)`,
        animation: `bugg-wobble ${applySpeed(2.8, speed)} ease-in-out ${delay}s infinite`,
        transformOrigin: 'center',
      }} />
    </div>
  );
}

// ── 3. Circle with breathing pulse
function Circle({ x = 0, y = 0, size = 60, color = '#ff5fa2', speed = 1, delay = 0 }) {
  return (
    <div style={{
      ...abs(x, y, size, 0),
      borderRadius: '50%',
      background: color,
      animation: `bugg-pulse ${applySpeed(1.8, speed)} ease-in-out ${delay}s infinite, bugg-drift-y ${applySpeed(3, speed)} ease-in-out ${delay}s infinite`,
    }} />
  );
}

// ── 4. Squircle morphing between rounded square and circle
function Squircle({ x = 0, y = 0, size = 70, color = '#7c3aed', speed = 1, delay = 0 }) {
  return (
    <div style={{
      ...abs(x, y, size, 0),
      background: color,
      animation: `bugg-squircle ${applySpeed(2.2, speed)} ease-in-out ${delay}s infinite, bugg-drift-x ${applySpeed(3.4, speed)} ease-in-out ${delay}s infinite`,
    }} />
  );
}

// ── 5. Scallop / chrysanthemum (the dark red flower in the Figma screen)
function Scallop({ x = 0, y = 0, size = 80, color = '#5a0f1a', lobes = 12, lobeRatio = 0.22, speed = 1, delay = 0, reverse = false }) {
  const cx = 50, cy = 50, R = 40;
  const lobeR = R * lobeRatio * 1.6;
  const innerR = R - lobeR * 0.55;
  // build path: alternating arcs around inner circle + lobe bumps
  const pts = [];
  for (let i = 0; i < lobes; i++) {
    const a = (i / lobes) * Math.PI * 2;
    const lx = cx + Math.cos(a) * R;
    const ly = cy + Math.sin(a) * R;
    pts.push({ lx, ly, lobeR });
  }
  const path = pts.map((p, i) => {
    if (i === 0) return `M ${cx + innerR},${cy} `;
    return '';
  }).join('');
  // simpler: SVG with N circles around perimeter + center disc
  return (
    <div style={{
      ...abs(x, y, size, 0),
      animation: `${reverse ? 'bugg-spin-rev' : 'bugg-spin'} ${applySpeed(12, speed)} linear ${delay}s infinite, bugg-pulse ${applySpeed(2.4, speed)} ease-in-out ${delay}s infinite`,
    }}>
      <svg viewBox="0 0 100 100" width={size} height={size} style={{ display: 'block', overflow: 'visible' }}>
        {pts.map((p, i) => (
          <circle key={i} cx={p.lx} cy={p.ly} r={lobeR} fill={color} />
        ))}
        <circle cx={cx} cy={cy} r={innerR} fill={color} />
      </svg>
    </div>
  );
}

// ── 6. Stripey arc (the magenta/blue rainbow in Figma screen)
function ArcStripes({ x = 0, y = 0, w = 140, h = 90, colors = ['#ff00d4', '#5b3df2', '#ff00d4'], speed = 1, delay = 0, rotate = 0 }) {
  const stripeH = h / colors.length;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      transform: `rotate(${rotate}deg)`,
      animation: `bugg-drift-y ${applySpeed(3, speed)} ease-in-out ${delay}s infinite`,
      overflow: 'hidden',
    }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block' }}>
        {colors.map((c, i) => (
          <path
            key={i}
            d={`M 0,${h} A ${w - i * stripeH * 1.05},${h - i * stripeH * 1.05} 0 0 1 ${w},${h} L ${w - stripeH},${h} A ${w - i * stripeH * 1.05 - stripeH},${h - i * stripeH * 1.05 - stripeH} 0 0 0 ${stripeH},${h} L 0,${h} Z`}
            fill={c}
          />
        ))}
      </svg>
    </div>
  );
}

// ── 7. Squiggle line (the green M in Figma screen)
function Squiggle({ x = 0, y = 0, w = 110, h = 50, color = '#3eea84', strokeW = 14, speed = 1, delay = 0, rotate = 0 }) {
  const path = `M 5,${h/2} Q ${w*0.15},5 ${w*0.3},${h/2} T ${w*0.55},${h/2} T ${w*0.8},${h/2} T ${w-5},${h/2}`;
  return (
    <div style={{
      position: 'absolute', left: x, top: y, width: w, height: h,
      transform: `rotate(${rotate}deg)`,
      animation: `bugg-drift-x ${applySpeed(2.4, speed)} ease-in-out ${delay}s infinite, bugg-stretch ${applySpeed(2.6, speed)} ease-in-out ${delay}s infinite`,
    }}>
      <svg viewBox={`0 0 ${w} ${h}`} width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        <path d={path} stroke={color} strokeWidth={strokeW} strokeLinecap="round" fill="none" />
      </svg>
    </div>
  );
}

// ── 8. Checker square (small motif)
function Checker({ x = 0, y = 0, size = 50, color1 = '#fbbf24', color2 = '#ff5fa2', cells = 4, speed = 1, delay = 0, rotate = 0 }) {
  const cs = size / cells;
  const tiles = [];
  for (let r = 0; r < cells; r++) {
    for (let c = 0; c < cells; c++) {
      const fill = (r + c) % 2 === 0 ? color1 : color2;
      tiles.push(<rect key={`${r}-${c}`} x={c*cs} y={r*cs} width={cs} height={cs} fill={fill} />);
    }
  }
  return (
    <div style={{
      ...abs(x, y, size, rotate),
      animation: `bugg-drift-y ${applySpeed(3, speed)} ease-in-out ${delay}s infinite, bugg-wobble ${applySpeed(3.4, speed)} ease-in-out ${delay}s infinite`,
    }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ display: 'block' }}>
        {tiles}
      </svg>
    </div>
  );
}

// ── 9. Eye / drop (teardrop shape)
function Drop({ x = 0, y = 0, size = 60, color = '#1e3a8a', accent = '#fbbf24', speed = 1, delay = 0, rotate = 0 }) {
  return (
    <div style={{
      ...abs(x, y, size, rotate),
      animation: `bugg-drift-y ${applySpeed(2.6, speed)} ease-in-out ${delay}s infinite, bugg-wobble ${applySpeed(3, speed)} ease-in-out ${delay}s infinite`,
    }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <path d="M 50,5 C 70,30 90,50 90,65 A 40,40 0 1 1 10,65 C 10,50 30,30 50,5 Z" fill={color} />
        <circle cx="50" cy="65" r="14" fill={accent} />
      </svg>
    </div>
  );
}

// ── 10. Stack of layered shapes (like the green diamond + pink + scallop in figma screen)
function HeroStack({ x = 0, y = 0, palette, speed = 1 }) {
  const [diamond, pink, scallop] = palette;
  return (
    <div style={{ position: 'absolute', left: x, top: y, width: 240, height: 130 }}>
      <Diamond x={0} y={20} size={90} color={diamond} rotate={45} speed={speed} delay={0} />
      <Circle x={70} y={20} size={90} color={pink} speed={speed} delay={0.5} />
      <Scallop x={130} y={5} size={120} color={scallop} lobes={14} speed={speed * 0.4} delay={0.2} />
    </div>
  );
}

// ── 11. Decorative speech-bubble arrow / pin (the green-teardrop+blue-circle in figma screen)
function Pin({ x = 0, y = 0, size = 60, outer = '#1e3a8a', inner = '#3eea84', speed = 1, delay = 0, rotate = -10 }) {
  return (
    <div style={{
      ...abs(x, y, size, rotate),
      animation: `bugg-wobble ${applySpeed(2.2, speed)} ease-in-out ${delay}s infinite`,
    }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <path d="M 50,5 C 75,5 95,25 95,50 C 95,75 75,95 50,95 L 30,115 L 30,90 C 15,82 5,65 5,50 C 5,25 25,5 50,5 Z" fill={inner} />
        <circle cx="50" cy="48" r="14" fill={outer} />
      </svg>
    </div>
  );
}

Object.assign(window, {
  Blob, Diamond, Circle, Squircle, Scallop,
  ArcStripes, Squiggle, Checker, Drop, HeroStack, Pin,
});
