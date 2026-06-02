// ─────────────────────────────────────────────
//  GLOBAL GAME STORE (Zustand)
// ─────────────────────────────────────────────
import { create } from 'zustand';
import { io } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const SERVER_URL = 'https://blackcardroom-server-production.up.railway.app';

const useGameStore = create((set, get) => ({
  // ── Connection ─────────────────────────────
  socket: null,
  connected: false,

  // ── Player identity ────────────────────────
  userId: localStorage.getItem('bcr_userId') || (() => {
    const id = uuidv4(); localStorage.setItem('bcr_userId', id); return id;
  })(),
  playerName: localStorage.getItem('bcr_name') || '',
  avatar: localStorage.getItem('bcr_avatar') || '🃏',

  // ── Room state ─────────────────────────────
  room: null,
  mySeat: null,

  // ── Game state ─────────────────────────────
  gameState: null,
  lastError: null,
  lastEvent: null,

  // ── Chat ───────────────────────────────────
  chatMessages: [],
  chatOpen: false,
  unreadCount: 0,

  // ── UI ─────────────────────────────────────
  selectedCardIndex: null,
  selectedTileIndex: null,
  showScores: false,
  micOn: true,
  camOn: false,
  loading: false,

  // ── Actions ────────────────────────────────
  setPlayerName: (name) => {
    localStorage.setItem('bcr_name', name);
    set({ playerName: name });
  },

  setAvatar: (avatar) => {
    localStorage.setItem('bcr_avatar', avatar);
    set({ avatar });
  },

  connect: () => {
    const existing = get().socket;
    if (existing?.connected) return;

    const socket = io(SERVER_URL, { withCredentials: true, reconnectionDelay: 1000 });

    socket.on('connect', () => {
      set({ connected: true });
      console.log('[Socket] Connected');
    });
    socket.on('disconnect', () => set({ connected: false }));

    socket.on('room_joined', ({ room, seat }) => {
      set({ room, mySeat: seat });
    });
    socket.on('room_updated', (room) => set({ room }));

    socket.on('game_started', () => {
      set({ lastEvent: { type: 'game_started', ts: Date.now() } });
    });

    socket.on('game_state', (state) => {
      set({ gameState: state, selectedCardIndex: null, selectedTileIndex: null });
    });

    socket.on('game_error', ({ message }) => {
      set({ lastError: message });
      setTimeout(() => set({ lastError: null }), 3000);
    });

    socket.on('game_event', (event) => {
      set({ lastEvent: { ...event, ts: Date.now() } });
    });

    socket.on('chat_message', (msg) => {
      set(state => ({
        chatMessages: [...state.chatMessages.slice(-99), msg],
        unreadCount: state.chatOpen ? 0 : state.unreadCount + 1,
      }));
    });

    socket.on('player_disconnected', ({ name }) => {
      set({ lastEvent: { type: 'disconnect', name, ts: Date.now() } });
    });

    socket.on('error', ({ message }) => set({ lastError: message }));

    set({ socket });
  },

  createRoom: async (gameType) => {
    const { playerName } = get();
    set({ loading: true });
    try {
      const res = await fetch(`${SERVER_URL}/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostName: playerName, gameType }),
        credentials: 'include',
      });
      const data = await res.json();
      set({ loading: false });
      return data.code;
    } catch (e) {
      set({ loading: false, lastError: 'Failed to create room' });
      return null;
    }
  },

  joinRoom: (code) => {
    const { socket, userId, playerName, avatar } = get();
    if (!socket) return;
    socket.emit('join_room', { code, userId, name: playerName, avatar });
  },

  setReady: () => {
    const { socket } = get();
    socket?.emit('player_ready');
  },

  sendGameAction: (action, payload = {}) => {
    const { socket } = get();
    socket?.emit('game_action', { action, payload });
  },

  sendChat: (message) => {
    const { socket } = get();
    socket?.emit('chat_message', { message });
  },

  hostStartGame: () => {
    const { socket } = get();
    socket?.emit('host_start_game');
  },

  startNewRound: () => {
    const { socket } = get();
    socket?.emit('start_round');
  },

  selectCard: (index) => set({ selectedCardIndex: index }),
  selectTile: (index) => set({ selectedTileIndex: index }),
  toggleChat: () => set(s => ({ chatOpen: !s.chatOpen, unreadCount: 0 })),
  toggleScores: () => set(s => ({ showScores: !s.showScores })),
  toggleMic: () => set(s => ({ micOn: !s.micOn })),
  toggleCam: () => set(s => ({ camOn: !s.camOn })),
  clearError: () => set({ lastError: null }),
  clearEvent: () => set({ lastEvent: null }),
}));

export default useGameStore;
