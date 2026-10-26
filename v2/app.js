
const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

let customers = [];
let nextId = 1;

app.get("/api", (req, res) => {
  res.json({
    version: "v2",
    features: ["add", "view", "search"]
  });
});

// Add customer
app.post("/api/customers", (req, res) => {
  const { name, email, phone = "" } = req.body;

  if (
    typeof name !== "string" || !name.trim() ||
    typeof email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ||
    typeof phone !== "string"
  ) {
    return res.status(400).json({
      error: "Enter a valid name and email."
    });
  }

  const customer = {
    id: nextId++,
    name: name.trim(),
    email: email.trim(),
    phone: phone.trim()
  };

  customers.push(customer);

  res.status(201).json({
    message: "Customer added successfully",
    customer
  });
});

// View and search customers
app.get("/api/customers", (req, res) => {
  const search = String(req.query.search || "").toLowerCase();

  const result = customers.filter(customer =>
    [customer.name, customer.email, customer.phone]
      .some(value => value.toLowerCase().includes(search))
  );

  res.json(result);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CRM v2 running on port ${PORT}`);
});
