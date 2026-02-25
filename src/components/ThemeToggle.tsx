import { useEffect, useState } from "react";

const ThemeToggle = () => {
  // Initial state hamesha localStorage se lo taaki flash na ho
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark";
  });

  useEffect(() => {
    // Sirf class update karne ke liye
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  // Naya click handler jo event ko rokega
  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation(); // Ye line 3-dot menu wali problem fix karegi
    setDarkMode(!darkMode);
  };

  return (
    <button
      type="button" // Safe side ke liye
      onClick={handleToggle}
      // Mobile touch users ke liye event propagation yahan bhi rokein
      onPointerDown={(e) => e.stopPropagation()} 
      className="
        flex items-center justify-center
        px-4 py-2 rounded-xl
        bg-slate-100 dark:bg-slate-800 
        text-slate-900 dark:text-white
        transition-all duration-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600
        border border-slate-200 dark:border-slate-700
        active:scale-95
      "
    >
      <span className="text-lg">{darkMode ? "☀️" : "🌙"}</span>
      <span className="font-bold ml-2 text-sm uppercase tracking-wider">
        {darkMode ? "Light" : "Dark"}
      </span>
    </button>
  );
};

export default ThemeToggle;