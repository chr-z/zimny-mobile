/**
 * Serviços externos — cotação USD/BRL e clima de Boston.
 * Estritamente limitado a estes dois valores para eficiência de memória e UI.
 * Ambos os provedores são públicos e não exigem segredos no aplicativo.
 */

const FRANKFURTER_URL =
  "https://api.frankfurter.app/latest?from=USD&to=BRL";
const OPEN_METEO_URL =
  "https://api.open-meteo.com/v1/forecast?latitude=42.3601&longitude=-71.0589&current=temperature_2m&temperature_unit=fahrenheit&timezone=America%2FNew_York";

// ─── Types ───────────────────────────────────────────────────────────────────

export type ExternalSnapshot = {
  /** Ex: "5,19" */
  usdFormatted: string;
  /** Temperatura de Boston em °F, ex: 47 */
  bostonF: number;
};

// ─── Frankfurter — USD/BRL ──────────────────────────────────────────────────

type FrankfurterResponse = { rates?: { BRL?: number } };

function isCancellationError(e: unknown): boolean {
  if (e instanceof Error) {
    if (e.name === "AbortError") return true;
    if (/canceled|cancelled|aborted/i.test(e.message)) return true;
  }
  return false;
}

async function fetchUsd(): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  let res: Response;
  try {
    res = await fetch(FRANKFURTER_URL, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (e) {
    if (isCancellationError(e)) {
      const err = new Error(e instanceof Error ? e.message : "Aborted");
      err.name = "AbortError";
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) throw new Error(`Frankfurter ${res.status}`);
  const data = (await res.json()) as FrankfurterResponse;
  const buy = data.rates?.BRL;
  if (buy == null || isNaN(buy)) throw new Error("USD indisponível");
  return buy.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

// ─── Open-Meteo — Boston ────────────────────────────────────────────────────

type OpenMeteoResponse = { current?: { temperature_2m?: number } };

async function fetchBostonF(): Promise<number> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);
  let res: Response;
  try {
    res = await fetch(OPEN_METEO_URL, {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
  } catch (e) {
    if (isCancellationError(e)) {
      const err = new Error(e instanceof Error ? e.message : "Aborted");
      err.name = "AbortError";
      throw err;
    }
    throw e;
  } finally {
    clearTimeout(timeoutId);
  }
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const data = (await res.json()) as OpenMeteoResponse;
  const fahrenheit = data.current?.temperature_2m;
  if (fahrenheit == null) throw new Error("temperature_2m ausente");
  return Math.round(fahrenheit);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchExternalSnapshot(): Promise<ExternalSnapshot> {
  const [usdResult, bosResult] = await Promise.allSettled([
    fetchUsd(),
    fetchBostonF(),
  ]);
  return {
    usdFormatted: usdResult.status === "fulfilled" ? usdResult.value : "--",
    bostonF: bosResult.status === "fulfilled" ? bosResult.value : NaN,
  };
}
