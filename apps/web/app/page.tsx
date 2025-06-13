"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Camera, Shield, BarChart3, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sendMetricToServer } from "@/lib/metrics";
import { AppNavigation } from "@/components/AppNavigation";
import Image from "next/image";
const features = [
  {
    icon: Camera,
    title: "Facial Recognition",
    description:
      "Advanced AI-powered face detection and recognition using RetinaFace and ArcFace technology.",
  },
  {
    icon: Database,
    title: "Dataset Management",
    description:
      "Manage face recognition datasets with precomputed embeddings and automatic model updates.",
  },
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "NextAuth.js integration for enterprise-grade security.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description:
      "Comprehensive dashboards with Prometheus metrics and Grafana visualization.",
  },
];

export default function LandingPage() {
  const handleButtonClick = (buttonType: string) => {
    sendMetricToServer("button_click", {
      button_type: buttonType,
      page: "landing",
    });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <AppNavigation />

      <main>
        <section className="container mx-auto px-4 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="flex justify-center"
            >
              <Image
                src="/assets/Dark.svg"
                alt="Facemark"
                width={200}
                height={200}
                className="mb-8"
              />
            </motion.div>
            <h1 className="text-7xl font-bold mb-6">FaceMark</h1>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              Advanced facial recognition technology for seamless group
              attendance tracking. Secure, accurate, and efficient monitoring
              for modern organizations.
            </p>
            <div className="space-x-4">
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => handleButtonClick("get_started")}
                >
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/signin">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-white/20 text-white hover:bg-white/5"
                  onClick={() => handleButtonClick("view_dashboard")}
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Why Choose Facemark?</h2>
            <p className="text-white/60 max-w-2xl mx-auto">
              FaceMark is a facial recognition attendance system that provides
              reliable, secure, and scalable attendance solutions.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * index }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow bg-white/5 border-white/10">
                  <CardHeader>
                    <feature.icon className="h-12 w-12 mb-4 text-white/60" />
                    <CardTitle className="text-xl text-white">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base text-white/60">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="bg-gray-950 py-20">
          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
              <p className="text-white/60 mb-8 max-w-xl mx-auto">
                Join thousands of organizations using Facemark for efficient
                attendance management.
              </p>
              <Link href="/auth/signin">
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-white/90"
                  onClick={() => handleButtonClick("cta_sign_up")}
                >
                  Start Tracking Today
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/10 py-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="container mx-auto px-4 text-center text-white/60"
        >
          <p>
            &copy; {new Date().getFullYear()} Facemark. All rights reserved.
            Made By{" "}
            <a href="https://hsanirudh.tech" className="text-white">
              Anirudh H S
            </a>
          </p>
        </motion.div>
      </footer>
    </div>
  );
}
