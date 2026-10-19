require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const db = require("./config/connection");

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Rez-Inventory");
});

// 1. GET ALL PRODUCTS (DENGAN SEARCH & SORTING)
app.get("/products", async (req, res) => {
  try {
    const { search } = req.query;

    let sql = "SELECT * FROM products";
    const params = [];

    if (search && search.trim() !== "") {
      sql += " WHERE product_name LIKE ? OR category LIKE ?";
      const pattern = `%${search.trim()}%`;
      params.push(pattern, pattern);
    }

    sql += " ORDER BY id DESC";

    const [result] = await db.query(sql, params);
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Gagal mengambil data" });
  }
});

// 2. GET PRODUCT BY ID
app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("SELECT * FROM products WHERE id = ?", [
      id,
    ]);

    if (result.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json(result[0]);
  } catch (err) {
    res.status(500).json({ message: "Gagal mengambil data" });
  }
});

// 3. CREATE PRODUCT
app.post("/products", async (req, res) => {
  try {
    const { product_name, category, stok } = req.body;

    if (!product_name || !category || stok === undefined || stok === null) {
      return res
        .status(400)
        .json({ message: "Nama produk, kategori, dan stok wajib diisi" });
    }

    const sql =
      "INSERT INTO products (product_name, category, stok) VALUES (?, ?, ?)";
    const [result] = await db.query(sql, [
      product_name.trim(),
      category,
      parseInt(stok, 10),
    ]);

    res.status(201).json({
      message: "Produk berhasil ditambahkan",
      id: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: "Gagal menambahkan produk" });
  }
});

// 4. UPDATE PRODUCT (PARTIAL VIA PATCH)
app.patch("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const allowedFields = ["product_name", "category", "stok"];
    const updates = [];
    const values = [];

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates.push(`${field} = ?`);
        values.push(
          field === "stok" ? parseInt(req.body[field], 10) : req.body[field],
        );
      }
    }

    if (updates.length === 0) {
      return res
        .status(400)
        .json({ message: "Tidak ada field yang dikirim untuk diupdate" });
    }

    values.push(id);
    const sql = `UPDATE products SET ${updates.join(", ")} WHERE id = ?`;
    const [result] = await db.query(sql, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil diperbarui" });
  } catch (err) {
    res.status(500).json({ message: "Gagal memperbarui produk" });
  }
});

// 5. DELETE PRODUCT
app.delete("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await db.query("DELETE FROM products WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }

    res.json({ message: "Produk berhasil dihapus" });
  } catch (err) {
    res.status(500).json({ message: "Gagal menghapus produk" });
  }
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
