import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import useMissions, { timeLeft } from "../../utils/useMissions";
import MissionItem from "./missionItem";

function Section({ title, icon, period, now }) {
  if (!period) return null;
  return (
    <section className="glass-card rounded-2xl border border-outline-variant/20 p-5 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
          {title}
        </h2>
        <span className="text-xs text-on-surface-variant flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">schedule</span>
          Se renuevan en {timeLeft(period.resetsAt, now)}
        </span>
      </div>
      <div className="flex flex-col gap-3">
        {period.missions.map((m) => (
          <MissionItem key={m.id} mission={m} />
        ))}
      </div>
    </section>
  );
}

/** Página /misiones: misiones diarias y semanales con su progreso y el cobro de fichas. */
export default function Missions() {
  const { currentUser } = useSelector((state) => state);
  const { data, error } = useMissions(currentUser?.id);
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-background text-on-background min-h-screen pt-20 pb-16">
      <div className="px-4 md:px-margin-desktop max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-primary tracking-tight flex items-center gap-2">
            <span className="material-symbols-outlined text-[34px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              flag
            </span>
            Misiones
          </h1>
          <p className="text-on-surface-variant mt-2 max-w-2xl">
            Cumplí las misiones jugando y cobrá fichas gratis. Las diarias cambian todos los días y las semanales cada lunes.
            Si no cobrás una misión cumplida antes de que se renueve, se pierde.
          </p>
        </header>

        {error && <p className="text-error mb-4">{error}</p>}
        {!data && !error && (
          <div className="h-24 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        )}
        {data && (
          <>
            <Section title="Misiones diarias" icon="today" period={data.daily} now={now} />
            <Section title="Misiones semanales" icon="date_range" period={data.weekly} now={now} />
          </>
        )}
      </div>
    </div>
  );
}
