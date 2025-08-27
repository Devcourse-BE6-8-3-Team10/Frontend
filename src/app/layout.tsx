import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ChatProvider } from "@/contexts/ChatContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "특허바다",
  description: "혁신적인 특허와 무형자산을 안전하고 편리하게 거래하세요",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <AuthProvider>
          <ChatProvider>
            <div className="min-h-screen bg-[#2A5298] flex flex-col">
              {/* Header */}
              <Header />

              {/* Main Content */}
              <main className="flex-grow">{children}</main>

              {/* Footer */}
              <Footer />

              {/* Floating Action Button */}
              <div className="fixed bottom-6 right-6">
                <button className="bg-purple-600 hover:bg-purple-700 text-white w-14 h-14 rounded-full shadow-lg transition-colors flex items-center justify-center">
                  <span className="text-xl">💬</span>
                </button>
              </div>
            </div>
          </ChatProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
