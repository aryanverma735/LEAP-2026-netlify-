"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-primary text-primary-foreground shadow-md relative">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-2xl font-bold hover:text-white transition-colors">
              LEAP
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-primary-foreground/10 transition-colors"
            onClick={toggleMenu}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Desktop navigation */}
          <ul className="hidden md:flex items-center space-x-1">
            <NavItem href="/" label="Submit Idea" />
            <NavItem href="/manager" label="Business Analyst Review" />
            <NavItem href="/approved" label="Approved Ideas" />
            <NavItem href="/rejected" label="Rejected Ideas" />
            <NavItem href="/all-ideas" label="All Ideas" />
            <NavItem href="/dashboard" label="Dashboard" />
          </ul>
        </nav>
      </div>

      {/* Mobile navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-primary z-50 shadow-lg fade-in">
          <ul className="flex flex-col py-2">
            <MobileNavItem href="/" label="Submit Idea" onClick={toggleMenu} />
            <MobileNavItem href="/manager" label="Business Analyst Review" onClick={toggleMenu} />
            <MobileNavItem href="/approved" label="Approved Ideas" onClick={toggleMenu} />
            <MobileNavItem href="/rejected" label="Rejected Ideas" onClick={toggleMenu} />
            <MobileNavItem href="/all-ideas" label="All Ideas" onClick={toggleMenu} />
            <MobileNavItem href="/dashboard" label="Dashboard" onClick={toggleMenu} />
          </ul>
        </div>
      )}
    </header>
  )
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
      >
        {label}
      </Link>
    </li>
  )
}

function MobileNavItem({ href, label, onClick }: { href: string; label: string; onClick: () => void }) {
  return (
    <li>
      <Link
        href={href}
        className="block px-4 py-3 text-sm font-medium hover:bg-primary-foreground/10 transition-colors"
        onClick={onClick}
      >
        {label}
      </Link>
    </li>
  )
}
