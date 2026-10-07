"use client";

import { useEffect, useState } from "react";

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);

    return () =>
      window.removeEventListener("scroll", toggleVisibility);
  }, []);

  return (
    visible && (
      <button
        onClick={() =>
          window.scrollTo({
            top: 0,
            behavior: "smooth",
          })
        }
        aria-label="Scroll to top"
        className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center bg-black/60 border border-ash-500/50 hover:border-ember-400/70 text-ash-300 hover:text-bone backdrop-blur-sm hover:scale-110 transition-all duration-300"
      >
        <i className="fa-solid fa-arrow-up text-sm" />
      </button>
    )
  );
}