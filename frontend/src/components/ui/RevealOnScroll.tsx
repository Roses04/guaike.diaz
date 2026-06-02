import type { ReactNode } from "react";
import { useRevealOnScroll } from "../../hooks/useRevealOnScroll";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  stagger?: 1 | 2 | 3 | 4;
};

const RevealOnScroll = ({ children, className = "", stagger }: RevealOnScrollProps) => {
  const ref = useRevealOnScroll<HTMLDivElement>();
  const staggerClass = stagger ? `reveal-stagger-${stagger}` : "";

  return (
    <div ref={ref} className={`reveal-on-scroll ${staggerClass} ${className}`.trim()}>
      {children}
    </div>
  );
};

export default RevealOnScroll;
