import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  cartItemCount: number;
  onCartOpen: () => void;
  showToast: boolean;
}

// Pages jahan footer NAHI aayega
const HIDE_FOOTER_ROUTES = ["/profile", "/orders"];

const Layout = ({ children }: LayoutProps) => {
  const { pathname } = useLocation();
  const showFooter = !HIDE_FOOTER_ROUTES.includes(pathname);
  
  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-300">

      {/* ================= MAIN ================= */}
      <main>
        {children}
      </main>

      {/* ================= FOOTER ================= */}
      {showFooter && <Footer />}

    </div>
  );
};

export default Layout;