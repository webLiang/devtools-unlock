/** disable-devtool DetectorType enum → readable names (for demos / troubleshooting). */
export const DETECTOR_LABELS: Record<number, string> = {
  [-1]: 'Unknown',
  0: 'RegToString',
  1: 'DefineId',
  2: 'Size',
  3: 'DateToString',
  4: 'FuncToString',
  5: 'Debugger',
  6: 'Performance',
  7: 'DebugLib',
};

export function labelDetector(type: number): string {
  return DETECTOR_LABELS[type] ?? `Type(${type})`;
}
