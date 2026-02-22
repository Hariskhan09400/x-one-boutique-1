import { useState, useMemo, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import { ShoppingCart, MessageCircle, Search } from 'lucide-react';
import { Product, CartItem } from './types';
import { products } from './data/products';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { Cart } from './components/Cart';
import { Hero } from './components/Hero';
import { ContactForm } from './components/ContactForm';
import ThemeToggle from "./components/ThemeToggle";
import Layout from "./components/Layout";

function App() {
  // --- STATE MANAGEMENT ---
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

  useEffect(() => {
    localStorage.setItem("xob_cart", JSON.stringify(cart));
  }, [cart]);

  // --- FILTER & SORT LOGIC ---
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

  // --- CART ACTIONS ---
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

  const removeItem = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => setCart([]);

  // --- CHECKOUT HANDLERS ---
  const handleCheckoutWhatsApp = () => {
    let message = 'Hello! I want to order:\n\n';
    cart.forEach((item) => {
      message += `• ${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    message += `\nTotal: ₹${total}`;
    window.open(`https://wa.me/917208428589?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCheckoutEmail = () => {
    let body = 'Order Details:\n\n';
    cart.forEach((item) => {
      body += `${item.name} x${item.quantity} - ₹${item.price * item.quantity}\n`;
    });
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    body += `\nTotal: ₹${total}`;
    window.location.href = `mailto:hariskhan5375123@gmail.com?subject=New Order from Website&body=${encodeURIComponent(body)}`;
  };

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Router>
      <Layout
        cartItemCount={cartItemCount}
        onCartOpen={() => setIsCartOpen(true)}
        showToast={showToast}
      >
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col min-h-screen">
                <header className="sticky top-0 z-50 transition-all duration-500 backdrop-blur-2xl bg-gradient-to-r from-[#020617]/90 via-[#0f172a]/80 to-[#020617]/90 border-b border-blue-500/10 shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
                  <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                      <a href="/" onClick={(e) => { e.preventDefault(); window.location.reload(); }} className="flex items-center gap-4 group">
                        <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full font-black text-sm shadow-lg group-hover:scale-110 transition-all duration-300">XOB</div>
                        <div className="flex flex-col">
                          <div className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-wide bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent animate-glowBreath">X ONE BOUTIQUE</div>
                          <div className="text-xs text-blue-300 font-semibold tracking-widest mt-1 opacity-80">Redefining Men's Fashion</div>
                        </div>
                      </a>
                      <nav className="hidden md:flex items-center gap-8">
                        {["Shop", "About", "Contact"].map((item, index) => (
                          <a key={index} href={`#${item.toLowerCase()}`} className="relative font-semibold text-blue-200 hover:text-white transition-all duration-300 group">
                            {item}
                            <span className="absolute left-0 -bottom-1 w-0 h-[2px] bg-gradient-to-r from-blue-400 to-cyan-400 group-hover:w-full transition-all duration-400"></span>
                          </a>
                        ))}
                        <button onClick={() => setIsCartOpen(true)} className="relative flex items-center gap-2 px-5 py-2 rounded-full font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-105 transition-all duration-300 shadow-lg shadow-blue-500/30">
                          <ShoppingCart size={20} /> Cart
                          {cartItemCount > 0 && <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-bounce shadow-lg">{cartItemCount}</span>}
                        </button>
                      </nav>
                      <button onClick={() => setIsCartOpen(true)} className="md:hidden relative p-3 bg-blue-600 rounded-full shadow-lg shadow-blue-500/40">
                        <ShoppingCart size={22} />
                        {cartItemCount > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">{cartItemCount}</span>}
                      </button>
                    </div>
                  </div>
                </header>

                <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                  <Hero onCategoryClick={setCategoryFilter} />
                  <section id="shop" className="mt-4 sm:mt-6 md:mt-8 space-y-12 sm:space-y-16 md:space-y-20">
                    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 sm:pl-12 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none transition-all" />
                      </div>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600">
                        <option value="pop">Sort: Popular</option>
                        <option value="low">Price: Low → High</option>
                        <option value="high">Price: High → Low</option>
                        <option value="az">Name: A → Z</option>
                      </select>
                    </div>
                    {categoryFilter === "All" ? (
                      <div>
                        <h2 className="text-2xl font-bold mb-6">All Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredAndSortedProducts.map((p) => (<ProductCard key={p.id} product={p} onAddToCart={addToCart} onOpenModal={setSelectedProduct} />))}
                        </div>
                      </div>
                    ) : (
                      <>
                        {[{ id: "jeans", label: "Jeans" }, { id: "Kurta", label: "Kurta" }].map((s) => (
                          <div key={s.id} id={s.id} className="scroll-mt-20">
                            <h2 className="text-2xl font-bold mb-6">{s.label}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {filteredAndSortedProducts.filter(p => p.category === s.label).map(p => (<ProductCard key={p.id} product={p} onAddToCart={addToCart} onOpenModal={setSelectedProduct} />))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </section>
                  <ContactForm />
                </main>
                <footer className="mt-8 border-t border-gray-800 bg-gray-950 p-8 text-center text-gray-400">
                  <p>© 2025 X One Boutique. All rights reserved.</p>
                </footer>
              </div>
            }
          />
          <Route path="/product/:id" element={<ProductPage onAddToCart={addToCart} />} />
          <Route path="/checkout" element={<CheckoutPage cart={cart} onClearCart={clearCart} />} />
        </Routes>

        {/* --- FLOATING CONTROLS (FIXED POSITIONS) --- */}
        
        {/* 1. Theme Toggle (Stacked Above WhatsApp) */}
        <div className="fixed left-4 bottom-20 sm:bottom-24 z-50">
           <ThemeToggle />
        </div>

        {/* 2. WhatsApp Button (Bottom Left) */}
        <a
          href="https://wa.me/917208428589"
          target="_blank"
          rel="noopener noreferrer"
          className="fixed left-3 bottom-4 z-50 flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-full font-bold shadow-2xl transition-transform hover:scale-105 active:scale-95"
        >
          <MessageCircle size={20} />
          <span className="hidden sm:inline">WhatsApp</span>
        </a>

        {/* 3. Floating Cart Button (Bottom Right) */}
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed right-4 bottom-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingCart size={20} />
          <span className="hidden sm:inline">Cart</span>
          {cartItemCount > 0 && (
            <span className="w-6 h-6 bg-white text-blue-600 text-xs rounded-full flex items-center justify-center font-bold">
              {cartItemCount}
            </span>
          )}
        </button>

        {showToast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[100] bg-green-500 text-white px-6 py-3 rounded-full font-bold shadow-2xl animate-popIn">
            Added to cart!
          </div>
        )}

        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />}

        <Cart 
            isOpen={isCartOpen} 
            items={cart} 
            onClose={() => setIsCartOpen(false)} 
            onUpdateQuantity={updateQuantity} 
            onRemoveItem={removeItem} 
            onClearCart={clearCart} 
            onCheckoutWhatsApp={handleCheckoutWhatsApp} 
            onCheckoutEmail={handleCheckoutEmail} 
        />
      </Layout>
    </Router>
  );
}

export default App;