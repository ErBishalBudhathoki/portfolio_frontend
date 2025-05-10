"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

// Define the navLinks outside of components to ensure consistency
const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Projects" },
  { href: "/skills", label: "Skills" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Only run client-side code after component mounts
  useEffect(() => {
    setMounted(true);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled && mounted
          ? "bg-background/90 backdrop-blur-md shadow-md border-b border-border dark:border-[#293563]"
          : "bg-background"
      }`}
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-foreground">
          <span className="text-accent-foreground">Bishal</span> Budhathoki
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => 
            link.label === "Contact" ? (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 px-4 py-2 rounded-md transition-colors shadow-md"
              >
                {link.label}
              </Link>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-accent-foreground transition-colors rounded-md px-3 py-2 hover:bg-foreground/5"
              >
                {link.label}
              </Link>
            )
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Toggle */}
        <div className="md:hidden flex items-center">
          <ThemeToggle />
          <button
            onClick={toggleMenu}
            className="p-2 ml-3 text-muted-foreground hover:text-foreground"
            aria-label="Toggle Menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Only render on client after mount */}
      {mounted && isOpen && (
        <div className="md:hidden bg-card dark:bg-[#14183e] border-t border-border dark:border-[#293563]">
          <div className="container mx-auto px-4 py-3 flex flex-col space-y-3">
            {navLinks.map((link) => 
              link.label === "Contact" ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium py-2 mt-2 mb-1 text-primary-foreground bg-primary hover:bg-primary/90 px-4 rounded-md transition-colors inline-block"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ) : (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium py-2 px-3 text-muted-foreground hover:text-accent-foreground transition-colors rounded-md hover:bg-foreground/5"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      )}
    </header>
  );
} 