const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkUsersViaAPI() {
  console.log("Checking users via Supabase API (Port 443)...");
  try {
    const { data, error } = await supabase
      .from('User')
      .select('email, role')
      .limit(10);

    if (error) {
       console.error("API Error:", error.message);
       return;
    }
    
    console.log("Registered Users found via API:");
    console.table(data);
  } catch (error) {
    console.error("Critical Error:", error.message);
  }
}

checkUsersViaAPI();
