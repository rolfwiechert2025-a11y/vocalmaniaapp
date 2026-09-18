"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="inline-flex items-center justify-center px-4 py-2 bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold rounded-full shadow-md transition-colors cursor-pointer border border-red-500/40"
    >
      🚪 Abmelden
    </button>
  );
}