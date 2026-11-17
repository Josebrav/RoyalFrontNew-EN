import React from "react";
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import GameFrame from "../GameFrame/gameFrame";
import useChatToken from "../../../utils/useChatToken";

// Texas Hold'em: 2377x1080 como el blackjack (mesa 1920 + chat). Por ahora solo lo ven admin y mod.
// RequireAuth (App.jsx) espera a que se recupere la sesion; recien ahi se mira el rango, asi un admin que
// entra escribiendo /game/poker no rebota al inicio antes de que cargue su usuario.
const Poker = () => {
  const currentUser = useSelector((state) => state.currentUser);
  const isStaff = currentUser?.role === "admin" || currentUser?.role === "mod";
  const jugadorID = currentUser?.id || "default-id";
  const chat = useChatToken(currentUser?.id);
  if (!isStaff) return <Navigate to="/" replace />;
  const gameURL = `https://pokertexas.s3.us-east-2.amazonaws.com/poker/index.html?jugadorID=${jugadorID}&chatToken=${encodeURIComponent(chat.token)}`;

  return <GameFrame src={jugadorID && chat.ready ? gameURL : null} title="Poker" nativeWidth={2377} nativeHeight={1080} />;
};

export default Poker;
