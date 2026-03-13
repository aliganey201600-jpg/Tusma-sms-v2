import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // refreshing the auth token with a timeout to prevent "fetch failed" crashes
  let user: any = null;
  try {
    const authPromise = supabase.auth.getUser();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error("Timeout")), 15000)
    );
    
    const { data } = await (Promise.race([authPromise, timeoutPromise]) as Promise<any>);
    user = data?.user;
  } catch (error) {
    // Silent bypass for network jitter
  }

  const url = request.nextUrl.clone();
  
  // Protect /dashboard routes
  if (url.pathname.startsWith("/dashboard")) {
    if (!user) {
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }

    const role = user.user_metadata?.role as any;
    
    // Simple RBAC check
    if (url.pathname === "/dashboard") {
       // Redirect to specific dashboard based on role
       const rolePaths: any = {
         SUPER_ADMIN: "/dashboard/super-admin",
         ADMIN: "/dashboard/admin",
         TEACHER: "/dashboard/teacher",
         STUDENT: "/dashboard/student",
         PARENT: "/dashboard/parent",
       };
       if (rolePaths[role]) {
         url.pathname = rolePaths[role];
         return NextResponse.redirect(url);
       }
    }

    // specific sub-route check
    const isAuthorized = (role: string, path: string) => {
       if (role === "SUPER_ADMIN") return true;
       if (path.startsWith("/dashboard/messages")) return true;
       if (role === "ADMIN" && path.startsWith("/dashboard/admin")) return true;
       if (role === "TEACHER" && path.startsWith("/dashboard/teacher")) return true;
       if (role === "STUDENT" && path.startsWith("/dashboard/student")) return true;
       if (role === "PARENT" && path.startsWith("/dashboard/parent")) return true;
       return false;
    };

    if (!isAuthorized(role, url.pathname)) {
       url.pathname = "/"; // Send to home if not authorized
       return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
