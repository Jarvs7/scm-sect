const mongoose = require("mongoose");

const ViagemSchema = new mongoose.Schema(
  {
    motorista: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Motorista",
      required: function () {
        return this.status !== "pendente";
      },
    },
    veiculo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Veiculo",
      required: function () {
        return this.status !== "pendente";
      },
    },
    local: {
      type: String,
      required: [true, "Local é obrigatório"],
      trim: true,
    },
    passageiros: {
      type: Number,
      required: [true, "Número de passageiros é obrigatório"],
      min: [1, "Deve haver pelo menos 1 passageiro"],
      max: [4, "Número máximo de passageiros excedido"],
    },
    setor: {
      type: String,
      required: [true, "Setor é obrigatório"],
      trim: true,
    },
    tipo: {
      type: String,
      enum: ["normal", "urgente"],
      required: [true, "Tipo de solicitação é obrigatório"],
      default: "normal",
    },
    saida: {
      type: Date,
      required: [true, "Data/hora de saída é obrigatória"],
    },
    dataHoraRetorno: {
      type: Date,
      validate: {
        validator: function (v) {
          return !v || v >= this.saida;
        },
        message: "Data de retorno deve ser posterior à data de saída",
      },
    },
    status: {
      type: String,
      enum: ["pendente", , "rejeitada", "em_andamento", "finalizada" , "aprovada"],
      default: "pendente",
    },
    aprovadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    dataAprovacao: Date,
    motivoRejeicao: {
      type: String,
      trim: true,
      maxlength: [500, "Motivo não pode exceder 500 caracteres"],
    },
    observacoes: {
      type: String,
      trim: true,
      required: function () {
        return this.tipo === "urgente";
      },
      validate: {
        validator: function (v) {
          return this.tipo !== "urgente" || v?.length >= 10;
        },
        message: "Justificativa obrigatória (mín. 10 caracteres) para urgente",
      },
      maxlength: [500, "Observações não podem exceder 500 caracteres"],
    },
    solicitadoPor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Validação condicional com base no tipo
ViagemSchema.pre("validate", function (next) {
  if (!this.saida || !this.tipo) return next();

  const agora = new Date();
  const dataSaida = new Date(this.saida);
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

  if (this.tipo === "normal") {
    const limite = new Date(agora.getTime() + 24 * 60 * 60 * 1000);
    if (dataSaida < limite) {
      return next(
        new Error(
          "Viagens normais devem ser solicitadas com no mínimo 24h de antecedência"
        )
      );
    }
  }

  if (this.tipo === "urgente") {
    const dataSaidaSemHora = new Date(
      dataSaida.getFullYear(),
      dataSaida.getMonth(),
      dataSaida.getDate()
    );

    if (dataSaidaSemHora.getTime() !== hoje.getTime()) {
      return next(new Error("Viagens urgentes devem ser para o dia atual"));
    }

    if (!this.observacoes || this.observacoes.length < 10) {
      return next(
        new Error(
          "Justificativa obrigatória para viagens urgentes (mín. 10 caracteres)"
        )
      );
    }
  }

  next();
});

module.exports = mongoose.model("Viagem", ViagemSchema);
