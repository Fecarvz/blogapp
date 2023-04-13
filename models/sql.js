const { query } = require('express');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('blogapp', 'root', '', {
  host: "localhost",
  dialect: 'mysql',
  query: {
    raw: true
  }
});

const Postagem = sequelize.define('postagens', {
  titulo: {
    type: Sequelize.STRING
  },
  slug: {
    type: Sequelize.STRING
  },
  descricao: {
    type: Sequelize.TEXT
  },
  conteudo: {
    type: Sequelize.TEXT
  }
});

const Categoria = sequelize.define('categorias', {
  nome: {
    type: Sequelize.STRING
  },
  slug: {
    type: Sequelize.STRING
  }
});

const Usuario = sequelize.define('usuarios', {
  nome: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING
  },
  senha: {
    type: Sequelize.STRING
  },
  eAdmin: {
    type: Sequelize.INTEGER,
    defaultValue: 0
  }
});

// Usuario.sync({force: true})

Postagem.belongsTo(Categoria);
Categoria.hasMany(Postagem);

// sequelize.sync({force: true}).then(() => {
//   console.log('Tabelas criadas');
// }).catch((err) => {
//   console.log(err);
// })

module.exports = {
  Postagens: Postagem,
  Categoria: Categoria,
  Usuario: Usuario
}