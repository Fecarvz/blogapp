const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const sql = require('../models/sql');

module.exports = function(passport) {
  passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'senha' }, (email, password, done) => {
    sql.Usuario.findOne({ where: { email } })
      .then(user => {
        if (!user) {
          return done(null, false, { message: 'Esta conta não existe' });
        }

        bcrypt.compare(password, user.senha, (err, isMatch) => {
          if (err) console.log("erro: " + err);
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, { message: 'Senha incorreta' });
          }
        });
      })
      .catch(err => console.log(err));
  }));

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    sql.Usuario.findByPk(id)
      .then(user => done(null, user))
      .catch(err => done(err));
  });
};