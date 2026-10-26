
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
    version: "v3",
    features: ["add", "view", "search", "update"]
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

  res.json(customers.filter(customer =>
    [customer.name, customer.email, customer.phone]
      .some(value => value.toLowerCase().includes(search))
  ));
});

// Update customer
app.put("/api/customers/:id", (req, res) => {
  const customer = customers.find(
    item => item.id === Number(req.params.id)
  );

  if (!customer) {
    return res.status(404).json({
      error: "Customer not found."
    });
  }

  const { name, email, phone } = req.body;

  if (
    (name !== undefined &&
      (typeof name !== "string" || !name.trim())) ||
    (email !== undefined &&
      (typeof email !== "string" ||
       !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))) ||
    (phone !== undefined && typeof phone !== "string")
  ) {
    return res.status(400).json({
      error: "Enter valid customer details."
    });
  }

  if (name !== undefined) customer.name = name.trim();
  if (email !== undefined) customer.email = email.trim();
  if (phone !== undefined) customer.phone = phone.trim();

  res.json({
    message: "Customer updated successfully",
    customer
  });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CRM v3 running on port ${PORT}`);
});
