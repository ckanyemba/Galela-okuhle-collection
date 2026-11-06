import "@fontsource-variable/inter";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";

export const metadata = {
  title: { default: "Galela Okuhle Collection", template: "%s · Galela Okuhle Collection" },
  description: "Handbags, totes and Gosh home cleaning products. Order online and pay by card, EFT, WhatsApp or cash.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en-ZA">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
