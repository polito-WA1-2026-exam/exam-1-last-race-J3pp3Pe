import React, { createContext, useState } from 'react';
import { Game, GameResult } from '../models/GameModels.js';
import * as gameApi from '../api/api.js';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [currentGame, setCurrentGame] = useState(null);
  const [network, setNetwork] = useState(null);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadNetwork = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await gameApi.getNetwork();
      setNetwork(data);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const startGame = async () => {
    try {
      setError(null);
      setLoading(true);
      const gameData = await gameApi.startNewGame();
      const game = new Game(
        gameData.gameId,
        gameData.startStation,
        gameData.destinationStation,
        gameData.initialCoins,
        gameData.timeLimit
      );
      setCurrentGame(game);
      return game;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const playGame = async (segments, gameId = null) => {
    try {
      setError(null);
      setLoading(true);
      const id = gameId || currentGame?.gameId;
      if (!id) {
        throw new Error('Game ID is required');
      }
      const result = await gameApi.submitRoute(id, segments);
      const gameResult = new GameResult(
        result.gameId,
        result.isValid,
        result.finalScore,
        result.events,
        result.reason
      );
      return gameResult;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    try {
      setError(null);
      setLoading(true);
      const data = await gameApi.getRankings();
      setRankings(data.rankings || []);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const resetCurrentGame = () => {
    setCurrentGame(null);
    setError(null);
  };

  return (
    <GameContext.Provider
      value={{
        currentGame,
        network,
        rankings,
        loading,
        error,
        loadNetwork,
        startGame,
        playGame,
        fetchRankings,
        resetCurrentGame,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export default GameContext;
