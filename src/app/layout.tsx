import type { Metadata, Viewport } from "next";
import { Inter, Poppins } from "next/font/google";
import "@/app/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Império - Hambúrgueria e Pizzaria",
  description: "Peça já seus combos, pizzas e hambúrgueres com entrega rápida.",
  // 🆕 PWA: aponta para o manifest que define nome, ícones e cores do app instalado
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Império",
  },
};

// 🆕 themeColor precisa ficar em "viewport" nas versões recentes do Next.js,
// não em "metadata" (senão o Next avisa depreciação no console)
export const viewport: Viewport = {
  themeColor: "#E8291C",
};

// 🆕 Script executado ANTES da hidratação do React, para aplicar o tema
// salvo (ou preferido pelo sistema) sem "piscar" o tema errado por um instante
const themeInitScript = `
  (function() {
    try {
      var saved = localStorage.getItem('theme');
      var theme = saved === 'light' || saved === 'dark'
        ? saved
        : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {}
  })();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark" suppressHydrationWarning>
      <head>
        {/* 🆕 roda antes de qualquer render, evita flash de tema errado */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${inter.variable} ${poppins.variable} font-sans`}>{children}</body>
    </html>
  );
}