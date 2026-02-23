import { useState, useMemo, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion"; // <-- NEW ANIMATION IMPORTS
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import LoginPage from "./pages/LoginPage"; 
import { MessageCircle, ShoppingCart, X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product, CartItem } from './types';
import { products } from './data/products';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { Hero } from './components/Hero';
import { ContactForm } from './components/ContactForm';
import ThemeToggle from "./components/ThemeToggle";
import Layout from "./components/Layout";
import Navbar from "./components/Navbar";

function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(() => {
    const savedUser = localStorage.getItem("xob_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const savedCart = localStorage.getItem("xob_cart");
    return savedCart ? JSON.parse(savedCart) : [];
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'pop' | 'low' | 'high' | 'az'>('pop');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);

  const shopRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  const handleLogin = (userData: { name: string; email: string }) => {
    setUser(userData);
    localStorage.setItem("xob_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("xob_user");
  };

  useEffect(() => {
    localStorage.setItem("xob_cart", JSON.stringify(cart));
  }, [cart]);

  const handleCategoryClick = (cat: string | null) => {
    setCategoryFilter(cat);
    setTimeout(() => {
      shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const scrollToAbout = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
    if (categoryFilter && categoryFilter !== 'All') {
      filtered = filtered.filter((p) => p.category === categoryFilter);
    }
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }
    const sorted = [...filtered];
    switch (sortBy) {
      case 'low': sorted.sort((a, b) => a.price - b.price); break;
      case 'high': sorted.sort((a, b) => b.price - a.price); break;
      case 'az': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }
    return sorted;
  }, [searchQuery, sortBy, categoryFilter]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) => {
      const updated = prev.map((item) =>
        item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
      );
      return updated.filter((item) => item.quantity > 0);
    });
  };

  const removeItem = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  const handleCheckoutWhatsApp = () => {
    let message = 'Hello! I want to order:\n\n';
    cart.forEach((item) => { message += `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`; });
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message += `\nTotal: ₹${total}`;
    window.open(`https://wa.me/917208428589?text=${encodeURIComponent(message)}`, '_blank');
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Router>
      <Layout cartItemCount={cartItemCount} onCartOpen={() => setIsCartOpen(true)} showToast={showToast}>
        
        <Navbar 
          user={user}
          onLogout={handleLogout}
          cartItemCount={cartItemCount} 
          onCartOpen={() => setIsCartOpen(true)}
          onShopClick={() => handleCategoryClick(null)}
          onAboutClick={scrollToAbout}
        />

        <Routes>
          <Route path="/" element={
            <div className="flex flex-col min-h-screen">
              <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                <Hero onCategoryClick={handleCategoryClick} />
                <section ref={shopRef} id="shop" className="mt-4 scroll-mt-24 space-y-12">
                  <div className="flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none"
                      />
                      {categoryFilter && (
                        <button onClick={() => setCategoryFilter(null)} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 font-bold">X</button>
                      )}
                    </div>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300"
                    >
                      <option value="pop">Sort: Popular</option>
                      <option value="low">Price: Low → High</option>
                      <option value="high">Price: High → Low</option>
                      <option value="az">Name: A → Z</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredAndSortedProducts.map(p => (
                      <ProductCard key={p.id} product={p} onAddToCart={addToCart} onOpenModal={setSelectedProduct} />
                    ))}
                  </div>
                </section>
                <section ref={aboutRef} id="about" className="mt-20 py-12 border-t dark:border-gray-800">
                  <h2 className="text-3xl font-bold mb-4">About X One Boutique</h2>
                  <p className="text-gray-600 dark:text-gray-400">Premium menswear destination.</p>
                </section>
                <div id="contact"><ContactForm /></div>
              </main>
            </div>
          } />
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/product/:id" element={<ProductPage onAddToCart={addToCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} onClearCart={clearCart} />} />
        </Routes>

        {/* --- FLOATING BUTTONS --- */}
        <div className="fixed left-4 bottom-20 z-50"><ThemeToggle /></div>
        <a href="https://wa.me/917208428589" className="fixed left-3 bottom-4 z-50 bg-green-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform"><MessageCircle size={24} /></a>
        <button onClick={() => setIsCartOpen(true)} className="fixed right-4 bottom-4 z-50 flex items-center gap-2 px-5 py-4 rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-all active:scale-95">
          <ShoppingCart size={24} />
          {cartItemCount > 0 && <span className="bg-white text-blue-600 px-2 rounded-full text-xs font-black">{cartItemCount}</span>}
        </button>

        {/* --- SMOOTH ANIMATED CART --- */}
        <AnimatePresence>
          {isCartOpen && (
            <div className="fixed inset-0 z-[200] flex justify-end">
              {/* Animated Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" 
                onClick={() => setIsCartOpen(false)} 
              />

              {/* Animated Sidebar */}
              <motion.div 
                initial={{ x: "100%" }} // Start from right
                animate={{ x: 0 }}      // Slide to center
                exit={{ x: "100%" }}    // Slide back to right
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full shadow-2xl flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="p-6 border-b dark:border-slate-800 flex items-center justify-between">
                  <button 
                    onClick={() => setIsCartOpen(false)}
                    className="flex items-center gap-1 text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <ArrowRight size={20} className="rotate-180" />
                    <span className="font-bold text-xs uppercase tracking-widest">Back</span>
                  </button>
                  <h2 className="text-xl font-black dark:text-white uppercase tracking-tighter">My Cart</h2>
                  <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-red-500">
                    <X size={24} />
                  </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                      <ShoppingBag size={60} className="mb-4" />
                      <p className="font-bold">Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex gap-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl">
                        <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-xl" />
                        <div className="flex-1">
                          <h4 className="font-bold text-sm dark:text-white">{item.name}</h4>
                          <p className="text-blue-600 font-black">₹{item.price}</p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 rounded-lg px-2 py-1 border dark:border-slate-700">
                              <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 hover:text-blue-500"><Minus size={14} /></button>
                              <span className="font-bold text-sm dark:text-white">{item.quantity}</span>
                              <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 hover:text-blue-500"><Plus size={14} /></button>
                            </div>
                            <button onClick={() => removeItem(item.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18} /></button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer */}
                {cart.length > 0 && (
                  <div className="p-6 border-t dark:border-slate-800 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Total Amount</span>
                      <span className="text-2xl font-black dark:text-white">₹{cartTotal}</span>
                    </div>
                    <button
                      onClick={handleCheckoutWhatsApp}
                      className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      ORDER VIA WHATSAPP <ArrowRight size={18} />
                    </button>
                    <button onClick={clearCart} className="w-full text-center text-slate-400 hover:text-red-500 text-xs font-bold uppercase tracking-widest">Clear Cart</button>
                  </div>
                )}
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />}
      </Layout>
    </Router>
  );
}

export default App;