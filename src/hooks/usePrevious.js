import { useRef } from 'react';

/** Previous value from the prior render (undefined on first render). */
export function usePrevious(value) {
  const ref = useRef();
  const previous = ref.current;
  ref.current = value;
  return previous;
}
