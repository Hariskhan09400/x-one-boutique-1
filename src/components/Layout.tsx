import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  cartItemCount: number;      // Add this
  onCartOpen: () => void;      // Add this
  showToast: boolean;          // Add this
  // Ab yahan cartItemCount aur onCartOpen ki zaroorat nahi kyunki Navbar yahan nahi hai
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-300">
      
      {/* ❌ Navbar yahan se hata diya hai taaki DOUBLE na dikhe */}

      {/* ================= MAIN ================= */}
      <main>
        {children}
      </main>

      {/* ================= FOOTER ================= */}
      <footer className="mt-20 border-t border-slate-200 dark:border-slate-800 py-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} X One Boutique. All rights reserved.
      </footer>

    </div>
  );
};

export default Layout;