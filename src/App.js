// ─────────────────────────────────────────────
//  APP ROOT
// ─────────────────────────────────────────────
import React, { useEffect } from 'react';
import useGameStore from './store';
import { Lobby } from './components/Lobby';
import { GameRoom } from './components/GameRoom';

function App() {
  const { room, gameState, connect } = useGameStore();
  useEffect(() => { connect(); }, []);

  const inGame = room && gameState && room.phase === 'playing';

  return (
    <div style={{ margin: 0, padding: 0, background: '#0d0d0d', minHeight: '100vh', fontFamily: "'DM Mono','Courier New',monospace" }}>
      {inGame ? <GameRoom /> : <Lobby />}
    </div>
  );
}

export default App;
