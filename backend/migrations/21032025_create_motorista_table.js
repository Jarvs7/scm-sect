exports.up = function (knex) {
    return knex.schema.createTable("motoristas", (table) => {
        table.increments("id").primary(); // ID autoincrementável
        table.string("nome").notNullable(); // Nome do motorista
        table.integer("veiculo_id").unsigned().references("id").inTable("veiculos").onDelete("SET NULL"); // Relacionamento com veículos
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable("motoristas");
};