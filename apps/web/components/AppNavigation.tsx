"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Home,
  Camera,
  Database,
  LogOut,
  User,
  BarChart3,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useState, useEffect } from "react";

const navigation = [
  {
    name: "Home",
    href: "/dashboard",
    icon: Home,
  },
  {
    name: "Attendance",
    href: "/attendance",
    icon: Camera,
  },
  {
    name: "Dataset",
    href: "/datasets",
    icon: Database,
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];

export function AppNavigation() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when pathname changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  if (!session) {
    return (
      <nav className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 sm:gap-3">
              <Image
                src="/assets/Dark.svg"
                alt="Facemark"
                width={28}
                height={28}
                className="sm:w-8 sm:h-8"
              />
              <span className="text-lg sm:text-xl text-white">FaceMark</span>
            </Link>
            <Link href="/auth/signin">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/20 hover:bg-white/5 text-xs sm:text-sm"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="bg-black border-b border-gray-800 relative">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center gap-2"
            >
              <Link href="/" className="flex items-center gap-2 sm:gap-3">
                <Image
                  src="/assets/Dark.svg"
                  alt="Facemark"
                  width={28}
                  height={28}
                  className="sm:w-8 sm:h-8"
                />
                <span className="text-lg sm:text-xl text-white">FaceMark</span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden md:flex items-center gap-2"
            >
              {navigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg transition-colors text-sm lg:text-base",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span className="hidden lg:inline">{item.name}</span>
                  </Link>
                );
              })}
            </motion.div>

            {/* Desktop User Menu */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:flex items-center gap-2 lg:gap-4"
            >
              {session && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white/60 hover:text-white hover:bg-white/5 text-xs lg:text-sm"
                  >
                    <User className="h-4 w-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">
                      {session.user?.name}
                    </span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="text-white/60 hover:text-white hover:bg-white/5 rounded-sm border border-gray-800 text-xs lg:text-sm"
                  >
                    <LogOut className="h-4 w-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">Sign Out</span>
                  </Button>
                </>
              )}
            </motion.div>

            {/* Mobile Hamburger Button */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="md:hidden"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMobileMenu}
                className="text-white/60 hover:text-white hover:bg-white/5 p-2"
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </motion.div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={closeMobileMenu}
            />

            {/* Mobile Menu */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-black border-l border-gray-800 z-50 md:hidden"
            >
              <div className="flex flex-col h-full">
                {/* Mobile Menu Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-800">
                  <div className="flex items-center gap-2">
                    <Image
                      src="/assets/Dark.svg"
                      alt="Facemark"
                      width={24}
                      height={24}
                    />
                    <span className="text-lg text-white">FaceMark</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeMobileMenu}
                    className="text-white/60 hover:text-white hover:bg-white/5 p-2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                {/* Mobile Navigation Links */}
                <div className="flex-1 py-4">
                  <div className="space-y-1 px-4">
                    {navigation.map((item) => {
                      const isActive = pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={closeMobileMenu}
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                            isActive
                              ? "bg-white/10 text-white"
                              : "text-white/60 hover:text-white hover:bg-white/5"
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="text-base">{item.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile User Section */}
                {session && (
                  <div className="border-t border-gray-800 p-4 space-y-3">
                    <div className="flex items-center gap-3 px-4 py-2 text-white/80">
                      <User className="h-5 w-5" />
                      <span className="text-base">{session.user?.name}</span>
                    </div>
                    <Button
                      variant="ghost"
                      onClick={() => {
                        handleSignOut();
                        closeMobileMenu();
                      }}
                      className="w-full justify-start text-white/60 hover:text-white hover:bg-white/5 px-4 py-3 h-auto"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      <span className="text-base">Sign Out</span>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
