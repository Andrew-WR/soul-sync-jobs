import { CATEGORIES, type ScoreMap } from "@/constants/categories";

export function toDistribution(map: Partial<Record<string, number>>): number[] {
  const arr = CATEGORIES.map((c) => {
    const v = Number((map as any)[c] ?? 0);
    return Number.isFinite(v) ? Math.max(0, v) : 0;
  });
  const sum = arr.reduce((a, b) => a + b, 0);
  if (sum <= 0) return Array(arr.length).fill(0);
  return arr.map((v) => v / sum);
}

export function dot(a: number[], b: number[]): number {
  const n = Math.min(a.length, b.length);
  let s = 0;
  for (let i = 0; i < n; i++) s += a[i] * b[i];
  return s;
}

export function similarity(user: Partial<ScoreMap>, company: Partial<ScoreMap>): number {
  const du = toDistribution(user as any);
  const dc = toDistribution(company as any);
  return dot(du, dc);
}
