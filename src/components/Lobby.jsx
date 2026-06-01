// ─────────────────────────────────────────────
//  LOBBY — Room creation, joining, waiting
// ─────────────────────────────────────────────
import React, { useState, useEffect } from 'react';
import useGameStore from '../store';

const GAMES = [
  { id: 'spades',   label: 'Spades',    icon: '♠', desc: '4 players • 2 teams • Classic bidding trick-taking', players: '2-4' },
  { id: 'bidwhist', label: 'Bid Whist', icon: '♦', desc: '4 players • 2 teams • Kitty, trump, uptown/downtown', players: '4' },
  { id: 'tonk',     label: 'Tonk',      icon: '🃏', desc: '2-4 players • Draw & discard • Knock to win', players: '2-4' },
  { id: 'uno',      label: 'UNO',       icon: '🎴', desc: '2-4 players • Match colors & values • Say UNO!', players: '2-4' },
  { id: 'dominoes', label: 'Dominoes',  icon: '🁣', desc: '2-4 players • Match tiles • Partner or solo', players: '2-4' },
];

const AVATARS = ['🎴','🃏','♠','♥','♦','♣','🎲','👑','🔥','💎'];

const INPUT = ({ value, onChange, placeholder, style }) => (
  <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ background: '#151515', border: '1px solid #252525', borderRadius: 6, color: '#eee', fontSize: 14, padding: '10px 14px', fontFamily: 'inherit', outline: 'none', width: '100%', ...style }}
  />
);

const BTN = ({ children, onClick, variant = 'default', disabled, full }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: variant === 'gold' ? '#2a1f08' : variant === 'primary' ? '#1f3a28' : '#1a1a1a',
    border: `1px solid ${variant === 'gold' ? '#c9a84c' : variant === 'primary' ? '#2d6040' : '#333'}`,
    color: variant === 'gold' ? '#c9a84c' : variant === 'primary' ? '#4caf7a' : '#bbb',
    padding: '10px 20px', borderRadius: 8, fontSize: 13, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1, width: full ? '100%' : 'auto', fontFamily: 'inherit',
    transition: 'all 0.12s', fontWeight: 600,
  }}>{children}</button>
);

export function Lobby() {
  const { playerName, avatar, room, mySeat, loading, lastError,
    setPlayerName, setAvatar, createRoom, joinRoom, setReady, connect } = useGameStore();

  const [screen, setScreen] = useState('home'); // home | create | join | waiting
  const [selectedGame, setSelectedGame] = useState('spades');
  const [joinCode, setJoinCode] = useState('');
  const [nameInput, setNameInput] = useState(playerName);

  useEffect(() => { connect(); }, []);
  useEffect(() => { if (room) setScreen('waiting'); }, [room]);

  async function handleCreate() {
    if (!nameInput.trim()) return;
    setPlayerName(nameInput.trim());
    const code = await createRoom(selectedGame);
    if (code) joinRoom(code);
  }

  function handleJoin() {
    if (!nameInput.trim() || !joinCode.trim()) return;
    setPlayerName(nameInput.trim());
    joinRoom(joinCode.trim());
  }

  // ── WAITING ROOM ────────────────────────────
  if (screen === 'waiting' && room) {
    const isHost = mySeat === 0;
    return (
      <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono','Courier New',monospace" }}>
        <div style={{ width: 460, background: '#111', border: '1px solid #1e1e1e', borderRadius: 16, padding: 32 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 28, color: '#c9a84c', fontWeight: 800, letterSpacing: 3 }}>BLACK CARD ROOM</div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
              {GAMES.find(g => g.id === room.gameType)?.label} · Room {room.code}
            </div>
          </div>

          {/* Room code */}
          <div style={{ background: '#0a0a0a', border: '1px solid #1f3a1f', borderRadius: 8, padding: '14px 20px', textAlign: 'center', marginBottom: 24 }}>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 4, letterSpacing: 2 }}>ROOM CODE</div>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#4caf7a', letterSpacing: 8 }}>{room.code}</div>
            <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>Share this with your players</div>
          </div>

          {/* Player list */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 10, letterSpacing: 2 }}>PLAYERS ({room.players?.length || 0} / {room.maxPlayers})</div>
            {room.players?.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', background: '#0d0d0d', borderRadius: 6, marginBottom: 4, border: `1px solid ${i === mySeat ? '#2a3a1a' : '#151515'}` }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: ['#1b4e8c','#6b1a1a','#1a5a1a','#5a4a1a'][i % 4], display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#fff', fontWeight: 600 }}>
                  {p.name?.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: i === mySeat ? '#c9a84c' : '#ddd' }}>{p.name}</span>
                  {i === 0 && <span style={{ fontSize: 9, color: '#666', marginLeft: 8 }}>HOST</span>}
                  {i % 2 === 0 && room.gameType !== 'tonk' && <span style={{ fontSize: 9, color: '#888', marginLeft: 8 }}>Team A</span>}
                  {i % 2 === 1 && room.gameType !== 'tonk' && <span style={{ fontSize: 9, color: '#888', marginLeft: 8 }}>Team B</span>}
                </div>
                <span style={{ fontSize: 12 }}>{p.ready ? '✅' : '⏳'}</span>
              </div>
            ))}
            {Array(Math.max(0, (room.maxPlayers || 4) - (room.players?.length || 0))).fill(0).map((_, i) => (
              <div key={`empty${i}`} style={{ padding: '8px 12px', background: '#0a0a0a', borderRadius: 6, marginBottom: 4, border: '1px dashed #1a1a1a', color: '#333', fontSize: 12, textAlign: 'center' }}>
                — waiting for player —
              </div>
            ))}
          </div>

          <BTN variant="primary" full disabled={room.players?.find(p => p.seat === mySeat)?.ready}
            onClick={setReady}>
            {room.players?.find(p => p.seat === mySeat)?.ready ? '✓ Ready!' : 'I\'m Ready'}
          </BTN>

          {lastError && <div style={{ marginTop: 10, color: '#f07070', fontSize: 11, textAlign: 'center' }}>⚠️ {lastError}</div>}
          <div style={{ marginTop: 12, fontSize: 10, color: '#444', textAlign: 'center' }}>
            {isHost ? 'Game starts when all players are ready' : 'Waiting for host to start...'}
          </div>
        </div>
      </div>
    );
  }

  // ── HOME ─────────────────────────────────────
  return (
    <div style={{ background: '#0d0d0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono','Courier New',monospace" }}>
      <div style={{ width: 500, padding: 20 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontSize: 11, color: '#555', letterSpacing: 6, marginBottom: 8 }}>WELCOME TO</div>
          <div style={{ fontSize: 42, color: '#c9a84c', fontWeight: 900, letterSpacing: 4, lineHeight: 1 }}>BLACK<br/>CARD ROOM</div>
          <div style={{ fontSize: 11, color: '#444', marginTop: 10, letterSpacing: 2 }}>
            SPADES · BID WHIST · TONK · UNO · DOMINOES
          </div>
        </div>

        {screen === 'home' && (
          <>
            {/* Name + avatar */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 8, letterSpacing: 2 }}>YOUR NAME</div>
              <INPUT value={nameInput} onChange={setNameInput} placeholder="Enter your name..." />
            </div>
            <div style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 10, color: '#555', marginBottom: 8, letterSpacing: 2 }}>AVATAR</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {AVATARS.map(a => (
                  <button key={a} onClick={() => setAvatar(a)} style={{ width: 38, height: 38, background: avatar === a ? '#2a1f08' : '#151515', border: `1px solid ${avatar === a ? '#c9a84c' : '#222'}`, borderRadius: 8, fontSize: 18, cursor: 'pointer' }}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <BTN variant="gold" full onClick={() => setScreen('create')} disabled={!nameInput.trim()}>
                Create Room
              </BTN>
              <BTN variant="primary" full onClick={() => setScreen('join')} disabled={!nameInput.trim()}>
                Join Room
              </BTN>
            </div>
          </>
        )}

        {screen === 'create' && (
          <>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 12, letterSpacing: 2 }}>SELECT GAME</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
              {GAMES.map(g => (
                <div key={g.id} onClick={() => setSelectedGame(g.id)} style={{
                  padding: '12px 16px', background: selectedGame === g.id ? '#1a2a12' : '#111',
                  border: `1px solid ${selectedGame === g.id ? '#2d6a2d' : '#1e1e1e'}`,
                  borderRadius: 8, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'center',
                  transition: 'all 0.1s',
                }}>
                  <span style={{ fontSize: 28 }}>{g.icon}</span>
                  <div>
                    <div style={{ fontSize: 14, color: selectedGame === g.id ? '#4caf7a' : '#ccc', fontWeight: 600 }}>{g.label}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 2 }}>{g.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <BTN onClick={() => setScreen('home')}>← Back</BTN>
              <BTN variant="gold" full onClick={handleCreate} disabled={loading || !nameInput.trim()}>
                {loading ? 'Creating...' : 'Create Room →'}
              </BTN>
            </div>
          </>
        )}

        {screen === 'join' && (
          <>
            <div style={{ fontSize: 10, color: '#555', marginBottom: 8, letterSpacing: 2 }}>ROOM CODE</div>
            <INPUT value={joinCode} onChange={setJoinCode} placeholder="Enter 6-letter code..." style={{ marginBottom: 20, textTransform: 'uppercase', letterSpacing: 4, fontSize: 20, textAlign: 'center' }} />
            <div style={{ display: 'flex', gap: 10 }}>
              <BTN onClick={() => setScreen('home')}>← Back</BTN>
              <BTN variant="primary" full onClick={handleJoin} disabled={!joinCode.trim() || !nameInput.trim()}>
                Join Game →
              </BTN>
            </div>
            {lastError && <div style={{ marginTop: 12, color: '#f07070', fontSize: 11, textAlign: 'center' }}>⚠️ {lastError}</div>}
          </>
        )}
      </div>
    </div>
  );
}

export default Lobby;
