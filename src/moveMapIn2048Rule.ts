export type Cell = number | null;
export type Map2048 = Cell[][];
type Direction = "up" | "left" | "right" | "down";
type RotateDegree = 0 | 90 | 180 | 270;
type DirectionDegreeMap = Record<Direction, RotateDegree>;
export type MoveResult = { result: Map2048; isMoved: boolean };

const rotateDegreeMap: DirectionDegreeMap = {
  up: 90,
  right: 180,
  down: 270,
  left: 0,
};

const revertDegreeMap: DirectionDegreeMap = {
  up: 270,
  right: 180,
  down: 90,
  left: 0,
};

export const moveMapIn2048Rule = (
  map: Map2048,
  direction: Direction,
): MoveResult => {
  if (!validateMapIsNByM(map)) throw new Error("Map is not N by M");

  const rotatedMap = rotateMapCounterClockwise(map, rotateDegreeMap[direction]);
  const { result, isMoved } = moveLeft(rotatedMap);

  return {
    result: rotateMapCounterClockwise(result, revertDegreeMap[direction]),
    isMoved,
  };
};

const validateMapIsNByM = (map: Map2048) => {
  const firstColumnCount = map[0].length;
  return map.every((row) => row.length === firstColumnCount);
};

const rotateMapCounterClockwise = (
  map: Map2048,
  degree: 0 | 90 | 180 | 270
): Map2048 => {
  const rowLength = map.length;
  const columnLength = map[0].length;

  switch (degree) {
    case 0: return map;
    case 90: return Array.from({ length: columnLength }, (_, c) =>
      Array.from({ length: rowLength }, (_, r) => map[r][columnLength - c - 1])
    );
    case 180: return Array.from({ length: rowLength }, (_, r) =>
      Array.from({ length: columnLength }, (_, c) => map[rowLength - r - 1][columnLength - c - 1])
    );
    case 270: return Array.from({ length: columnLength }, (_, c) =>
      Array.from({ length: rowLength }, (_, r) => map[rowLength - r - 1][c])
    );
  }
};

const moveLeft = (map: Map2048): MoveResult => {
  const movedRows = map.map(moveRowLeft);
  const result = movedRows.map((m) => m.result);
  const isMoved = movedRows.some((m) => m.isMoved);
  return { result, isMoved };
};

const moveRowLeft = (row: Cell[]): { result: Cell[]; isMoved: boolean } => {
  const reduced = row.reduce(
    (acc: { lastCell: Cell; result: Cell[] }, cell) => {
      if (cell === null) return acc;
      if (acc.lastCell === null) return { ...acc, lastCell: cell };
      if (acc.lastCell === cell) return { result: [...acc.result, cell * 2], lastCell: null };
      return { result: [...acc.result, acc.lastCell], lastCell: cell };
    },
    { lastCell: null, result: [] }
  );
  const result = [...reduced.result, reduced.lastCell];
  const resultRow = Array.from({ length: row.length }, (_, i) => result[i] ?? null);
  return { result: resultRow, isMoved: row.some((cell, i) => cell !== resultRow[i]) };
};
