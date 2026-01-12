"use client";

import { MinimalNavbar } from "./MinimalNavbar";

export function Header() {
  return (
    <header className="fixed top-0 left-0 right-0 w-full z-50 bg-white">
      <MinimalNavbar />
    </header>
  );
}
