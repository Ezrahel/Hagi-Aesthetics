import Header from "@/components/Header";
import "./globals.css";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";

export const metadata = {
  title: "Hagi Aesthetics",
  description: "Hagi Aesthetics",
  icons: {
    icon: "/logo.png"
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`antialiased`} suppressHydrationWarning>
        <ErrorBoundary>
          <Header />
          {children}
          <Footer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
