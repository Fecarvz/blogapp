const express = require('express')
const router = express.Router()
const sql = require("../models/sql")
const bcrypt = require('bcryptjs')
const passport = require('passport')

router.get('/registro', (req, res) => {
  res.render('usuarios/registro')
})

router.post('/registro', (req, res) => {
  var errors = []
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    errors.push({text: 'Nome inválido'})
  }
  if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
    errors.push({text: 'Email inválido'})
  }
  if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
    errors.push({text: 'Senha inválida'})
  }
  if(req.body.senha.length < 4){
    errors.push({text: 'Senha muito pequena'})
  }
  if(req.body.senha != req.body.senha2){
    errors.push({text: 'As senhas são diferentes, tente novamente'})
  }
  if(errors.length > 0){
    res.render('usuarios/registro', {errors: errors})
  }else{
    sql.Usuario.findOne({email: req.body.email}).then((
      usuario) => {
        if(usuario){
          req.flash('error_msg', 'Já existe uma conta com este email no nosso sistema')
          res.redirect('/usuarios/registro')
        }else{
          const novoUsuario = new sql.Usuario({
            nome: req.body.nome,
            email: req.body.email,
            senha: req.body.senha
          })
          bcrypt.genSalt(10, (erro, salt) => {
            bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
              if(erro){
                req.flash('error_msg', 'Houve um erro durante o salvamento do usuário')
                res.redirect('/')
              }
              novoUsuario.senha = hash
              novoUsuario.save().then(() => {
                req.flash('success_msg', 'Usuário criado com sucesso')
                res.redirect('/')
              }).catch((err) => {
                req.flash('error_msg', 'Houve um erro ao criar o usuário, tente novamente')
                res.redirect('/usuarios/registro')
              })
            })
          })
        }
      }).catch((err) => {
        req.flash('error_msg', 'Houve um erro interno')
        res.redirect('/')
      })
  }
})
  
router.get("/login", (req, res) => {
  res.render("usuarios/login")
})

router.post("/loginPage", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/usuarios/login",
    failureFlash: true,
    successFlash: "Você está logado!"
  })(req, res, next)
})

router.get('/logout', function(req, res) {
  req.session.destroy(function(err) {
    if (err) {
      // handle error
    } else {
      res.redirect('/');
    }
  });
});




module.exports = router