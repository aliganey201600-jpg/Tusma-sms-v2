const { Client } = require('pg');

async function testConnection() {
  // Try Pooler via IP
  const connectionString = "postgresql://postgres.zgiwwcngmyrnsaysgqog:635110Liiali@13.60.102.132:6543/postgres";
  const client = new Client({ connectionString, connectionTimeoutMillis: 10000 });

  console.log("Attempting to connect to Pooler IP 13.60.102.132:6543...");
  try {
    await client.connect();
    console.log("Successfully connected to the database pooler!");
    const res = await client.query('SELECT 1 as connected');
    console.log("Result:", res.rows[0]);
    await client.end();
  } catch (err) {
    console.error("Pooler Connection error:", err.message);
    
    // Fallback: Try Direct via IPv6 hostname (if supported) or other IP
    console.log("\nAttempting to connect to Direct Hostname...");
    const clientDirect = new Client({ 
      connectionString: "postgresql://postgres:635110Liiali@db.zgiwwcngmyrnsaysgqog.supabase.co:5432/postgres",
      connectionTimeoutMillis: 10000 
    });
    try {
        await clientDirect.connect();
        console.log("Successfully connected to Direct Host!");
        await clientDirect.end();
    } catch (err2) {
        console.error("Direct Connection error:", err2.message);
    }
  }
}

testConnection();
