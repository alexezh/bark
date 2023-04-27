export type GridPos = {
  x: number;
  y: number;
}

export type GridSize = {
  w: number;
  h: number;
}

export type GridRect = {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type PxPos = {
  x: number;
  y: number;
}

export type PxSize = {
  w: number;
  h: number;
}

export type PxRect = {
  x: number;
  y: number;
  w: number;
  h: number;
}

// passing cell around is just way to complex
// we are going to use global instead initialized at load
let cellWidth = 32;
let cellHeight = 32;

export function topLeftPos(rect: GridRect) {
  return { x: rect.x, y: rect.y };
}

export function setCellSize(w: number, h: number) {
  cellWidth = w;
  cellHeight = h;
}

export function gridPosToPxPos(px: GridPos): PxPos {
  return {
    x: px.x * cellWidth,
    y: px.y * cellHeight
  }
}

export function gridPosToPxPosSafe(px: GridPos | undefined): PxPos {
  if (px === undefined) {
    return { x: -10000, y: -10000 };
  }

  return { x: px.x * cellWidth, y: px.y * cellHeight };
}

export function pxRectToGridRect(px: PxRect): GridRect {
  let x = Math.floor(px.x / cellWidth);
  let y = Math.floor(px.y / cellHeight);
  let w = Math.ceil((px.x + px.w) / cellWidth) - x;
  let h = Math.ceil((px.y + px.h) / cellHeight) - y;

  return { x: x, y: y, w: w, h: h };
}

export function gridRectToPxRect(px: GridRect): PxRect {
  let x = px.x * cellWidth;
  let y = px.y * cellHeight;
  let w = px.w * cellWidth;
  let h = px.h * cellHeight;

  return { x: x, y: y, w: w, h: h };
}

export function scaleToGrid(px: GridRect, cw: number, ch: number): GridRect {
  let x = Math.floor(px.x / cw);
  let y = Math.floor(px.y / ch);
  let w = Math.ceil((px.x + px.w) / cw) - x;
  let h = Math.ceil((px.y + px.h) / ch) - y;

  return { x: x, y: y, w: w, h: h };
}

export function clipRect(rect: GridRect, width: number, height: number): GridRect {
  let x = (rect.x < 0) ? 0 : rect.x;
  let y = (rect.y < 0) ? 0 : rect.y;

  return {
    x: x,
    y: y,
    w: (rect.x + rect.w > width) ? width - x : rect.w,
    h: (rect.y + rect.h > height) ? height - y : rect.h
  };
}

export function areRectEqual(r1: GridRect, r2: GridRect): boolean {
  return r1.x === r2.x && r1.y === r2.y && r1.w === r2.w && r1.h === r2.h;
}

export function isRectOverlap(r1: GridRect, r2: GridRect): boolean {
  let r1r = r1.x + r1.w;
  let r1b = r1.y + r1.h;
  let r2r = r2.x + r2.w;
  let r2b = r2.y + r2.h;

  if (r1r < r2.x || r2r < r1.x) {
    return false;
  }

  if (r1b < r2.y || r2b < r1.y) {
    return false;
  }

  return true;
}

