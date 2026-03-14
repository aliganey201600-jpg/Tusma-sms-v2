const { Client } = require('pg');
const connectionString = "postgresql://postgres.zgiwwcngmyrnsaysgqog:635110Liiali@aws-1-eu-north-1.pooler.supabase.com:5432/postgres";

const client = new Client({
  connectionString: connectionString,
});

client.connect()
  .then(() => {
    console.log('Connected successfully');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection error', err.stack);
    process.exit(1);
  });
