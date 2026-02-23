import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState<boolean>(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      className="
        flex items-center justify-center
        px-4 py-2 rounded-xl
        bg-slate-100 dark:bg-slate-800 
        text-slate-900 dark:text-white
        transition-all duration-300 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600
        border border-slate-200 dark:border-slate-700
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