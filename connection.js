import pkg from 'pg';
const { Pool } = pkg;

const config = {
  user: 'duckate',
  host: 'localhost',
  database: 'telegram',
  password: '123456', // mock data - you can you it too :p
  port: 5432, // Порт, на котором работает PostgreSQL (обычно 5432)
};


// var types = pkg.types;
// types.setTypeParser(20, function(val) {
//   return parseInt(val, 10)
// })

export const pool = new Pool(config);
