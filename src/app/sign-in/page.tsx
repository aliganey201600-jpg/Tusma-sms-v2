"use client"

import * as React from "react"
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Eye, EyeOff } from "lucide-react";

const supabase = createClient();

export default function SignInPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        if (error.message.includes("Invalid login credentials")) {
          toast.error("Email ama Password-ka ayaa khaldan.");
        } else if (error.message.includes("Email not confirmed")) {
          toast.error("Email-kaaga weli lama xaqiijin. Fadlan hubi email-kaaga.");
        } else {
          toast.error(error.message);
        }
        return;
      }

      if (data.user) {
        toast.success("Kusoo dhawaaw! Waxaad gashay Dashboard-ka.");
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Sign in error:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        toast.error("Network error: Fadlan hubi internet-kaaga ama server-ka ayaa hooseeya.");
      } else {
        toast.error("An unexpected error occurred. Fadlan mar kale isku day.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4 bg-slate-50 dark:bg-slate-950">
      <Card className="w-full max-w-lg border-none shadow-2xl rounded-3xl p-4 sm:p-6 bg-background">
        <CardHeader className="space-y-2 text-center pb-8">
          <CardTitle className="text-3xl font-bold tracking-tight">Welcome back</CardTitle>
          <CardDescription className="text-base">
            Enter your email and password to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
              <Input 
                id="email" 
                name="email"
                type="email" 
                placeholder="name@example.com" 
                required 
                className="h-12 bg-slate-50 dark:bg-slate-900 px-4"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Link href="#" className="text-sm text-primary hover:underline font-medium">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required 
                  className="h-12 bg-slate-50 dark:bg-slate-900 px-4 pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 text-base rounded-xl font-semibold shadow-md"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Sign In"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-8 mt-2">
          <div className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-primary hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </CardFooter>
      </Card>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
