// ─────────────────────────────────────────────
//  GAME ROOM — Main gameplay view
// ─────────────────────────────────────────────
import React, { useEffect, useRef } from 'react';
import useGameStore from '../store';
import { PlayingCard } from './Card';
import { VideoTile } from './VideoTile';
import { SpadesActions, BidWhistActions, TonkActions, UnoActions, DominoesActions } from './GameActions';

const GAME_LABELS = {
  spades: 'Spades', bidwhist: 'Bid Whist', tonk: 'Tonk', uno: 'UNO', dominoes: 'Dominoes'
};

export function GameRoom() {
  const { room, gameState, mySeat, chatMessages, chatOpen, unreadCount,
    selectedCardIndex, selectedTileIndex, showScores, micOn, camOn,
    lastError, lastEvent,
    sendChat, toggleChat, toggleScores, toggleMic, toggleCam, selectCard, selectTile,
    clearEvent } = useGameStore();

  const chatEndRef = useRef(null);
  const [chatInput, setChatInput] = React.useState('');

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    if (lastEvent) {
      const t = setTimeout(() => clearEvent(), 4000);
      return () => clearTimeout(t);
    }
  }, [lastEvent]);

  if (!room || !gameState) {
    return (
      <div style={{ color: '#666', textAlign: 'center', padding: 40, fontSize: 14 }}>
        Waiting for game to start...
      </div>
    );
  }

  const players = room.players || [];
  const me = players[mySeat];
  const gameType = room.gameType;
  const myHand = gameState.myHand || [];
  const currentSeat = gameState.currentSeat;
  const phase = gameState.phase;

  // Arrange other players by seat relative to me
  // Seat order: opposite = mySeat+2, left = mySeat+1, right = mySeat+3 (for 4p)
  const otherSeats = players.length === 4
    ? [(mySeat + 2) % 4, (mySeat + 1) % 4, (mySeat + 3) % 4]
    : players.filter((_, i) => i !== mySeat).map(p => p.seat);

  const getPlayer = (seat) => players.find(p => p.seat === seat);
  const getGamePlayer = (seat) => gameState.players?.[seat];

  function handleCardClick(index) {
    if (gameType === 'dominoes') {
      selectTile(index === selectedTileIndex ? null : index);
    } else {
      selectCard(index === selectedCardIndex ? null : index);
    }
  }

  function renderActionsPanel() {
    const props = { gameState, mySeat };
    switch (gameType) {
      case 'spades':   return <SpadesActions {...props} />;
      case 'bidwhist': return <BidWhistActions {...props} />;
      case 'tonk':     return <TonkActions {...props} />;
      case 'uno':      return <UnoActions {...props} />;
      case 'dominoes': return <DominoesActions {...props} />;
      default: return null;
    }
  }

  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'DM Mono', 'Courier New', monospace" }}>

      {/* ── Top bar ──────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #1a1a1a', background: '#0a0a0a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 18, color: '#c9a84c', fontWeight: 700, letterSpacing: 2 }}>♠ BCR</span>
          <span style={{ background: '#1a1a1a', color: '#888', fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '1px solid #222' }}>
            {GAME_LABELS[gameType]}
          </span>
          <span style={{ background: '#0d2018', color: '#4caf7a', fontSize: 11, padding: '3px 8px', borderRadius: 4, border: '1px solid #1a4a2a' }}>
            ● Live • {players.length} players
          </span>
          <span style={{ background: '#1a1a1a', color: '#666', fontSize: 11, padding: '3px 8px', borderRadius: 4 }}>
            Room: {room.code}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { icon: showScores ? '📊' : '📊', action: toggleScores, active: showScores, label: 'Scores' },
            { icon: micOn ? '🎤' : '🔇', action: toggleMic, active: !micOn, label: 'Mic' },
            { icon: camOn ? '📹' : '📷', action: toggleCam, active: camOn, label: 'Cam' },
            { icon: '💬', action: toggleChat, active: chatOpen, badge: unreadCount, label: 'Chat' },
          ].map(({ icon, action, active, badge, label }) => (
            <button key={label} onClick={action} title={label} style={{
              background: active ? '#1f2f1f' : '#151515',
              border: `1px solid ${active ? '#2d5a2d' : '#252525'}`,
              borderRadius: 6, width: 34, height: 34, cursor: 'pointer',
              fontSize: 14, position: 'relative', color: '#fff',
            }}>
              {icon}
              {badge > 0 && (
                <span style={{ position: 'absolute', top: -4, right: -4, background: '#c0392b', color: '#fff', fontSize: 9, borderRadius: '50%', width: 14, height: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{badge}</span>
              )}
            </button>
          ))}
          <button style={{ background: '#2a0a0a', border: '1px solid #4a1a1a', borderRadius: 6, width: 34, height: 34, cursor: 'pointer', fontSize: 14 }}>📵</button>
        </div>
      </div>

      {/* ── Error toast ───────────────────────── */}
      {lastError && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#3a1f1f', border: '1px solid #5a2a2a', color: '#f07070', padding: '8px 16px', borderRadius: 8, fontSize: 12, zIndex: 1000 }}>
          ⚠️ {lastError}
        </div>
      )}

      {/* ── Event toast ───────────────────────── */}
      {lastEvent && lastEvent.type === 'game_over' && (
        <div style={{ position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)', background: '#1f3a1f', border: '1px solid #2d6a2d', color: '#4caf7a', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 1000, textAlign: 'center' }}>
          🏆 Game Over! Team {(lastEvent.winner ?? 0) + 1} wins!
        </div>
      )}

      {/* ── Main layout ───────────────────────── */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: chatOpen ? '1fr 220px' : '1fr', transition: 'grid-template-columns 0.2s', overflow: 'hidden' }}>

        {/* ── Game area ─────────────────────────── */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '12px 16px', gap: 10, minHeight: 0 }}>

          {/* Top player(s) */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            {players.length === 4 && (
              <VideoTile
                player={getPlayer(otherSeats[0])}
                gamePlayer={getGamePlayer(otherSeats[0])}
                isCurrentTurn={currentSeat === otherSeats[0]}
                size="strip"
              />
            )}
          </div>

          {/* Middle row: left player | felt table | right player */}
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minHeight: 0 }}>

            {/* Left player */}
            {players.length >= 3 && (
              <VideoTile
                player={getPlayer(otherSeats[1])}
                gamePlayer={getGamePlayer(otherSeats[1])}
                isCurrentTurn={currentSeat === otherSeats[1]}
                size="md"
              />
            )}

            {/* ── FELT TABLE ─────────────────────── */}
            <FeltTable gameState={gameState} gameType={gameType} mySeat={mySeat} players={players} />

            {/* Right player */}
            {players.length === 4 && (
              <VideoTile
                player={getPlayer(otherSeats[2])}
                gamePlayer={getGamePlayer(otherSeats[2])}
                isCurrentTurn={currentSeat === otherSeats[2]}
                size="md"
              />
            )}
          </div>

          {/* ── YOUR HAND ──────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            {/* Action panel */}
            <div style={{ padding: '8px 16px', background: '#111', borderRadius: 8, border: '1px solid #1a1a1a', minWidth: 320, maxWidth: 600, width: '100%' }}>
              {renderActionsPanel()}
            </div>

            {/* Hand */}
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 2 }}>
              {myHand.map((card, i) => (
                <PlayingCard
                  key={card.id ?? i}
                  card={card}
                  selected={gameType === 'dominoes' ? selectedTileIndex === i : selectedCardIndex === i}
                  onClick={() => handleCardClick(i)}
                  size="md"
                />
              ))}
            </div>

            {/* My video strip */}
            <VideoTile
              player={me}
              gamePlayer={getGamePlayer(mySeat)}
              isSelf
              isCurrentTurn={currentSeat === mySeat}
              size="strip"
            />
          </div>

          {/* Scores overlay */}
          {showScores && <ScoresPanel gameState={gameState} players={players} />}
        </div>

        {/* ── Chat panel ────────────────────────── */}
        {chatOpen && (
          <div style={{ borderLeft: '1px solid #1a1a1a', background: '#0a0a0a', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #1a1a1a', fontSize: 11, color: '#555' }}>💬 Table Chat</div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {chatMessages.map((msg, i) => (
                <div key={i}>
                  <span style={{ color: '#c9a84c', fontSize: 10, fontWeight: 600 }}>{msg.sender}: </span>
                  <span style={{ color: '#bbb', fontSize: 11 }}>{msg.message}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ padding: 8, borderTop: '1px solid #1a1a1a', display: 'flex', gap: 6 }}>
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && chatInput.trim()) { sendChat(chatInput); setChatInput(''); } }}
                placeholder="Say something..."
                style={{ flex: 1, background: '#151515', border: '1px solid #252525', borderRadius: 5, color: '#ccc', fontSize: 11, padding: '5px 8px', fontFamily: 'inherit' }}
              />
              <button onClick={() => { if (chatInput.trim()) { sendChat(chatInput); setChatInput(''); } }}
                style={{ background: '#1f3a28', border: '1px solid #2d6040', borderRadius: 5, color: '#4caf7a', padding: '5px 10px', cursor: 'pointer', fontSize: 12 }}>
                ➤
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
      `}</style>
    </div>
  );
}

// ── Felt Table ─────────────────────────────────
function FeltTable({ gameState, gameType, mySeat, players }) {
  const tricks = gameState?.currentTrick || [];
  const discard = gameState?.discard || [];
  const board = gameState?.board || [];
  const openEnds = gameState?.openEnds || [];
  const phase = gameState?.phase || '';

  const topCard = discard.length ? discard[discard.length - 1] : null;
  const currentColor = gameState?.currentColor;

  return (
    <div style={{
      flex: 1, minHeight: 200, maxHeight: 340,
      background: 'radial-gradient(ellipse at center, #1e5c38 0%, #174a2c 60%, #0f3320 100%)',
      borderRadius: '50%/35%',
      border: '8px solid #0a1f12',
      outline: '2px solid #1a3a22',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative',
      boxShadow: 'inset 0 0 40px rgba(0,0,0,0.4)',
    }}>
      {/* Table content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>

        {/* Phase indicator */}
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.35)', letterSpacing: 2, textTransform: 'uppercase' }}>
          {phase === 'bidding' ? '— Bidding —'
            : phase === 'playing' ? `Trick ${(gameState?.trickNumber || 0) + 1}`
            : phase === 'scoring' ? '— Round Over —'
            : phase === 'gameover' ? '— Game Over —'
            : phase}
        </div>

        {/* Cards on table */}
        {(gameType === 'spades' || gameType === 'bidwhist') && (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
            {tricks.length > 0 ? tricks.map((play, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <PlayingCard card={play.card} size="sm" />
                <div style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)' }}>
                  {players[play.seat]?.name?.split(' ')[0] || `P${play.seat}`}
                </div>
              </div>
            )) : (
              <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>— waiting for lead —</div>
            )}
          </div>
        )}

        {/* Tonk - discard pile */}
        {gameType === 'tonk' && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Discard</div>
              {topCard ? <PlayingCard card={topCard} size="sm" /> : <CardSlot />}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Deck ({gameState?.deck?.length || 0})</div>
              <PlayingCard card={{ hidden: true }} size="sm" />
            </div>
            {gameState?.pot > 0 && (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#c9a84c', marginBottom: 2 }}>POT</div>
                <div style={{ fontSize: 18, color: '#c9a84c', fontWeight: 700 }}>${gameState.pot}</div>
              </div>
            )}
          </div>
        )}

        {/* UNO - discard + color */}
        {gameType === 'uno' && (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Deck ({gameState?.deck?.length || 0})</div>
              <PlayingCard card={{ hidden: true }} size="md" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 3 }}>Discard</div>
              {topCard ? <PlayingCard card={topCard} size="md" /> : <CardSlot />}
            </div>
          </div>
        )}

        {/* Dominoes board */}
        {gameType === 'dominoes' && (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', marginBottom: 4 }}>
              {board.length} tiles played • Open ends: {openEnds.join(', ') || '—'}
            </div>
            <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 280 }}>
              {board.slice(-6).map((b, i) => (
                <PlayingCard key={i} card={b.tile} size="sm" />
              ))}
              {board.length === 0 && <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 11 }}>— play first tile —</div>}
            </div>
          </div>
        )}

        {/* Trump indicator for Bid Whist */}
        {gameType === 'bidwhist' && gameState?.trump && (
          <div style={{ fontSize: 11, color: '#c9a84c', background: 'rgba(0,0,0,0.3)', padding: '2px 10px', borderRadius: 10 }}>
            Trump: {{'S':'♠','H':'♥','D':'♦','C':'♣'}[gameState.trump]}
          </div>
        )}
      </div>
    </div>
  );
}

function CardSlot() {
  return (
    <div style={{ width: 42, height: 60, borderRadius: 6, border: '1px dashed rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 18 }}>+</span>
    </div>
  );
}

// ── Scores Panel ───────────────────────────────
function ScoresPanel({ gameState, players }) {
  const teams = gameState?.teams;
  return (
    <div style={{ position: 'absolute', top: 50, left: 16, background: '#111', border: '1px solid #222', borderRadius: 8, padding: '10px 14px', zIndex: 100, minWidth: 200 }}>
      <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}>SCORES</div>
      {teams?.map((t, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #1a1a1a' }}>
          <span style={{ fontSize: 11, color: '#ccc' }}>Team {i + 1}</span>
          <span style={{ fontSize: 14, color: '#c9a84c', fontWeight: 700 }}>{t.score}</span>
        </div>
      ))}
      {gameState?.scores?.map((score, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
          <span style={{ fontSize: 11, color: '#ccc' }}>{players[i]?.name || `P${i}`}</span>
          <span style={{ fontSize: 14, color: '#c9a84c', fontWeight: 700 }}>{score}</span>
        </div>
      ))}
    </div>
  );
}

export default GameRoom;
