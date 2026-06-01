// ─────────────────────────────────────────────
//  CARD COMPONENT
// ─────────────────────────────────────────────
import React from 'react';

const SUIT_SYMBOLS = { S: '♠', H: '♥', D: '♦', C: '♣' };
const SUIT_COLORS = { S: '#1a1a2e', H: '#8b1a1a', D: '#8b1a1a', C: '#1a1a2e' };

// UNO color map
const UNO_COLORS = { R: '#c0392b', G: '#27ae60', B: '#2471a3', Y: '#d4ac0d', W: '#555' };
const UNO_COLOR_NAMES = { R: 'Red', G: 'Green', B: 'Blue', Y: 'Yellow', W: 'Wild' };

export function PlayingCard({ card, selected, onClick, faceDown, size = 'md', glowing }) {
  const sizes = {
    sm: { w: 42, h: 60, font: 12, pip: 16 },
    md: { w: 54, h: 78, font: 14, pip: 20 },
    lg: { w: 70, h: 100, font: 17, pip: 26 },
    xl: { w: 90, h: 130, font: 21, pip: 32 },
  };
  const s = sizes[size] || sizes.md;

  const cardStyle = {
    width: s.w, height: s.h,
    borderRadius: 6,
    border: selected ? '2.5px solid #c9a84c' : '1px solid #ccc',
    cursor: onClick ? 'pointer' : 'default',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '3px 4px',
    userSelect: 'none',
    transition: 'transform 0.12s, box-shadow 0.12s',
    transform: selected ? 'translateY(-12px)' : 'translateY(0)',
    position: 'relative',
    flexShrink: 0,
    background: faceDown ? 'linear-gradient(135deg, #1b4e8c 0%, #0d2a4a 100%)' : '#faf6ee',
    boxShadow: glowing ? '0 0 10px rgba(201,168,76,0.6)' : 'none',
  };

  if (faceDown || card?.hidden) {
    return (
      <div style={cardStyle} onClick={onClick}>
        <div style={{
          position: 'absolute', inset: 3, borderRadius: 4,
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 8px)',
        }} />
      </div>
    );
  }

  // UNO card
  if (card?.color !== undefined && ['R','G','B','Y','W'].includes(card.color)) {
    return <UnoCard card={card} selected={selected} onClick={onClick} size={s} />;
  }

  // Domino tile
  if (card?.high !== undefined) {
    return <DominoTile tile={card} selected={selected} onClick={onClick} size={s} />;
  }

  // Standard playing card
  const suit = card?.suit || 'S';
  const rank = card?.rank || '?';
  const color = SUIT_COLORS[suit] || '#1a1a2e';
  const symbol = SUIT_SYMBOLS[suit] || '';

  return (
    <div style={cardStyle} onClick={onClick}>
      <div style={{ fontSize: s.font, fontWeight: 700, color, lineHeight: 1, fontFamily: 'Georgia, serif' }}>
        {rank}
      </div>
      <div style={{ fontSize: s.pip, color, lineHeight: 1 }}>{symbol}</div>
      <div style={{ fontSize: s.font, fontWeight: 700, color, lineHeight: 1, transform: 'rotate(180deg)', fontFamily: 'Georgia, serif' }}>
        {rank}
      </div>
    </div>
  );
}

function UnoCard({ card, selected, onClick, size }) {
  const bg = UNO_COLORS[card.color] || '#555';
  const label = card.value === 'Wild' ? 'W' : card.value === 'Wild4' ? '+4' :
    card.value === 'Draw2' ? '+2' : card.value === 'Skip' ? '⊘' :
    card.value === 'Reverse' ? '⇄' : card.value;

  return (
    <div style={{
      width: size.w, height: size.h, borderRadius: 6,
      background: bg, border: selected ? '2.5px solid #c9a84c' : '1.5px solid rgba(255,255,255,0.3)',
      cursor: onClick ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transform: selected ? 'translateY(-12px)' : 'none',
      transition: 'transform 0.12s',
      flexShrink: 0, position: 'relative',
    }} onClick={onClick}>
      <div style={{
        width: '70%', height: '70%', borderRadius: '50%', background: 'rgba(255,255,255,0.15)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: size.font + 2, fontWeight: 700, color: '#fff', fontFamily: 'Georgia, serif',
      }}>{label}</div>
    </div>
  );
}

function DominoTile({ tile, selected, onClick, size }) {
  return (
    <div style={{
      width: size.w * 1.6, height: size.h * 0.7,
      borderRadius: 4, background: '#1a1a1a',
      border: selected ? '2.5px solid #c9a84c' : '1px solid #555',
      cursor: onClick ? 'pointer' : 'default',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: 4, flexShrink: 0, padding: '0 6px',
      transform: selected ? 'translateY(-8px)' : 'none',
      transition: 'transform 0.12s',
    }} onClick={onClick}>
      <Pips value={tile.high} size={size.font} />
      <div style={{ width: 1, height: '60%', background: '#555' }} />
      <Pips value={tile.low} size={size.font} />
    </div>
  );
}

function Pips({ value, size }) {
  const dots = Array(value).fill(0);
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, padding: 2 }}>
      {dots.map((_, i) => (
        <div key={i} style={{ width: size * 0.4, height: size * 0.4, borderRadius: '50%', background: '#fff' }} />
      ))}
      {Array(Math.max(0, 9 - value)).fill(0).map((_, i) => (
        <div key={`e${i}`} style={{ width: size * 0.4, height: size * 0.4 }} />
      ))}
    </div>
  );
}

export function CardBack({ size = 'md' }) {
  return <PlayingCard card={{ hidden: true }} faceDown size={size} />;
}

export default PlayingCard;
