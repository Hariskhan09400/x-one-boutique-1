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
      fixed left-3 bottom-[72px] z-30
      flex items-center justify-center
      w-12 h-12 sm:w-auto sm:h-auto
      sm:px-4 sm:py-2
      rounded-full
      bg-blue-600 text-white
      dark:bg-white dark:text-black
      shadow-2xl
      transition-all duration-300 hover:scale-105
    "
  >
    {/* ICON */}
    <span className="text-xl">
      {darkMode ? "☀️" : "🌙"}
    </span>

    {/* TEXT only desktop */}
    <span className="hidden sm:inline font-semibold ml-2">
      {darkMode ? "Light Mode" : "Dark Mode"}
    </span>
  </button>
  );
};

export default ThemeToggle;
