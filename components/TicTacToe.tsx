"use client";

import React, { useState, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Confetti, ConfettiRef } from "@/components/magicui/confetti";
import { useTheme } from "next-themes";
import { Moon, Sun, Users, RotateCcw } from "lucide-react";

type Player = "X" | "O" | null;
type Board = Player[];

interface GameStats {
  xWins: number;
  oWins: number;
  draws: number;
}

const WINNING_COMBINATIONS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8], // Rows
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8], // Columns
  [0, 4, 8],
  [2, 4, 6], // Diagonals
];

export function TicTacToe() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [winner, setWinner] = useState<Player | "Draw" | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [gameStats, setGameStats] = useState<GameStats>({
    xWins: 0,
    oWins: 0,
    draws: 0,
  });
  const { theme, setTheme } = useTheme();
  const confettiRef = useRef<ConfettiRef>(null);

  const checkWinner = useCallback(
    (board: Board): { winner: Player | "Draw" | null; line: number[] } => {
      // Check for winning combinations
      for (const combination of WINNING_COMBINATIONS) {
        const [a, b, c] = combination;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return { winner: board[a], line: combination };
        }
      }

      // Check for draw
      if (board.every((cell) => cell !== null)) {
        return { winner: "Draw", line: [] };
      }

      return { winner: null, line: [] };
    },
    []
  );

  const handleCellClick = useCallback(
    (index: number) => {
      if (board[index] || winner) return;

      const newBoard = [...board];
      newBoard[index] = currentPlayer;
      setBoard(newBoard);

      const result = checkWinner(newBoard);
      if (result.winner) {
        setWinner(result.winner);
        setWinningLine(result.line);
        setShowWinnerModal(true);

        // Trigger confetti for wins (not draws)
        if (result.winner !== "Draw") {
          setTimeout(() => {
            confettiRef.current?.fire({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
            });
          }, 500);
        }

        // Update game stats
        setGameStats((prev) => {
          const newStats = { ...prev };
          if (result.winner === "X") newStats.xWins++;
          else if (result.winner === "O") newStats.oWins++;
          else if (result.winner === "Draw") newStats.draws++;
          return newStats;
        });
      } else {
        setCurrentPlayer(currentPlayer === "X" ? "O" : "X");
      }
    },
    [board, currentPlayer, winner, checkWinner]
  );

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer("X");
    setWinner(null);
    setWinningLine([]);
    setShowWinnerModal(false);
  }, []);

  const resetStats = useCallback(() => {
    setGameStats({ xWins: 0, oWins: 0, draws: 0 });
  }, []);

  const getCellClassName = (index: number) => {
    const baseClasses =
      "w-20 h-20 text-2xl font-bold border-2 border-border-zinc-300 rounded-lg transition-all duration-200 hover:border-border/40 hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed";

    if (winningLine.includes(index)) {
      return `${baseClasses} bg-primary/20 border-primary/50 text-primary animate-pulse`;
    }

    if (board[index]) {
      return `${baseClasses} ${
        board[index] === "X" ? "text-blue-500" : "text-red-500"
      }`;
    }

    return baseClasses;
  };

  const getGameStatusMessage = () => {
    if (winner === "Draw") return "It's a draw! 🤝";
    return `Player ${currentPlayer}'s turn`;
  };

  const getGameStatusBadgeVariant = () => {
    if (winner === "Draw") return "secondary";
    if (winner) return "default";
    return "outline";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-4xl mx-auto space-y-14">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Tic-Tac-Toe
            </h1>
            <p className="text-muted-foreground">
              Classic strategy game for two players
            </p>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-3">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <Badge
                    variant={getGameStatusBadgeVariant()}
                    className="text-sm px-3 py-1"
                  >
                    {getGameStatusMessage()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center">
                <div className="grid grid-cols-3 gap-2 p-6 bg-muted/20 rounded-xl">
                  {board.map((cell, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className={getCellClassName(index)}
                      onClick={() => handleCellClick(index)}
                      disabled={!!cell || !!winner}
                    >
                      {cell}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Game Stats & Controls */}
          <div className="space-y-6">
            {/* Game Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  🔥 Game Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  onClick={resetGame}
                  className="w-full bg-emerald-600  text-white dark:bg-emerald-800 border dark:border-green-400 dark:text-white"
                  size="lg"
                >
                  New Game
                </Button>
                <Button
                  onClick={resetStats}
                  className="w-full bg-red-400/30 border border-red-400 text-red-700 dark:text-white"
                  size="lg"
                >
                  Reset All Stats
                </Button>
              </CardContent>
            </Card>

            {/* Game Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  😊 Statistics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Player X Wins:</span>
                    <Badge
                      variant="default"
                      className="bg-blue-500/20 text-blue-500 border-blue-500/30"
                    >
                      {gameStats.xWins}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Player O Wins:</span>
                    <Badge
                      variant="default"
                      className="bg-red-500/20 text-red-500 border-red-500/30"
                    >
                      {gameStats.oWins}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Draws:</span>
                    <Badge variant="secondary">{gameStats.draws}</Badge>
                  </div>
                  <div className="pt-2 border-t border-border/50">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Total Games:</span>
                      <Badge variant="outline">
                        {gameStats.xWins + gameStats.oWins + gameStats.draws}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Players */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Players</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    currentPlayer === "X" && !winner
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-border/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                      X
                    </div>
                    <span className="font-medium">Player X</span>
                  </div>
                  {currentPlayer === "X" && !winner && (
                    <Badge variant="default" className="bg-blue-500 text-white">
                      Current
                    </Badge>
                  )}
                </div>

                <div
                  className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                    currentPlayer === "O" && !winner
                      ? "border-red-500/50 bg-red-500/10"
                      : "border-border/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-red-500 font-bold">
                      O
                    </div>
                    <span className="font-medium">Player O</span>
                  </div>
                  {currentPlayer === "O" && !winner && (
                    <Badge variant="default" className="bg-red-700 text-white">
                      Current
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Winner Modal */}
        <Dialog open={showWinnerModal} onOpenChange={setShowWinnerModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16  text-center items-center justify-center text-6xl">
                {winner === "Draw" ? <>🤝</> : <>🏆</>}
              </div>
              <DialogTitle className="text-2xl font-bold text-center">
                {winner === "Draw" ? "It's a Draw!" : `Player ${winner} Wins!`}
              </DialogTitle>
              <DialogDescription className="mt-4 text-md text-center">
                {winner === "Draw"
                  ? "Great game! Both players played well."
                  : `Congratulations! Player ${winner} has won this round.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="mt-10 sm:justify-center gap-2">
              <Button
                variant="outline"
                onClick={() => setShowWinnerModal(false)}
                size="lg"
                className="w-40"
              >
                Close
              </Button>

              <Button
                onClick={resetGame}
                className="w-40 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                size="lg"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Play Again
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confetti Canvas */}
        <Confetti
          ref={confettiRef}
          className="absolute left-0 top-0 z-[999999] size-full pointer-events-none"
          manualstart={true}
        />
      </div>
    </div>
  );
}
