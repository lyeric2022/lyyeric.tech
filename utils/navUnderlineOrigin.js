/**
 * Underline transform-origin for each slot (0..n-1) when tabs move from `fromIdx` → `toIdx`.
 * Used by Essays/Drafts and Rankings page list toggles.
 */
export function slotUnderlineOrigin(fromIdx, toIdx, slotIndex) {
  if (fromIdx < 0 || fromIdx === toIdx) {
    return slotIndex === 0 ? 'right' : 'left';
  }
  if (slotIndex === toIdx) {
    return toIdx > fromIdx ? 'left' : 'right';
  }
  if (slotIndex === fromIdx) {
    return toIdx > fromIdx ? 'right' : 'left';
  }
  return slotIndex === 0 ? 'right' : 'left';
}

