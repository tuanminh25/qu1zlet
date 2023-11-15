import {
  load,
  isPLayer,
} from './helper';

export function getChatMessages(playerId: number) {
  const data = load();
  const sessionId = isPLayer(playerId);
  const gameSession = data.gameSessions.find((g) => g.gameSessionId === sessionId);

  return {
    messages: gameSession.messages
  };
}
