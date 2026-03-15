// src/pages/HomePage.tsx
import { useState, useMemo, useRef } from "react";
import { Hero } from "../components/Hero";
import { ProductCard } from "../components/ProductCard";
import ReviewSection from "../components/ReviewSection";
import { useCart, useAllProducts } from "../App"; // ← useAllProducts, no local products import
import type { Product } from "../types";

const HomePage = () => {
  const { addToCart } = useCart();
  const { allProducts: products } = useAllProducts(); // ← DB + local merged

  const [selectedProduct,  setSelectedProduct]  = useState<Product | null>(null);
  const [searchQuery,      setSearchQuery]       = useState('');
  const [sortBy,           setSortBy]            = useState<'pop'|'low'|'high'|'az'>('pop');
  const [categoryFilter,   setCategoryFilter]    = useState<string | null>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (cat: string | null) => {
    setCategoryFilter(cat);
    setTimeout(() => {
      shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products; // now includes DB products
    if (categoryFilter && categoryFilter !== 'All') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }
    const sorted = [...filtered];
    switch (sortBy) {
      case 'low':  sorted.sort((a, b) => a.price - b.price); break;
      case 'high': sorted.sort((a, b) => b.price - a.price); break;
      case 'az':   sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return sorted;
  }, [searchQuery, sortBy, categoryFilter, products]); // ← products in deps

  return (
    <div className="flex flex-col min-h-screen">
      <main className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">

        {/* Hero */}
        <Hero onCategoryClick={handleCategoryClick} />

        {/* Products Section */}
        <section ref={shopRef} id="shop" className="mt-4 scroll-mt-24 space-y-6">

          {/* Search + Sort */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  ✕
                </button>
              )}
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="pop">Sort: Popular</option>
              <option value="low">Price: Low → High</option>
              <option value="high">Price: High → Low</option>
              <option value="az">Name: A → Z</option>
            </select>
          </div>

          {/* Results count */}
          {(searchQuery || categoryFilter) && (
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {filteredAndSortedProducts.length} product{filteredAndSortedProducts.length !== 1 ? 's' : ''} found
              {categoryFilter ? ` in "${categoryFilter}"` : ''}
              {searchQuery ? ` for "${searchQuery}"` : ''}
            </p>
          )}

          {/* Product Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-bold text-slate-700 dark:text-slate-300 text-lg">No products found</p>
              <p className="text-slate-400 text-sm mt-1">Try a different search or category</p>
              <button
                onClick={() => { setSearchQuery(''); setCategoryFilter(null); }}
                className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {filteredAndSortedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onAddToCart={addToCart}
                  onOpenModal={setSelectedProduct}
                />
              ))}
            </div>
          )}
        </section>

        {/* Review Section */}
        <div className="mt-16" id="reviews">
          <ReviewSection productId="homepage-general" />
        </div>

      </main>
    </div>
  );
};

export default HomePage;