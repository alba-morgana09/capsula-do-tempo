import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Telemetria para o Amanhã | Cápsula do Tempo",
  description:
    "Hoje eu coleto sinais; no futuro, desenho arquiteturas que sabem responder.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
