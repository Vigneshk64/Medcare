"use client";

import { SEVERITY_COLORS } from "@/lib/designTokens";

interface StatusBadgeProps {
  status: "active" | "completed" | "pending" | "delivered" | "danger" | "warning" | "safe" | "info";
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; classes: string; icon: string }> = {
    active: {
      label: "Active",
      classes: "bg-green-900/30 text-green-200 border border-green-700",
      icon: "🟢",
    },
    completed: {
      label: "Completed",
      classes: "bg-gray-600/30 text-gray-300 border border-gray-600",
      icon: "✓",
    },
    pending: {
      label: "Pending",
      classes: "bg-yellow-900/30 text-yellow-200 border border-yellow-700",
      icon: "⏳",
    },
    delivered: {
      label: "Delivered",
      classes: "bg-blue-900/30 text-blue-200 border border-blue-700",
      icon: "📦",
    },
    danger: {
      label: "Danger",
      classes: "bg-red-900/30 text-red-200 border border-red-700",
      icon: "🚨",
    },
    warning: {
      label: "Warning",
      classes: "bg-yellow-900/30 text-yellow-200 border border-yellow-700",
      icon: "⚠️",
    },
    safe: {
      label: "Safe",
      classes: "bg-green-900/30 text-green-200 border border-green-700",
      icon: "✅",
    },
    info: {
      label: "Info",
      classes: "bg-blue-900/30 text-blue-200 border border-blue-700",
      icon: "ℹ️",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-semibold inline-flex items-center gap-1 ${config.classes}`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
