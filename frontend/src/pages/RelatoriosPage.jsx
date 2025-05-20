import React from "react";
import RelatorioComponent from "../components/Relatorios/RelatorioComponent";
import { SocketProvider } from "../context/SocketContext";

const RelatoriosPage = () => {
  return (
    <SocketProvider>
      <RelatorioComponent />
    </SocketProvider>
  );
};

export default RelatoriosPage;