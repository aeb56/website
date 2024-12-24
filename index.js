const express = require("express");
const { Pool } = require("pg");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// Connect to PostgreSQL using the DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // Required for hosted PostgreSQL
  },
});

// Create a table for storing product data if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    product_id VARCHAR(255),
    product_url TEXT,
    tag VARCHAR(255),
    timestamp TIMESTAMP
  );
`;
pool.query(createTableQuery)
  .then(() => console.log("Table created or already exists"))
  .catch((err) => console.error("Error creating table", err));

// POST route to log product data
app.post("/api/log-product", async (req, res) => {
  const { productId, productUrl, tag, timestamp } = req.body;

  if (!productId || !productUrl || !tag) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const query = `
      INSERT INTO products (product_id, product_url, tag, timestamp)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [productId, productUrl, tag, timestamp || new Date()];
    const result = await pool.query(query, values);
    res.status(201).json({ message: "Product logged successfully", product: result.rows[0] });
  } catch (error) {
    console.error("Error logging product data", error);
    res.status(500).json({ error: "Error saving product data" });
  }
});

// GET route to fetch logged products
app.get("/api/get-products", async (req, res) => {
  try {
    const query = "SELECT * FROM products ORDER BY timestamp DESC;";
    const result = await pool.query(query);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error fetching product data", error);
    res.status(500).json({ error: "Error fetching product data" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
