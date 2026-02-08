# Host.tsx and related socket listeners (paste)

**Host.tsx** has `game:created` and `game:trivia-state`. **join:ok** is in **Play.tsx**, **display:ok** in **Display.tsx**. All are for the old code-based flow (`game.code` / `join/:code` / `display/:code`).

---

## Host.tsx — game:created

```tsx
// frontend/src/pages/Host.tsx (inside useEffect)
s.on('game:created', (payload: GameCreated) => {
  if (createTimeoutRef.current) clearTimeout(createTimeoutRef.current);
  createTimeoutRef.current = null;
  setCreatePending(false);
  setCreateError(null);
  setGameStarted(false);
  setGame(payload);
  setHostMessage(payload.waitingRoom?.hostMessage || 'Starting soon…');
  setWaitingRoomTheme(payload.waitingRoom?.theme || 'default');
  const songsFromServer = Array.isArray(payload.songPool) ? payload.songPool : [];
  setSongPool(songsFromServer);
  setRevealed(Array.isArray(payload.revealed) ? payload.revealed : []);
  if (payload.eventConfig && typeof payload.eventConfig === 'object') {
    setEventConfigState((prev) => ({ ...prev, ...payload.eventConfig }));
  }
  if (payload.trivia?.questions?.length) {
    setTriviaQuestions(payload.trivia.questions);
  } else {
    setTriviaQuestions([]);
  }
  if (payload.gameType === 'music-bingo' && prebuiltSongsRef.current && prebuiltSongsRef.current.length >= 24) {
    s.emit('host:set-songs', { code: payload.code, songs: prebuiltSongsRef.current });
    setSongPool(prebuiltSongsRef.current);
    prebuiltSongsRef.current = null;
  }
});
```

---

## Host.tsx — game:trivia-state

```tsx
// frontend/src/pages/Host.tsx (inside same useEffect)
s.on('game:trivia-state', (payload: { questions?: TriviaQuestion[]; currentIndex?: number; revealed?: boolean }) => {
  if (Array.isArray(payload.questions)) setTriviaQuestions(payload.questions);
  if (typeof payload.currentIndex === 'number') setTriviaCurrentIndex(payload.currentIndex);
  if (typeof payload.revealed === 'boolean') setTriviaRevealed(payload.revealed);
});
```

---

## Host.tsx — cleanup (off)

```tsx
return () => {
  s.off('connect');
  s.off('disconnect');
  s.off('game:created');
  s.off('game:started');
  s.off('game:event-config-updated');
  s.off('game:waiting-room-updated');
  s.off('game:songs-updated');
  s.off('game:revealed');
  s.off('game:trivia-state');
  s.off('game:trivia-reveal');
};
```

---

## Play.tsx — join:ok

```tsx
// frontend/src/pages/Play.tsx
s.on('join:ok', (payload: JoinState) => {
  setJoinState(payload);
  setJoined(true);
  setRejoining(false);
  setError('');
});
```

---

## Play.tsx — game:trivia-state

```tsx
// frontend/src/pages/Play.tsx
s.on('game:trivia-state', (payload: { currentIndex?: number; questions?: { question: string; correctAnswer?: string }[]; revealed?: boolean }) => {
  if (!payload || typeof payload !== 'object') return;
  setJoinState((prev) => {
    if (!prev) return null;
    const trivia = {
      currentIndex: payload.currentIndex ?? prev.trivia?.currentIndex ?? 0,
      questions: payload.questions ?? prev.trivia?.questions ?? [],
      revealed: payload.revealed ?? prev.trivia?.revealed,
    };
    return { ...prev, trivia };
  });
});
```

---

## Display.tsx — display:ok (once)

```tsx
// frontend/src/pages/Display.tsx
s.once('display:ok', (payload: { joinUrl?: string; songPool?: Song[]; revealed?: Song[]; eventConfig?: DisplayEventConfig; started?: boolean; gameType?: string; trivia?: { currentIndex: number; questions: { question: string; options?: string[]; correctIndex?: number }[]; revealed?: boolean } }) => {
  setJoinUrl(payload.joinUrl || `${window.location.origin}/join/${code}`);
  setSongPool(Array.isArray(payload.songPool) ? payload.songPool : []);
  setRevealed(Array.isArray(payload.revealed) ? payload.revealed : []);
  setEventTitle(payload.eventConfig?.gameTitle);
  setEventConfig(payload.eventConfig && typeof payload.eventConfig === 'object' ? payload.eventConfig : null);
  setStarted(payload.started === true);
  setGameType(payload.gameType || 'music-bingo');
  setTriviaState(payload.trivia && typeof payload.trivia === 'object' ? { currentIndex: payload.trivia.currentIndex ?? 0, questions: payload.trivia.questions ?? [], revealed: (payload.trivia as { revealed?: boolean }).revealed } : null);
  setError(null);
});
```

---

## Display.tsx — game:trivia-state

```tsx
// frontend/src/pages/Display.tsx
s.on('game:trivia-state', (payload: { currentIndex?: number; questions?: { question: string; options?: string[]; correctIndex?: number }[]; revealed?: boolean }) => {
  if (payload && typeof payload === 'object') {
    setTriviaState((prev) => ({
      currentIndex: payload.currentIndex ?? prev?.currentIndex ?? 0,
      questions: payload.questions ?? prev?.questions ?? [],
      revealed: payload.revealed ?? prev?.revealed,
    }));
  }
});
```
