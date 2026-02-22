import { useState, useMemo, useEffect, useRef } from "react"; // useRef add kiya
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductPage from "./pages/ProductPage";
import CheckoutPage from "./pages/CheckoutPage";
import { ShoppingCart, MessageCircle, Search, X } from 'lucide-react';
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

  // --- REFS FOR JUMPING ---
  const shopRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem("xob_cart", JSON.stringify(cart));
  }, [cart]);

  // --- GET ALL UNIQUE CATEGORIES DYNAMICALLY ---
  const allCategories = useMemo(() => {
    return Array.from(new Set(products.map(p => p.category)));
  }, []);

  // --- SMART CLICK HANDLER ---
  const handleCategoryClick = (cat: string | null) => {
    setCategoryFilter(cat);
    // 100ms wait taaki React filter kar le, phir scroll kare
    setTimeout(() => {
      shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const scrollToAbout = (e: React.MouseEvent) => {
    e.preventDefault();
    aboutRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

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

  return (
    <Router>
      <Layout cartItemCount={cartItemCount} onCartOpen={() => setIsCartOpen(true)} showToast={showToast}>
        <Routes>
          <Route
            path="/"
            element={
              <div className="flex flex-col min-h-screen">
                {/* --- HEADER --- */}
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
                        <button onClick={() => handleCategoryClick(null)} className="font-semibold text-blue-200 hover:text-white transition-all">Shop</button>
                        <a href="#about" onClick={scrollToAbout} className="font-semibold text-blue-200 hover:text-white transition-all">About</a>
                        <a href="#contact" className="font-semibold text-blue-200 hover:text-white transition-all">Contact</a>
                        <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 px-5 py-2 rounded-full font-bold bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg">
                          <ShoppingCart size={20} /> Cart
                        </button>
                      </nav>
                    </div>
                  </div>
                </header>

                <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
                  {/* Hero now triggers Jump + Filter */}
                  <Hero onCategoryClick={handleCategoryClick} />
                  
                  <section ref={shopRef} id="shop" className="mt-4 scroll-mt-24 space-y-12 sm:space-y-16">
                    {/* --- SEARCH & SORT --- */}
                    <div className="flex flex-col md:flex-row gap-3 sm:gap-4 mb-4">
                      <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input type="text" placeholder="Search products..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-black dark:text-white border border-gray-300 dark:border-gray-600 focus:outline-none" />
                        {categoryFilter && (
                           <button onClick={() => setCategoryFilter(null)} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500"><X size={18}/></button>
                        )}
                      </div>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value as any)} className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300">
                        <option value="pop">Sort: Popular</option>
                        <option value="low">Price: Low → High</option>
                        <option value="high">Price: High → Low</option>
                        <option value="az">Name: A → Z</option>
                      </select>
                    </div>

                    {/* --- DYNAMIC LOGIC --- */}
                    {(!categoryFilter || categoryFilter === "All") ? (
                      <div className="space-y-16">
                        {allCategories.map((catName) => (
                          <div key={catName}>
                            <h2 className="text-2xl font-bold mb-6 border-l-4 border-blue-500 pl-3">{catName}</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                              {filteredAndSortedProducts.filter(p => p.category === catName).map(p => (
                                <ProductCard key={p.id} product={p} onAddToCart={addToCart} onOpenModal={setSelectedProduct} />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-3xl font-black uppercase italic text-blue-500">{categoryFilter} Collection</h2>
                          <button onClick={() => setCategoryFilter(null)} className="text-sm font-bold underline">Show All</button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                          {filteredAndSortedProducts.map(p => (
                            <ProductCard key={p.id} product={p} onAddToCart={addToCart} onOpenModal={setSelectedProduct} />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {/* --- ABOUT SECTION --- */}
                  <section ref={aboutRef} id="about" className="mt-20 py-12 border-t border-gray-200 dark:border-gray-800">
                    <h2 className="text-3xl font-bold mb-4">About X One Boutique</h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-3xl">
                      Welcome to X One Boutique, your ultimate destination for premium menswear. We specialize in high-quality Jeans, Kurtas, and accessories designed for the modern man. Our mission is to provide style and comfort at an affordable price.
                    </p>
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

        {/* --- FLOATING UI --- */}
        <div className="fixed left-4 bottom-20 sm:bottom-24 z-50"><ThemeToggle /></div>
        <a href="https://wa.me/917208428589" target="_blank" rel="noopener noreferrer" className="fixed left-3 bottom-4 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-3 rounded-full font-bold shadow-2xl">
          <MessageCircle size={20} /> <span className="hidden sm:inline">WhatsApp</span>
        </a>
        <button onClick={() => setIsCartOpen(true)} className="fixed right-4 bottom-4 z-50 flex items-center gap-2 px-4 py-3 rounded-full font-bold bg-blue-600 text-white shadow-lg">
          <ShoppingCart size={20} /> <span className="hidden sm:inline">Cart</span>
          {cartItemCount > 0 && <span className="ml-1 bg-white text-blue-600 px-2 rounded-full text-xs">{cartItemCount}</span>}
        </button>

        {selectedProduct && <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} onAddToCart={addToCart} />}
        <Cart isOpen={isCartOpen} items={cart} onClose={() => setIsCartOpen(false)} onUpdateQuantity={updateQuantity} onRemoveItem={removeItem} onClearCart={clearCart} onCheckoutWhatsApp={handleCheckoutWhatsApp} onCheckoutEmail={() => {}} />
      </Layout>
    </Router>
  );
}

export default App;