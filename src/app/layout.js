import Header from "@/components/Header";
import "./globals.css";
import "./clerk.css";
import Footer from "@/components/Footer";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkAppearance } from "@/lib/clerk";

export const metadata = {
  title: "Hagi Aesthetics",
  description: "Hagi Aesthetics",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`antialiased`}>
        <ClerkProvider appearance={clerkAppearance}>
          <Header />
          {children}
          <Footer />
        </ClerkProvider>
      </body>
    </html>
  );
}
