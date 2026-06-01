// ─────────────────────────────────────────────
//  VIDEO TILE — Player video feed + info
// ─────────────────────────────────────────────
import React from 'react';

const AVATARS = ['🎴','🃏','♠','♥','♦','♣','🎲','🎯'];
const TEAM_COLORS = ['#1b4e8c', '#6b1a1a', '#1a5a1a', '#5a4a1a'];

export function VideoTile({ player, gamePlayer, isSelf, isCurrentTurn, speaking, size = 'md' }) {
  if (!player) return null;

  const sizes = {
    sm: { w: 80, h: 60, avatarSize: 28, fontSize: 9 },
    md: { w: 130, h: 100, avatarSize: 38, fontSize: 10 },
    lg: { w: 160, h: 120, avatarSize: 48, fontSize: 11 },
    strip: { w: 110, h: 40, avatarSize: 26, fontSize: 9, horizontal: true },
  };
  const s = sizes[size] || sizes.md;

  const borderColor = isSelf ? '#c9a84c'
    : isCurrentTurn ? '#4caf7a'
    : speaking ? '#4caf7a'
    : '#2a2a2a';
  const borderWidth = (isSelf || isCurrentTurn) ? 2 : 1;

  const initials = (player.name || '?').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

  if (s.horizontal) {
    return (
      <div style={{
        background: '#161616', borderRadius: 8, border: `${borderWidth}px solid ${borderColor}`,
        padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 8,
        width: s.w, minHeight: s.h, flexShrink: 0,
      }}>
        <div style={{
          width: s.avatarSize, height: s.avatarSize, borderRadius: '50%',
          background: TEAM_COLORS[gamePlayer?.team ?? 0] || '#1b4e8c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: s.avatarSize * 0.4, color: '#fff', fontWeight: 600, flexShrink: 0,
        }}>{initials}</div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: s.fontSize + 1, color: isSelf ? '#c9a84c' : '#ddd', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {player.name}{isSelf ? ' (You)' : ''}
          </div>
          {gamePlayer?.bid !== undefined && gamePlayer.bid !== null && (
            <div style={{ fontSize: s.fontSize, color: '#888' }}>Bid: {gamePlayer.nilBid ? 'Nil' : gamePlayer.bid}</div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#161616', borderRadius: 8, border: `${borderWidth}px solid ${borderColor}`,
      width: s.w, overflow: 'hidden', position: 'relative', flexShrink: 0,
    }}>
      {/* Simulated video area */}
      <div style={{ height: s.h * 0.65, background: '#0d0d0d', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{
          width: s.avatarSize, height: s.avatarSize, borderRadius: '50%',
          background: TEAM_COLORS[gamePlayer?.team ?? 0] || '#1b4e8c',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: s.avatarSize * 0.4, color: '#fff', fontWeight: 600,
        }}>{initials}</div>

        {/* Hand count badge */}
        {gamePlayer?.handCount !== undefined && (
          <div style={{
            position: 'absolute', top: 5, right: 5,
            background: 'rgba(0,0,0,0.7)', color: '#aaa', fontSize: 9,
            padding: '1px 5px', borderRadius: 4,
          }}>{gamePlayer.handCount} cards</div>
        )}

        {/* Turn indicator pulse */}
        {isCurrentTurn && (
          <div style={{
            position: 'absolute', inset: 0, border: '2px solid #4caf7a',
            borderRadius: 7, animation: 'pulse 1.2s infinite', pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Info bar */}
      <div style={{ padding: '4px 7px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: s.fontSize + 1, color: isSelf ? '#c9a84c' : '#ccc', fontWeight: 600, whiteSpace: 'nowrap', maxWidth: s.w - 30, overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {player.name}{isSelf ? ' ✦' : ''}
          </div>
          {gamePlayer && (
            <div style={{ fontSize: s.fontSize - 1, color: '#666', display: 'flex', gap: 6 }}>
              {gamePlayer.bid !== null && gamePlayer.bid !== undefined && (
                <span>Bid: {gamePlayer.nilBid ? 'NIL' : gamePlayer.bid}</span>
              )}
              {gamePlayer.tricks !== undefined && <span>Tricks: {gamePlayer.tricks}</span>}
              {gamePlayer.chips !== undefined && <span>Chips: {gamePlayer.chips}</span>}
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, color: player.micOn === false ? '#555' : '#4caf7a' }}>
          {player.micOn === false ? '🎙️' : '🎤'}
        </div>
      </div>
    </div>
  );
}

export default VideoTile;
