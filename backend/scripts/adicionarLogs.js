const express = require("express");
const Motorista = require('../models/Motorista');
const Veiculo = require('../models/Veiculo');

const app = express();

app.get("/api/motoristas", async (req, res) => {
  try {
    const motoristas = await Motorista.find();
    console.log("Motoristas retornados:", motoristas); // Log dos motoristas
    res.json(motoristas);
  } catch (error) {
    console.error("Erro ao buscar motoristas:", error);
    res.status(500).json({ message: "Erro ao buscar motoristas", error });
  }
});

app.get("/api/veiculos", async (req, res) => {
  try {
    const veiculos = await Veiculo.find();
    console.log("Veículos retornados:", veiculos); // Log dos veículos
    res.json(veiculos);
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    res.status(500).json({ message: "Erro ao buscar veículos", error });
  }
});

const PORT = process.env.PORT || 1120;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
