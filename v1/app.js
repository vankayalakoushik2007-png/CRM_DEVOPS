
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
    version: "v1",
    features: ["add"]
  });
});

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`CRM v1 running on port ${PORT}`);
});
