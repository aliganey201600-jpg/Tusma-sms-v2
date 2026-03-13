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

export default function SignUpPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("first-name") as string;
    const lastName = formData.get("last-name") as string;
    const role = formData.get("role") as string;

    try {
      console.log("Attempting signup for:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            role: role,
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        console.error("Signup error:", error.message);
        toast.error(error.message);
        return;
      }

      console.log("Signup raw response:", data);

      if (data.user) {
        if (data.session) {
           console.log("User signed up and session created immediately.");
           toast.success("Account created and logged in!");
           router.push("/dashboard");
        } else {
           console.log("User signed up, but email confirmation is required.");
           toast.success("Account created! PLEASE CHECK YOUR EMAIL TO CONFIRM.");
           router.push("/sign-in");
        }
      } else {
        console.warn("No user object returned from Supabase.");
      }
    } catch (err) {
      console.error("Unexpected signup error:", err);
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        toast.error("Network error: Fadlan hubi internet-kaaga.");
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
          <CardTitle className="text-3xl font-bold tracking-tight">Create an Account</CardTitle>
          <CardDescription className="text-base">
            Sign up to access your Tusmo School Portal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first-name">First Name</Label>
                <Input 
                  id="first-name" 
                  name="first-name"
                  placeholder="John" 
                  required 
                  className="h-12 bg-slate-50 dark:bg-slate-900 px-4" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="last-name">Last Name</Label>
                <Input 
                  id="last-name" 
                  name="last-name"
                  placeholder="Doe" 
                  required 
                  className="h-12 bg-slate-50 dark:bg-slate-900 px-4" 
                />
              </div>
            </div>
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
              <Label htmlFor="password" className="text-sm font-medium">Password</Label>
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
            <div className="space-y-2">
              <Label htmlFor="role" className="text-sm font-medium">I am a...</Label>
              <select 
                id="role" 
                name="role"
                required 
                defaultValue=""
                className="flex h-12 w-full items-center justify-between rounded-md border border-input bg-slate-50 dark:bg-slate-900 px-4 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="" disabled hidden>Select your role</option>
                <option value="STUDENT">Student</option>
                <option value="PARENT">Parent</option>
                <option value="TEACHER">Teacher</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <div className="pt-4">
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-12 text-base rounded-xl font-semibold shadow-md"
              >
                {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Create Account"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center border-t pt-8 mt-2">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-primary hover:underline font-semibold">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </div>
  );
}
