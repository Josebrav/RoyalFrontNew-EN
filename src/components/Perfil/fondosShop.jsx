import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import Swal from "sweetalert2";
import API_URL from "../../api/rutaApi";
import { UPDATE_USER_PROFILE } from "../../redux/actions/action.types";
import { swalThemeConfig } from "../../utils/formatters";
import { profileBackgroundImage } from "../../data/profileBackgrounds";
import marco from "../../assets/fondos/marco.png";
import flechaIzq from "../../assets/fondos/flecha_izq.png";
import flechaDer from "../../assets/fondos/flecha_der.png";

// Zonas del marco "FONDOS" (en % de la imagen recortada, 900x669): la ventana transparente y la barra del precio.
const WINDOW = { left: "4.6%", top: "31.6%", width: "91.2%", height: "42.2%" };
const BAR = { left: "18.5%", top: "78.6%", width: "76.8%", height: "14.8%" };

const fmt = (n) => Number(n || 0).toLocaleString("es-AR");

/**
 * Tienda de fondos de perfil: se rota con las flechas, la ventana muestra el fondo y la cabecera del perfil
 * lo previsualiza en vivo (onPreview). Comprar descuenta las fichas una sola vez; los comprados se cambian gratis.
 */
export default function FondosShop({ open, onClose, classicImage, onPreview }) {
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.currentUser);
  const [data, setData] = useState(null);
  const [index, setIndex] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setError("");
    axios
      .get(`${API_URL}/profile-backgrounds`)
      .then((r) => {
        setData(r.data);
        const items = [null, ...r.data.backgrounds.map((b) => b.id)];
        setIndex(Math.max(0, items.indexOf(r.data.current ?? null)));
      })
      .catch(() => setError("No se pudieron cargar los fondos. Probá de nuevo en un rato."));
  }, [open]);

  const items = data
    ? [{ id: null, name: "Clásico", price: 0, owned: true }, ...data.backgrounds]
    : [{ id: null, name: "Clásico", price: 0, owned: true }];
  const item = items[Math.min(index, items.length - 1)];
  const current = data ? data.current ?? null : currentUser?.profileBackground ?? null;
  const inUse = item.id === current;
  const image = item.id ? profileBackgroundImage(item.id) : classicImage;

  useEffect(() => {
    if (open) onPreview?.(item.id);
  }, [open, item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!open) return null;

  const close = () => {
    onPreview?.(undefined);
    onClose();
  };
  const move = (d) => setIndex((i) => (i + d + items.length) % items.length);

  const applyResult = (res) => {
    setData(res);
    dispatch({ type: UPDATE_USER_PROFILE, payload: { ...currentUser, chips: res.chips, profileBackground: res.current } });
  };

  const act = async () => {
    if (busy || inUse) return;
    setError("");
    if (!item.owned) {
      const chips = data?.chips ?? currentUser?.chips ?? 0;
      if (chips < item.price) {
        setError(`Te faltan ${fmt(item.price - chips)} fichas para este fondo.`);
        return;
      }
      const ok = await Swal.fire({
        ...swalThemeConfig,
        title: `¿Comprar "${item.name}"?`,
        text: `Cuesta ${fmt(item.price)} fichas. Queda tuyo para siempre y lo podés cambiar cuando quieras.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Comprar",
        cancelButtonText: "Cancelar",
      });
      if (!ok.isConfirmed) return;
    }
    setBusy(true);
    try {
      const res = item.owned
        ? await axios.post(`${API_URL}/profile-backgrounds/use`, { backgroundId: item.id })
        : await axios.post(`${API_URL}/profile-backgrounds/buy`, { backgroundId: item.id });
      applyResult(res.data);
    } catch (e) {
      setError(e?.response?.data?.message || "No se pudo completar. Probá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  const barText = inUse ? "EN USO" : item.owned ? (item.id ? "TUYO" : "GRATIS") : fmt(item.price);
  const action = inUse ? "EN USO" : item.owned ? "USAR" : "COMPRAR";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4" onClick={close}>
      <div className="relative w-full max-w-[640px]" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={close}
          aria-label="Cerrar"
          className="absolute -top-2 right-0 z-20 w-10 h-10 rounded-full bg-[#2b0a63] border-2 border-[#a78bfa] text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="relative w-full">
          {/* La ventana va debajo del marco: el marco tiene el hueco transparente */}
          <div className="absolute overflow-hidden rounded-[2%] bg-black" style={WINDOW}>
            <img key={item.id ?? "clasico"} src={image} alt={item.name} className="w-full h-full object-cover animate-[fondoIn_.35s_ease-out]" />
            <div className="absolute left-2 bottom-2 px-3 py-1 rounded-full bg-black/60 border border-white/20 text-white text-xs sm:text-sm font-bold">
              {item.name}
            </div>
            <div className="absolute right-2 top-2 px-2 py-0.5 rounded-full bg-black/60 text-white/80 text-[0.65rem] sm:text-xs font-bold">
              {index + 1} / {items.length}
            </div>
          </div>
          <img src={marco} alt="" className="relative w-full pointer-events-none select-none" draggable={false} />
          <div
            className="absolute flex items-center justify-center font-black tracking-wide text-[#ffd84a] text-base sm:text-2xl drop-shadow-[0_2px_0_rgba(0,0,0,0.8)]"
            style={BAR}
          >
            {barText}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-center gap-4 sm:gap-8">
          <button type="button" onClick={() => move(-1)} aria-label="Anterior" className="w-12 sm:w-16 hover:scale-110 active:scale-95 transition-transform cursor-pointer bg-transparent border-0 p-0">
            <img src={flechaIzq} alt="" className="w-full" draggable={false} />
          </button>
          <button
            type="button"
            onClick={act}
            disabled={busy || inUse}
            className={`min-w-[150px] sm:min-w-[210px] px-6 py-3 rounded-full border-4 font-black text-lg sm:text-2xl tracking-wide transition-transform ${
              inUse
                ? "bg-[#3b2a6b] border-[#6d5ba8] text-white/60 cursor-default"
                : item.owned
                  ? "bg-gradient-to-b from-[#a855f7] to-[#6d28d9] border-[#ffd84a] text-white hover:scale-105 active:scale-95 cursor-pointer"
                  : "bg-gradient-to-b from-[#ffe066] to-[#f59e0b] border-[#7c2d12] text-[#4a1d00] hover:scale-105 active:scale-95 cursor-pointer"
            }`}
          >
            {busy ? "..." : action}
          </button>
          <button type="button" onClick={() => move(1)} aria-label="Siguiente" className="w-12 sm:w-16 hover:scale-110 active:scale-95 transition-transform cursor-pointer bg-transparent border-0 p-0">
            <img src={flechaDer} alt="" className="w-full" draggable={false} />
          </button>
        </div>

        <p className="mt-3 text-center text-sm text-white/80 min-h-[1.25rem]">
          {error || (data ? `Tu saldo: ${fmt(data.chips)} fichas` : "")}
        </p>
      </div>
      <style>{`@keyframes fondoIn { from { opacity: 0; transform: scale(1.06); } to { opacity: 1; transform: scale(1); } }`}</style>
    </div>
  );
}
