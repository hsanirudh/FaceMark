"use client";

import { motion } from "framer-motion";
import { signIn, getSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { authEventCounter } from "@/lib/prometheus";

export default function SignInPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const session = await getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkSession();
  }, [router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);

    // Track auth event
    authEventCounter.inc({ event_type: "signin_attempt", provider: "google" });

    try {
      const result = await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: false,
      });

      if (result?.error) {
        authEventCounter.inc({
          event_type: "signin_error",
          provider: "google",
        });
        toast.error("Sign in failed. Please try again.");
        setIsLoading(false);
      } else if (result?.url) {
        authEventCounter.inc({
          event_type: "signin_success",
          provider: "google",
        });
        toast.success("Successfully signed in! Redirecting to dashboard...");
        window.location.href = result.url;
      }
    } catch (error) {
      console.error("Sign in error:", error);
      authEventCounter.inc({ event_type: "signin_error", provider: "google" });
      toast.error("Sign in failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="mb-6 sm:mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-4"
          >
            <h1 className="text-2xl sm:text-3xl font-bold">
              Welcome to Facemark
            </h1>
          </motion.div>
          <p className="text-sm sm:text-base text-gray-400">
            Sign in to access your attendance dashboard
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle>Sign In</CardTitle>
              <CardDescription>
                Use your Google account to continue
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2"
                size="lg"
              >
                {isLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              <div className="text-center">
                <Link href="/">
                  <Button variant="ghost" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    Back to Home
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 sm:mt-8 text-center text-xs sm:text-sm text-gray-400 px-2"
        >
          <p>
            By signing in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-white">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-white">
              Privacy Policy
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
