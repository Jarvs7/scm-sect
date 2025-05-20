const mongoose = require("mongoose");

const VeiculoSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
    },
    modelo: {
        type: String,
        required: true,
    },
    placa: {
        type: String,
        required: true,
        unique: true,
    },
    status: {
        type: String,
        enum: ["disponivel", "em uso", "inativo", "livre"],
        default: "disponivel",
    },
    motoristas: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Motorista",
        },
    ],
    quilometragemAtual: {
        type: Number,
        default: 0,
    },
    viagens: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Viagem",
        },
    ],
}, {
    timestamps: true,
});

module.exports = mongoose.model("Veiculo", VeiculoSchema);