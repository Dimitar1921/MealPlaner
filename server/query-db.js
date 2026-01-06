const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database', 'nutrition.db');

// Get SQL query from command line arguments
const query = process.argv.slice(2).join(' ');

if (!query) {
  console.error('Usage: node query-db.js "SELECT * FROM Meals;"');
  console.error('   or: node query-db.js "SELECT * FROM Users;"');
  process.exit(1);
}

// Open database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
    process.exit(1);
  }
});

// Execute query
db.all(query, [], (err, rows) => {
  if (err) {
    console.error('Error executing query:', err.message);
    db.close();
    process.exit(1);
  }

  // Display results
  if (rows.length === 0) {
    console.log('No results found.');
  } else {
    console.log(`\nFound ${rows.length} row(s):\n`);
    console.table(rows);
  }

  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    }
    process.exit(0);
  });
});

