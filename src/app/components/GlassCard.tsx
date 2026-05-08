"use client";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export default function GlassCard({
  children,
  className = "",
  hover = true,
}: GlassCardProps) {
  const hoverClass = hover ? "hover:scale-105 transition-all duration-300 transform" : "";

  return (
    <div
      className={`glass-card-medical rounded-2xl p-6 ${hoverClass} ${className}`}
    >
      {children}
    </div>
  );
}
