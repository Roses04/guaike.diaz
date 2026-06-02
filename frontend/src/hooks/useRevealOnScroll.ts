import { useEffect, useRef } from "react";

type UseRevealOnScrollOptions = {
  threshold?: number;
  rootMargin?: string;
};

/** Añade `is-visible` al entrar en viewport (una sola vez). Usar con `.reveal-on-scroll`. */
export const useRevealOnScroll = <T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOnScrollOptions = {}
) => {
  const ref = useRef<T>(null);
  const { threshold = 0.12, rootMargin = "0px 0px -40px 0px" } = options;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.disconnect();
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
};
