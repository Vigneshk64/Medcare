"use client";

import { ROLE_COLORS, type Role } from "@/lib/designTokens";

interface RoleColorBadgeProps {
  role: Role;
  size?: "sm" | "md" | "lg";
}

export default function RoleColorBadge({ role, size = "md" }: RoleColorBadgeProps) {
  const roleColor = ROLE_COLORS[role];
  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`${sizeClasses[size]} rounded-full font-semibold text-white border inline-flex items-center gap-2`}
      style={{
        backgroundColor: `${roleColor.primary}40`,
        borderColor: roleColor.primary,
        color: "white",
      }}
    >
      {role === "patient" && "👤"}
      {role === "doctor" && "👨‍⚕️"}
      {role === "pharmacist" && "💊"}
      {role === "delivery" && "🚚"}
      {role === "admin" && "👔"}
      <span className="capitalize">{roleColor.name}</span>
    </span>
  );
}
