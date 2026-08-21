"use client";

import { createContext, useContext } from "react";
import { DEFAULT_WHATSAPP_NUMBER, normalizeWhatsAppNumber } from "../../lib/whatsapp";

const WhatsAppContext = createContext(DEFAULT_WHATSAPP_NUMBER);

export function WhatsAppProvider({ number, children }: { number?: string; children: React.ReactNode }) {
  return <WhatsAppContext.Provider value={normalizeWhatsAppNumber(number)}>{children}</WhatsAppContext.Provider>;
}

export function useWhatsAppNumber() {
  return useContext(WhatsAppContext);
}
