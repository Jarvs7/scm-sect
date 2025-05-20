exports.up = function (knex) {
    return knex.schema.createTable("veiculos", (table) => {
        table.increments("id").primary(); // ID autoincrementável
        table.string("nome").notNullable(); // Nome do veículo
        table.string("status").notNullable(); // Status (livre/em uso)
        table.integer("motorista_id").unsigned().references("id").inTable("motoristas").onDelete("SET NULL"); // Relacionamento com motoristas
        table.string("entrada"); // Horário de entrada
        table.string("saida"); // Horário de saída
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("veiculos");
};