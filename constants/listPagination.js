/** Client-side list pagination helpers (arrow keys). */
export function shouldIgnoreListPaginationArrowKeys(target) {
  if (!target || typeof target.closest !== 'function') return true;
  if (target.closest('input, textarea, select, [contenteditable="true"]')) return true;
  if (target.closest('.writing-header, .tier-list-toolbar, [role="tablist"]')) return true;
  if (target.closest('.tier-add-modal')) return true;
  return false;
}
