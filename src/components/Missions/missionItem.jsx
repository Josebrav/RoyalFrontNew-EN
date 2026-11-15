import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import Swal from "sweetalert2";
import { getGameBySlug } from "../../data/gamesCatalog";
import { getUserByEmail } from "../../redux/actions";
import { playCoinSound } from "../../utils/coinSound";
import { swalThemeConfig } from "../../utils/formatters";
import { claimMission, formatNumber, missionTitle } from "../../utils/useMissions";

const METRIC_ICON = {
  plays: "sports_esports",
  wagered: "toll",
  slot_spins: "casino",
  domino_hands: "view_module",
  domino_wins: "emoji_events",
  parchis_matches: "grid_view",
  parchis_wins: "emoji_events",
  bingo_cards: "confirmation_number",
  mines_rounds: "diamond",
  ruleta_rounds: "radio_button_checked",
  blackjack_hands: "style",
  bicho_bets: "pets",
};

/** Una misión: progreso, premio y botón de Cobrar (si está cumplida) o de Jugar. */
export default function MissionItem({ mission, compact = false }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state);
  const [claiming, setClaiming] = useState(false);
  const pct = Math.min(100, Math.round((mission.progress / mission.target) * 100));
  const game = mission.gameSlug ? getGameBySlug(mission.gameSlug) : null;

  const handleClaim = async () => {
    if (claiming) return;
    setClaiming(true);
    try {
      const res = await claimMission(mission.id);
      playCoinSound();
      if (currentUser?.email) dispatch(getUserByEmail(currentUser.email)).catch(() => {});
      Swal.fire({
        title: "¡Misión cumplida!",
        text: `Ganaste ${formatNumber(res.reward)} fichas.`,
        icon: "success",
        timer: 2500,
        showConfirmButton: false,
        ...swalThemeConfig,
      });
    } catch (e) {
      setClaiming(false);
      Swal.fire({ title: "Misiones", text: e?.response?.data?.message || "No se pudo cobrar la misión", icon: "error", ...swalThemeConfig });
    }
  };

  return (
    <div
      className={`flex items-center gap-3 rounded-xl border p-3 ${
        mission.claimed ? "border-outline-variant/20 opacity-60" : mission.completed ? "border-primary/60 bg-primary/5" : "border-outline-variant/20"
      }`}
    >
      <span
        className={`material-symbols-outlined flex-shrink-0 ${compact ? "text-[22px]" : "text-[28px]"} ${mission.completed ? "text-primary" : "text-on-surface-variant"}`}
        style={{ fontVariationSettings: "'FILL' 1" }}
      >
        {mission.claimed ? "task_alt" : METRIC_ICON[mission.metric] || "flag"}
      </span>
      <div className="min-w-0 flex-1">
        <p className={`font-bold text-white ${compact ? "text-xs" : "text-sm"} leading-snug`}>{missionTitle(mission)}</p>
        <div className="mt-1.5 w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden border border-outline-variant/10">
          <div className={`h-full ${mission.completed ? "royal-gold-gradient" : "bg-sky-500"}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1 text-[0.6875rem] text-on-surface-variant tabular-nums">
          {formatNumber(mission.progress)} / {formatNumber(mission.target)}
          <span className="text-primary font-bold"> · +{formatNumber(mission.reward)} fichas</span>
        </p>
      </div>
      {mission.claimed ? (
        <span className="text-[0.6875rem] font-bold uppercase text-green-400 flex-shrink-0">Cobrada</span>
      ) : mission.completed ? (
        <button
          type="button"
          onClick={handleClaim}
          disabled={claiming}
          className="royal-gold-gradient px-3 py-1.5 rounded-lg text-[#0A0A0F] font-bold text-xs uppercase flex-shrink-0 cursor-pointer border-0 hover:brightness-110 disabled:opacity-60"
        >
          Cobrar
        </button>
      ) : (
        <button
          type="button"
          onClick={() => navigate(game?.playPath || "/juegos")}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold text-xs uppercase flex-shrink-0 cursor-pointer border-0 hover:brightness-110"
        >
          Jugar
        </button>
      )}
    </div>
  );
}
