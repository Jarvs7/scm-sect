const mongoose = require("mongoose");

const MotoristaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    cnh: {
        type: String,
        required: true,
        unique: true,
    },
    telefone: String,
    data_nascimento: Date,
    status: {
        type: String,
        enum: ["disponivel", "em_viagem", "inativo", "livre"],
        default: "disponivel",
    },
    viagens: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Viagem",
        },
    ],
    totalKmRodados: {
        type: Number,
        default: 0,
    },
    ultimaViagem: {
        type: Date,
    },
}, {
    timestamps: true,
});

module.exports = mongoose.model("Motorista", MotoristaSchema);