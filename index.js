
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// MongoDB connection string (replace with your Render environment variable)
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Failed to connect to MongoDB", err));

// Define a schema for product data
const ProductSchema = new mongoose.Schema({
  productId: String,
  productUrl: String,
  tag: String,
  timestamp: Date,
});

const Product = mongoose.model("Product", ProductSchema);

// POST route to log product data
app.post("/api/log-product", async (req, res) => {
  const { productId, productUrl, tag, timestamp } = req.body;

  if (!productId || !productUrl || !tag) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const product = new Product({ productId, productUrl, tag, timestamp });
    await product.save();
    res.status(201).json({ message: "Product logged successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error saving product data" });
  }
});

// GET route to fetch logged products
app.get("/api/get-products", async (req, res) => {
  try {
    const products = await Product.find().sort({ timestamp: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product data" });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
