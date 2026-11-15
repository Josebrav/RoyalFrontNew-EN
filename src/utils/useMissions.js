import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import API_URL from "../api/rutaApi";
import { LOCALE } from "../i18n/locale";

// Aviso entre componentes (panel, tarjeta del inicio y menú lateral) de que cambiaron las misiones,
// por ejemplo al cobrar una: así el globito del menú se actualiza sin recargar.
const MISSIONS_CHANGED = "missions:changed";
export const notifyMissionsChanged = () => window.dispatchEvent(new Event(MISSIONS_CHANGED));

/**
 * Misiones diarias y semanales del jugador (GET /missions). `refreshKey` vuelve a pedirlas cuando
 * cambia (ej. la ruta: al salir de un juego se ve el progreso nuevo).
 */
export default function useMissions(userId, refreshKey) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    if (!userId) return Promise.resolve();
    return axios
      .get(`${API_URL}/missions`)
      .then(({ data: res }) => {
        setData(res);
        setError(null);
      })
      .catch((e) => setError(e?.response?.data?.message || "No se pudieron cargar las misiones"));
  }, [userId]);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  useEffect(() => {
    window.addEventListener(MISSIONS_CHANGED, load);
    return () => window.removeEventListener(MISSIONS_CHANGED, load);
  }, [load]);

  return { data, error, reload: load };
}

export const claimMission = (missionId) =>
  axios.post(`${API_URL}/missions/${encodeURIComponent(missionId)}/claim`).then(({ data }) => {
    notifyMissionsChanged();
    return data;
  });

const TITLES = {
  es: {
    plays: (n) => `Hacé ${n} jugadas en cualquier juego`,
    wagered: (n) => `Apostá ${n} fichas en cualquier juego`,
    slot_spins: (n) => `Girá ${n} veces en las tragamonedas`,
    domino_hands: (n) => `Jugá ${n} manos de dominó`,
    domino_wins: (n) => `Ganá ${n} partidas de dominó`,
    parchis_matches: (n) => `Jugá ${n} partidas de parchís`,
    parchis_wins: (n) => `Ganá ${n} partidas de parchís`,
    bingo_cards: (n) => `Comprá ${n} cartones de bingo`,
    mines_rounds: (n) => `Jugá ${n} rondas de Minas`,
    ruleta_rounds: (n) => `Apostá en ${n} rondas de ruleta`,
    blackjack_hands: (n) => `Jugá ${n} manos de blackjack`,
    bicho_bets: (n) => `Hacé ${n} apuestas al Jogo do Bicho`,
  },
  en: {
    plays: (n) => `Make ${n} plays in any game`,
    wagered: (n) => `Bet ${n} chips in any game`,
    slot_spins: (n) => `Spin ${n} times on the slots`,
    domino_hands: (n) => `Play ${n} domino hands`,
    domino_wins: (n) => `Win ${n} domino matches`,
    parchis_matches: (n) => `Play ${n} parcheesi matches`,
    parchis_wins: (n) => `Win ${n} parcheesi matches`,
    bingo_cards: (n) => `Buy ${n} bingo cards`,
    mines_rounds: (n) => `Play ${n} Mines rounds`,
    ruleta_rounds: (n) => `Bet on ${n} roulette rounds`,
    blackjack_hands: (n) => `Play ${n} blackjack hands`,
    bicho_bets: (n) => `Place ${n} Jogo do Bicho bets`,
  },
  pt: {
    plays: (n) => `Faça ${n} jogadas em qualquer jogo`,
    wagered: (n) => `Aposte ${n} fichas em qualquer jogo`,
    slot_spins: (n) => `Gire ${n} vezes nos caça-níqueis`,
    domino_hands: (n) => `Jogue ${n} mãos de dominó`,
    domino_wins: (n) => `Ganhe ${n} partidas de dominó`,
    parchis_matches: (n) => `Jogue ${n} partidas de ludo`,
    parchis_wins: (n) => `Ganhe ${n} partidas de ludo`,
    bingo_cards: (n) => `Compre ${n} cartelas de bingo`,
    mines_rounds: (n) => `Jogue ${n} rodadas de Minas`,
    ruleta_rounds: (n) => `Aposte em ${n} rodadas de roleta`,
    blackjack_hands: (n) => `Jogue ${n} mãos de blackjack`,
    bicho_bets: (n) => `Faça ${n} apostas no Jogo do Bicho`,
  },
};

const numberFmt = new Intl.NumberFormat(LOCALE === "en" ? "en-US" : LOCALE === "pt" ? "pt-BR" : "es-AR");
export const formatNumber = (n) => numberFmt.format(Number(n) || 0);

/** Título en el idioma del sitio (el backend lo manda en español; si falta la métrica, se usa ese). */
export const missionTitle = (m) => TITLES[LOCALE]?.[m.metric]?.(formatNumber(m.target)) || m.title;

/** "5 h 12 min" hasta la renovación. */
export function timeLeft(resetsAt, now = Date.now()) {
  const ms = Math.max(0, new Date(resetsAt).getTime() - now);
  const totalMin = Math.floor(ms / 60000);
  const days = Math.floor(totalMin / 1440);
  const hours = Math.floor((totalMin % 1440) / 60);
  const mins = totalMin % 60;
  if (days > 0) return `${days} d ${hours} h`;
  if (hours > 0) return `${hours} h ${mins} min`;
  return `${mins} min`;
}
