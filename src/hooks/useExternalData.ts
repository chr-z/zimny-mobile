import { useEffect, useRef, useState } from "react";

import {
  fetchExternalSnapshot,
  type ExternalSnapshot,
} from "@/src/services/external";

type State = {
  data: ExternalSnapshot | null;
  loading: boolean;
};

/** Cache de sessão — uma única chamada por sessão. */
let _cache: State | null = null;

export function useExternalData(): State {
  const [state, setState] = useState<State>(
    _cache ?? { data: null, loading: true }
  );
  const fetched = useRef(false);

  useEffect(() => {
    if (_cache) {
      setState(_cache);
      return;
    }
    if (fetched.current) return;
    fetched.current = true;

    fetchExternalSnapshot()
      .then((data) => {
        const next: State = { data, loading: false };
        _cache = next;
        setState(next);
      })
      .catch(() => {
        const next: State = { data: null, loading: false };
        _cache = next;
        setState(next);
      });
  }, []);

  return state;
}
