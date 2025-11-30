import { useEffect, useState } from "react";
import { moveMapIn2048Rule } from "./moveMapIn2048Rule";
import type { Map2048 } from "./moveMapIn2048Rule";

const BOARD_SIZE = 4;

const App = () => {
  const [board, setBoard] = useState<Map2048>(() => {
    const saved = localStorage.getItem("board");
    return saved ? JSON.parse(saved) : initBoard();
  });
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem("score");
    return saved ? Number(saved) : 0;
  });
  const [history, setHistory] = useState<{ board: Map2048; score: number }[]>(
    [],
  );
  const [gameOver, setGameOver] = useState(false);

  // 저장
  useEffect(() => {
    localStorage.setItem("board", JSON.stringify(board));
    localStorage.setItem("score", String(score));
  }, [board, score]);

  // 방향키 이벤트
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameOver) return;
      let direction: "up" | "down" | "left" | "right" | null = null;
      if (e.key === "ArrowUp") direction = "up";
      if (e.key === "ArrowDown") direction = "down";
      if (e.key === "ArrowLeft") direction = "left";
      if (e.key === "ArrowRight") direction = "right";

      if (direction) {
        setHistory((prev) => [...prev, { board: structuredClone(board), score }]); // undo 저장
        const { result, isMoved } = moveMapIn2048Rule(board, direction);
        if (isMoved) {
          const newBoard = addRandomTile(result);
          setBoard(newBoard);
          const addedScore = calcScore(board, result);
          setScore((s) => s + addedScore);

          if (checkGameOver(newBoard)) setGameOver(true);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [board, score, gameOver]);

  const handleReset = () => {
    const fresh = initBoard();
    setBoard(fresh);
    setScore(0);
    setHistory([]);
    setGameOver(false);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const prev = history[history.length - 1];
    setBoard(prev.board);
    setScore(prev.score);
    setHistory(history.slice(0, -1));
    setGameOver(false);
  };

  return (
    <div className="game-container">
      <h1>2048 Game</h1>
      <div className="info">
        <div className="score">점수: {score}</div>
        <button onClick={handleReset}>새 게임</button>
        <button onClick={handleUndo}>Undo</button>
      </div>
      <div className="board">
        {board.map((row, r) => (
          <div key={r} className="row">
            {row.map((cell, c) => (
              <div key={c} className={`cell value-${cell ?? "empty"}`}>
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      {gameOver && <div className="game-over">게임 종료!</div>}
    </div>
  );
};

export default App;

/** 초기화 함수 */
function initBoard(): Map2048 {
  const board: Map2048 = Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null),
  );
  return addRandomTile(addRandomTile(board));
}

/** 빈 칸 중 랜덤 위치에 새 타일 추가 */
function addRandomTile(board: Map2048): Map2048 {
  const empty: [number, number][] = [];
  board.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (cell === null) empty.push([r, c]);
    }),
  );
  if (empty.length === 0) return board;

  const [r, c] = empty[Math.floor(Math.random() * empty.length)];
  const newBoard = board.map((row) => [...row]);
  newBoard[r][c] = Math.random() < 0.9 ? 2 : 4;
  return newBoard;
}

/** 점수 계산 (병합된 값의 합만큼 추가) */
function calcScore(prev: Map2048, next: Map2048): number {
  let score = 0;
  prev.forEach((row, r) =>
    row.forEach((cell, c) => {
      if (next[r][c] !== null && next[r][c]! > (cell ?? 0)) {
        score += next[r][c]! - (cell ?? 0);
      }
    }),
  );
  return score;
}

/** 게임 종료 판정 */
function checkGameOver(board: Map2048): boolean {
  // 128 타일 존재 여부
  if (board.some((row) => row.some((cell) => cell === 128))) return true;

  // 빈칸이 있으면 아직 진행 가능
  if (board.some((row) => row.some((cell) => cell === null))) return false;

  // 이동 가능한 경우 체크
  for (let r = 0; r < BOARD_SIZE; r++) {
    for (let c = 0; c < BOARD_SIZE; c++) {
      const val = board[r][c];
      if (r < BOARD_SIZE - 1 && board[r + 1][c] === val) return false;
      if (c < BOARD_SIZE - 1 && board[r][c + 1] === val) return false;
    }
  }
  return true;
}