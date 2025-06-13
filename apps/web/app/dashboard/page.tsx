"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Camera, Database, Users, Settings, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AppNavigation } from "@/components/AppNavigation";
import { useSession } from "next-auth/react";

export default function DashboardPage() {
  const { data: session } = useSession();

  const dashboardCards = [
    {
      title: "Mark Attendance",
      description:
        "Upload group photos and automatically track attendance using facial recognition technology",
      href: "/attendance",
      icon: Camera,
    },
    {
      title: "Dataset Management",
      description:
        "Manage face recognition datasets, add new faces, and update existing profiles",
      href: "/datasets",
      icon: Database,
    },
    {
      title: "Analytics",
      description:
        "View attendance analytics, attendance by date, and attendance by person",
      href: "/analytics",
      icon: BarChart3,
    },
  ];

  return (
    <div className="min-h-screen bg-black">
      <AppNavigation />
      <div className="container mx-auto px-4 py-4 sm:py-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="border border-gray-600 rounded-lg p-4 sm:p-8 mb-8 sm:mb-12 text-white"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Welcome, {session?.user?.name || "User"}!
              </h1>
              <p className="text-blue-100 text-base sm:text-lg">
                Manage your attendance system and facial recognition datasets
                from one place
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8 mx-auto">
          {dashboardCards.map((card, index) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
            >
              <Link href={card.href}>
                <Card className="h-72 sm:h-80 w-full hover:scale-105 transition-all duration-300 cursor-pointer group bg-black border-gray-800 hover:border-gray-700">
                  <CardHeader className="pb-2 sm:pb-4">
                    <div className="flex items-center justify-between">
                      <div className="p-3 sm:p-4 rounded-xl">
                        <card.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 sm:space-y-4">
                    <div>
                      <CardTitle className="text-xl sm:text-2xl mb-2 sm:mb-3 text-white">
                        {card.title}
                      </CardTitle>
                      <p className="text-sm sm:text-base leading-relaxed text-gray-400">
                        {card.description}
                      </p>
                    </div>

                    <div className="pt-4">
                      <div className="inline-flex items-center text-sm font-medium text-white group-hover:translate-x-1 transition-transform duration-300">
                        Get Started
                        <svg
                          className="ml-2 h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
