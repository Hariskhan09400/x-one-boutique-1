// src/pages/HomePage.tsx
import { useState, useMemo, useRef } from "react";
import { Hero } from "../components/Hero";
import { ContactForm } from "../components/ContactForm";
import { ProductCard } from "../components/ProductCard";
import { ProductModal } from "../components/ProductModal";
import { products } from "../data/products";
import { useCart } from "../App";
import type { Product } from "../types";

const HomePage = () => {
  const { addToCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'pop'|'low'|'high'|'az'>('pop');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const shopRef = useRef<HTMLDivElement>(null);

  const handleCategoryClick = (cat: string | null) => {
    setCategoryFilter(cat);
    setTimeout(() => {
      shopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products;
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
      case 'low': sorted.sort((a, b) => a.price - b.price); break;
      case 'high': sorted.sort((a, b) => b.price - a.price); break;
      case 'az': sorted.sort((a, b) => a.name.localeCompare(b.name)); break;
    }
    return sorted;
  }, [searchQuery, sortBy, categoryFilter]);

  return (
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
        </section>
        <div id="contact" className="mt-20">
          <ContactForm />
        </div>
      </main>
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={addToCart}
        />
      )}
    </div>
  );
};

export default HomePage;