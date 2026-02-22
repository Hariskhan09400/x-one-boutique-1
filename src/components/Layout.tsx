import { ReactNode } from "react";

interface LayoutProps {
  children: ReactNode;
  cartItemCount: number;
  onCartOpen: () => void;
  showToast: boolean;
}

const Layout = ({
  children,
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#020617] text-black dark:text-white transition-colors duration-300">
      
      {/* Saara extra logic (Header, Footer, Toast, WhatsApp) 
         humne yahan se hata diya hai kyunki wo App.tsx mein handle ho raha hai.
      */}

      <main>
        {children}
      </main>

    </div>
  );
};

export default Layout;