const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log("Testing Supabase Connection...");
console.log("URL:", url);
console.log("Key format check:", key ? (key.startsWith("eyJ") ? "Valid JWT" : "Strange format") : "Missing");

async function test() {
  try {
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`
      }
    });
    console.log("Status:", res.status);
    const data = await res.json();
    console.log("Data:", data);
  } catch (error) {
    console.error("Fetch failed:", error.message);
  }
}

test();
