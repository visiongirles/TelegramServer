import pkg from 'pg';
const { Pool } = pkg;

const config = {
  user: 'duckate',
  host: 'localhost',
  database: 'telegram',
  password: '123456',
  port: 5432, // Порт, на котором работает PostgreSQL (обычно 5432)
};

export const pool = new Pool(config);

pool.query('SELECT * FROM users', (err, result) => {
  if (err) {
    console.error('Error executing query', err);
    return;
  }

  console.log('Query result:', result.rows);
});
