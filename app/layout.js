import { Bebas_Neue, Barlow } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/AuthProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Bebas Neue — condensada, forte, com cara de pôster de rua, lambe-lambe
// e grafite. Perfeita pra títulos que precisam ter presença e atitude.
// Barlow — sem serifa, levemente condensada, fácil de ler em qualquer
// tamanho. A fonte da quebrada que não precisa se provar pra ninguém.
const bebasNeue = Bebas_Neue({
  subsets: ["latin"],
  weight: "400",
  variable: "--next-font-heading",
  display: "swap",
});

const barlow = Barlow({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--next-font-body",
  display: "swap",
});

export const metadata = {
  title: "Cultura Unificada — Arte e cultura da Zona Leste",
  description:
    "Espaço digital dos artistas e agentes culturais da Zona Leste: cadastro de artistas, Calendário Unificado de eventos, Mapeamento Cultural e Editais Abertos.",
  manifest: "/manifest.json",
  themeColor: "#B87800",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Cultura Unificada ZL",
  },
  icons: {
    icon: "/icon.svg",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${bebasNeue.variable} ${barlow.variable}`}>
      <body>
        <AuthProvider>
          <Navbar />
          <main>{children}</main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
