import { useCart } from "../App";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartPage = () => {
  const { cart, cartTotal, updateQuantity, removeItem, clearCart, openCart } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <ShoppingBag size={64} className="text-slate-200 dark:text-slate-700 mb-6" />
        <h2 className="text-2xl font-black uppercase italic text-slate-900 dark:text-white mb-2">
          Your Cart is Empty
        </h2>
        <p className="text-slate-400 font-medium mb-8">
          Add some products to continue shopping
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-wide hover:bg-blue-700 transition-all active:scale-95"
        >
          SHOP NOW
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-black uppercase italic dark:text-white mb-8">
        Your Cart
      </h1>
      <div className="space-y-4">
        {cart.map((item) => (
          <div
            key={item.id}
            className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-20 h-20 object-cover rounded-xl"
            />
            <div className="flex-1">
              <h4 className="font-bold dark:text-white">{item.name}</h4>
              <p className="text-blue-600 font-black text-lg">₹{item.price}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-xl px-3 py-1.5 shadow-sm">
                  <button onClick={() => updateQuantity(item.id, -1)}>
                    <Minus size={14} />
                  </button>
                  <span className="font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)}>
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
            <div className="text-right">
              <p className="font-black dark:text-white">
                ₹{item.price * item.quantity}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
        <div className="flex justify-between items-center mb-6">
          <span className="font-bold text-slate-500 uppercase text-sm">Total</span>
          <span className="text-3xl font-black dark:text-white">₹{cartTotal}</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => navigate("/")}
            className="flex-1 py-4 border-2 border-slate-200 dark:border-slate-700 text-slate-500 rounded-2xl font-black uppercase text-sm hover:border-slate-400 transition-all"
          >
            CONTINUE SHOPPING
          </button>
          <button
            onClick={openCart}
            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
          >
            CHECKOUT <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
