import { CartItem } from '../types';
import { X, Plus, Minus, Trash2, ShoppingBag, MessageCircle, Mail } from 'lucide-react';
import { useNavigate } from "react-router-dom";

interface CartProps {
  isOpen: boolean;
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onCheckoutWhatsApp: () => void;
  onCheckoutEmail: () => void;
}

export function Cart({
  isOpen,
  items,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onCheckoutWhatsApp,
  onCheckoutEmail,
}: CartProps) {

  const navigate = useNavigate();   // 🔥 NEW

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <aside
      className={`fixed top-0 right-0 w-full max-w-md h-screen bg-gradient-to-b from-gray-900/95 to-gray-950 border-l border-white/[0.08] shadow-[0_30px_120px_rgba(0,0,0,0.75)] z-50 flex flex-col transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* HEADER */}
      <header className="flex items-center justify-between p-3 sm:p-4 md:p-5 border-b border-white/[0.08] bg-gray-950/30 backdrop-blur-xl sticky top-0 z-10">
        <div className="flex items-center gap-2 sm:gap-3">
          <ShoppingBag size={20} className="text-blue-400" />
          <h2 className="text-xl sm:text-2xl font-black text-white">Your Cart</h2>
        </div>
        <button onClick={onClose}>
          <X size={20} className="text-white" />
        </button>
      </header>

      {/* CART ITEMS */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShoppingBag size={60} className="opacity-30 mb-4" />
            <p>Your cart is empty</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex gap-3 p-3 rounded-xl bg-white/5">
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg"
              />

              <div className="flex-1">
                <h3 className="font-bold text-white">{item.name}</h3>
                <p className="text-gray-400">₹{item.price}</p>

                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => onUpdateQuantity(item.id, -1)}>
                    <Minus size={14} className="text-white" />
                  </button>

                  <span className="text-white font-bold">{item.quantity}</span>

                  <button onClick={() => onUpdateQuantity(item.id, 1)}>
                    <Plus size={14} className="text-white" />
                  </button>
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <button onClick={() => onRemoveItem(item.id)}>
                  <Trash2 size={16} className="text-red-400" />
                </button>

                <p className="font-bold text-white">
                  ₹{item.price * item.quantity}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* FOOTER */}
      {items.length > 0 && (
        <footer className="p-4 border-t border-white/10 space-y-3">
          <div className="flex justify-between text-white font-bold text-lg">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          {/* 🔥 NEW PROFESSIONAL CHECKOUT BUTTON */}
          <button
            onClick={() => {
              onClose();
              navigate("/checkout");
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold"
          >
            Proceed to Checkout
          </button>

          {/* OLD OPTIONS STILL AVAILABLE */}
          <button
            onClick={onCheckoutWhatsApp}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold"
          >
            <MessageCircle size={18} className="inline mr-2" />
            Order via WhatsApp
          </button>

          <button
            onClick={onCheckoutEmail}
            className="w-full bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-xl font-bold"
          >
            <Mail size={18} className="inline mr-2" />
            Order via Email
          </button>

          <button
            onClick={onClearCart}
            className="w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl font-semibold"
          >
            Clear Cart
          </button>
        </footer>
      )}
    </aside>
  );
}