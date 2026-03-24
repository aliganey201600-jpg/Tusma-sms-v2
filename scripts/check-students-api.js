const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkStudentsViaAPI() {
  console.log("Checking students via Supabase API...");
  try {
    const { data, error } = await supabase
      .from('Student')
      .select('firstName, lastName')
      .limit(10);

    if (error) {
       console.error("API Error:", error.message);
       return;
    }
    
    console.log("Registered Students found:");
    console.table(data);
  } catch (error) {
    console.error("Critical Error:", error.message);
  }
}

checkStudentsViaAPI();
