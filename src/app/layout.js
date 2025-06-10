import { Nunito, PT_Serif } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/auth-context";
import { Toaster } from "sonner";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const ptSerif = PT_Serif({
  variable: "--font-pt-serif",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata = {
  title: "Talent Match",
  description: "AI-powered talent matching platform",
};

const RootLayout = ({ children }) => {
  return (
    <html lang="en">
      <body
        className={`${nunito.variable} ${ptSerif.variable} antialiased relative`}
      >
        <div className="texture" />
        <AuthProvider>
          {children}
          <Toaster position="top-center" />
        </AuthProvider>
      </body>
    </html>
  );
}

export default RootLayout;
