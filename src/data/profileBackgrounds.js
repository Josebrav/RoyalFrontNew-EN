// Fondos de perfil (cabecera 16:9 detras del avatar). Los precios y quien compro que los maneja el servidor
// (modulo profile-backgrounds); aca solo van las imagenes. "clasico" = el banner de siempre segun el rango.
import dulces from "../assets/fondos/dulces.jpg";
import gamer from "../assets/fondos/gamer.jpg";
import navidad from "../assets/fondos/navidad.jpg";

export const PROFILE_BACKGROUND_IMAGES = {
  dulces,
  gamer,
  navidad,
};

export const profileBackgroundImage = (id) => (id && PROFILE_BACKGROUND_IMAGES[id]) || null;
