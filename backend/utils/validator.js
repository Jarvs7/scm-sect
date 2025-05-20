const Joi = require("joi");

const viagemSchema = Joi.object({
    motorista: Joi.string().required().messages({
        "any.required": "O campo motorista é obrigatório.",
    }),
    veiculo: Joi.string().required().messages({
        "any.required": "O campo veículo é obrigatório.",
    }),
    local: Joi.string().required().messages({
        "any.required": "O campo local é obrigatório.",
    }),
    passageiros: Joi.number().required().messages({
        "any.required": "O campo passageiros é obrigatório.",
        "number.base": "O campo passageiros deve ser um número.",
    }),
    setor: Joi.string().required().messages({
        "any.required": "O campo setor é obrigatório.",
    }),
    saida: Joi.date().required().messages({
        "any.required": "O campo saída é obrigatório.",
        "date.base": "O campo saída deve ser uma data válida.",
    }),
});

function validarViagem(data) {
    return viagemSchema.validate(data);
}

module.exports = { validarViagem };