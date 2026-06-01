// ─────────────────────────────────────────────
//  GAME ACTION PANELS — per-game controls
// ─────────────────────────────────────────────
import React, { useState } from 'react';
import useGameStore from '../store';

const BTN = ({ children, onClick, variant = 'default', disabled }) => (
  <button onClick={onClick} disabled={disabled} style={{
    background: variant === 'primary' ? '#1f3a28' : variant === 'danger' ? '#3a1f1f' : variant === 'gold' ? '#3a2f10' : '#1a1a1a',
    border: `1px solid ${variant === 'primary' ? '#2d6040' : variant === 'danger' ? '#5a2a2a' : variant === 'gold' ? '#c9a84c' : '#333'}`,
    color: variant === 'primary' ? '#4caf7a' : variant === 'danger' ? '#f07070' : variant === 'gold' ? '#c9a84c' : '#bbb',
    padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1, transition: 'all 0.12s', fontFamily: 'inherit',
  }}>{children}</button>
);

// ── SPADES ────────────────────────────────────
export function SpadesActions({ gameState, mySeat }) {
  const sendGameAction = useGameStore(s => s.sendGameAction);
  const selectedCardIndex = useGameStore(s => s.selectedCardIndex);
  const selectCard = useGameStore(s => s.selectCard);
  const me = gameState?.players?.[mySeat];
  const isMyTurn = gameState?.currentSeat === mySeat;
  const phase = gameState?.phase;

  if (phase === 'bidding' && isMyTurn) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        <div style={{ width: '100%', textAlign: 'center', fontSize: 12, color: '#888', marginBottom: 4 }}>Your bid:</div>
        {[1,2,3,4,5,6,7,8,9,10,11,12,13].map(n => (
          <BTN key={n} onClick={() => sendGameAction('bid', { bid: n })}>{n}</BTN>
        ))}
        <BTN onClick={() => sendGameAction('bid', { bid: 'nil' })} variant="gold">Nil</BTN>
        <BTN onClick={() => sendGameAction('bid', { bid: 'blindnil' })} variant="danger">Blind Nil</BTN>
      </div>
    );
  }

  if (phase === 'playing' && isMyTurn) {
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', alignItems: 'center' }}>
        <BTN variant="primary" disabled={selectedCardIndex === null}
          onClick={() => { sendGameAction('play_card', { cardIndex: selectedCardIndex }); selectCard(null); }}>
          Play card
        </BTN>
        {selectedCardIndex !== null && (
          <BTN onClick={() => selectCard(null)}>Deselect</BTN>
        )}
        {!isMyTurn && <div style={{ fontSize: 12, color: '#555' }}>Waiting for your turn...</div>}
      </div>
    );
  }

  if (phase === 'scoring' || phase === 'gameover') {
    return <RoundSummary gameState={gameState} />;
  }

  return <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>Waiting...</div>;
}

// ── BID WHIST ─────────────────────────────────
export function BidWhistActions({ gameState, mySeat }) {
  const sendGameAction = useGameStore(s => s.sendGameAction);
  const selectedCardIndex = useGameStore(s => s.selectedCardIndex);
  const selectCard = useGameStore(s => s.selectCard);
  const [kittySelections, setKittySelections] = useState([]);
  const [trumpChoice, setTrumpChoice] = useState(null);
  const isMyTurn = gameState?.currentSeat === mySeat;
  const isHighBidder = gameState?.highBidder === mySeat;
  const phase = gameState?.phase;

  if (phase === 'bidding' && isMyTurn) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
        {[3,4,5,6,7].map(n => (
          <React.Fragment key={n}>
            <BTN onClick={() => sendGameAction('bid', { bid: { level: n, direction: 'uptown' } })}>{n}↑</BTN>
            <BTN onClick={() => sendGameAction('bid', { bid: { level: n, direction: 'downtown' } })}>{n}↓</BTN>
          </React.Fragment>
        ))}
        <BTN variant="gold" onClick={() => sendGameAction('bid', { bid: { level: 7, noTrump: true } })}>No Trump</BTN>
        <BTN variant="danger" onClick={() => sendGameAction('bid', { bid: 'pass' })}>Pass</BTN>
      </div>
    );
  }

  if (phase === 'kitty' && isHighBidder) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 12, color: '#888', marginBottom: 6 }}>Select 6 cards to discard (you'll pick up the kitty)</div>
        <BTN variant="primary" onClick={() => sendGameAction('take_kitty', { discardIndices: kittySelections })}>
          Take Kitty & Discard {kittySelections.length}/6
        </BTN>
      </div>
    );
  }

  if (phase === 'trump' && isHighBidder) {
    return (
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        <div style={{ width: '100%', textAlign: 'center', fontSize: 12, color: '#888' }}>Choose trump suit:</div>
        {[['S','♠'],['H','♥'],['D','♦'],['C','♣']].map(([s, sym]) => (
          <BTN key={s} variant={trumpChoice === s ? 'primary' : 'default'}
            onClick={() => { setTrumpChoice(s); sendGameAction('set_trump', { suit: s }); }}>
            {sym} {s === 'H' || s === 'D' ? <span style={{ color: '#c00' }}>{sym}</span> : sym}
          </BTN>
        ))}
      </div>
    );
  }

  if (phase === 'playing' && isMyTurn) {
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        <BTN variant="primary" disabled={selectedCardIndex === null}
          onClick={() => { sendGameAction('play_card', { cardIndex: selectedCardIndex }); selectCard(null); }}>
          Play Card
        </BTN>
      </div>
    );
  }

  if (phase === 'scoring' || phase === 'gameover') return <RoundSummary gameState={gameState} />;
  return <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>Waiting...</div>;
}

// ── TONK ─────────────────────────────────────
export function TonkActions({ gameState, mySeat }) {
  const sendGameAction = useGameStore(s => s.sendGameAction);
  const selectedCardIndex = useGameStore(s => s.selectedCardIndex);
  const selectCard = useGameStore(s => s.selectCard);
  const isMyTurn = gameState?.currentSeat === mySeat;
  const drew = gameState?.drewThisTurn;
  const phase = gameState?.phase;

  if (phase !== 'playing' || !isMyTurn) {
    if (phase === 'gameover') return <RoundSummary gameState={gameState} />;
    return <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
      {isMyTurn ? 'Your turn' : 'Waiting for opponent...'}
    </div>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
      {!drew && <>
        <BTN variant="primary" onClick={() => sendGameAction('draw_deck')}>Draw from deck</BTN>
        <BTN variant="default" onClick={() => sendGameAction('draw_discard')}>Pick up discard</BTN>
      </>}
      {drew && <>
        <BTN variant="primary" disabled={selectedCardIndex === null}
          onClick={() => { sendGameAction('discard', { cardIndex: selectedCardIndex }); selectCard(null); }}>
          Discard
        </BTN>
        <BTN variant="gold" onClick={() => sendGameAction('knock')}>Knock</BTN>
        {selectedCardIndex !== null && (
          <BTN variant="default" onClick={() => sendGameAction('spread', { cardIndices: [selectedCardIndex] })}>
            Spread
          </BTN>
        )}
      </>}
    </div>
  );
}

// ── UNO ──────────────────────────────────────
export function UnoActions({ gameState, mySeat }) {
  const sendGameAction = useGameStore(s => s.sendGameAction);
  const selectedCardIndex = useGameStore(s => s.selectedCardIndex);
  const selectCard = useGameStore(s => s.selectCard);
  const [colorPicking, setColorPicking] = useState(false);
  const isMyTurn = gameState?.currentSeat === mySeat;
  const phase = gameState?.phase;
  const myHand = gameState?.myHand || [];
  const selectedCard = selectedCardIndex !== null ? myHand[selectedCardIndex] : null;
  const needsColor = selectedCard?.color === 'W';

  if (phase === 'scoring' || phase === 'gameover') return <RoundSummary gameState={gameState} />;
  if (!isMyTurn) {
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
        {gameState?.players?.[gameState?.currentSeat]?.handCount === 1 && (
          <BTN variant="danger" onClick={() => sendGameAction('catch_uno', { targetSeat: gameState.currentSeat })}>
            Catch UNO! 🔔
          </BTN>
        )}
      </div>
    );
  }

  if (colorPicking) {
    return (
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
        <div style={{ width: '100%', textAlign: 'center', fontSize: 12, color: '#888' }}>Choose a color:</div>
        {[['R','Red','#c0392b'],['G','Green','#27ae60'],['B','Blue','#2471a3'],['Y','Yellow','#d4ac0d']].map(([code, name, color]) => (
          <button key={code} onClick={() => {
            sendGameAction('play_card', { cardIndex: selectedCardIndex, chosenColor: code });
            selectCard(null); setColorPicking(false);
          }} style={{ background: color, border: 'none', borderRadius: 8, padding: '8px 16px', color: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
            {name}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      <BTN variant="primary" disabled={selectedCardIndex === null}
        onClick={() => {
          if (needsColor) { setColorPicking(true); return; }
          sendGameAction('play_card', { cardIndex: selectedCardIndex }); selectCard(null);
        }}>
        {needsColor ? 'Choose Color' : 'Play Card'}
      </BTN>
      <BTN onClick={() => sendGameAction('draw_card')}>Draw</BTN>
      {myHand.length === 1 && (
        <BTN variant="gold" onClick={() => sendGameAction('say_uno')}>UNO! 🎉</BTN>
      )}
    </div>
  );
}

// ── DOMINOES ─────────────────────────────────
export function DominoesActions({ gameState, mySeat }) {
  const sendGameAction = useGameStore(s => s.sendGameAction);
  const selectedTileIndex = useGameStore(s => s.selectedTileIndex);
  const selectTile = useGameStore(s => s.selectTile);
  const isMyTurn = gameState?.currentSeat === mySeat;
  const phase = gameState?.phase;
  const hasBoard = gameState?.board?.length > 0;

  if (phase === 'scoring' || phase === 'gameover') return <RoundSummary gameState={gameState} />;
  if (!isMyTurn) return <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>Waiting for opponent...</div>;

  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
      {!hasBoard ? (
        <BTN variant="primary" disabled={selectedTileIndex === null}
          onClick={() => { sendGameAction('play_tile', { tileIndex: selectedTileIndex, end: 'left' }); selectTile(null); }}>
          Play first tile
        </BTN>
      ) : (
        <>
          <BTN variant="primary" disabled={selectedTileIndex === null}
            onClick={() => { sendGameAction('play_tile', { tileIndex: selectedTileIndex, end: 'left' }); selectTile(null); }}>
            Play Left
          </BTN>
          <BTN variant="primary" disabled={selectedTileIndex === null}
            onClick={() => { sendGameAction('play_tile', { tileIndex: selectedTileIndex, end: 'right' }); selectTile(null); }}>
            Play Right
          </BTN>
        </>
      )}
      <BTN onClick={() => sendGameAction('draw')}>Draw from boneyard</BTN>
      <BTN variant="danger" onClick={() => sendGameAction('pass')}>Pass</BTN>
    </div>
  );
}

// ── ROUND SUMMARY ─────────────────────────────
function RoundSummary({ gameState }) {
  const startNewRound = useGameStore(s => s.startNewRound);
  const mySeat = useGameStore(s => s.mySeat);
  const isOver = gameState?.phase === 'gameover';

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ color: '#c9a84c', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
        {isOver ? '🏆 Game Over!' : '📊 Round Over'}
      </div>
      {gameState?.teams && (
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 12 }}>
          {gameState.teams.map((t, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 10, color: '#888' }}>Team {i + 1}</div>
              <div style={{ fontSize: 18, color: '#fff', fontWeight: 700 }}>{t.score}</div>
              {t.bags !== undefined && <div style={{ fontSize: 9, color: '#666' }}>{t.bags} bags</div>}
            </div>
          ))}
        </div>
      )}
      {!isOver && mySeat === 0 && (
        <BTN variant="primary" onClick={startNewRound}>Deal Next Round</BTN>
      )}
      {!isOver && mySeat !== 0 && (
        <div style={{ fontSize: 11, color: '#555' }}>Waiting for host to deal...</div>
      )}
    </div>
  );
}
