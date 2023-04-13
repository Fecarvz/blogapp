const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const usuarios = require('./routes/usuario')
const path = require('path')
const session = require('express-session')
const flash = require('connect-flash')
const sql = require('./models/sql')
const Postagem = sql.Postagens
const Categoria = sql.Categoria
const connection = require('./models/mysql')
const passport = require('passport')
require("./config/auth")(passport)

// Configurações
  // Sessão
    app.use(session({
      secret: "Curso de Node",
      resave: true,
      saveUninitialized: true
    }))
    app.use(passport.initialize())
    app.use(passport.session())
    app.use(flash())

  // Middleware
    app.use((req, res, next) => {
      res.locals.success_msg = req.flash("success_msg")
      res.locals.error_msg = req.flash("error_msg")
      res.locals.error = req.flash("error")
      res.locals.user = req.user || null
      next()
    })
    
  // Body Parser
    app.use(bodyParser.urlencoded({extended: true}))
    app.use(bodyParser.json())

  // Handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')

  // Public
    app.use(express.static(path.join(__dirname, 'public')))
        
//Rotas
  app.get('/', (req, res) => {  
    connection.query('SELECT postagens.*, categorias.nome FROM postagens INNER JOIN categorias ON postagens.categoriaId = categorias.id ORDER BY postagens.createdAt DESC', function (error, results, fields) {
      if (error){
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.render('/', { postagens: results });
      };
      res.render('index', { postagens: results });
    });
  })

  app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({
      where: {
        slug: req.params.slug
      }
    }).then((postagem) => {
      if(postagem){
        res.render('postagem/index', {postagem: postagem})
      }else{
        req.flash("error_msg", "Esta postagem não existe")
        res.redirect('/')
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno")
      res.redirect('/')
    })
  })

  app.get('/categorias', (req, res) => {
    Categoria.findAll().then((categorias) => {
      res.render('categorias/index', {categorias: categorias})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao listar as categorias")
      res.redirect('/')
    })
  })

  app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({
      where: {
        slug: req.params.slug
      },
    }).then((categoria) => {
      if(categoria){
        Postagem.findAll({
          where: {
            categoriaId: categoria.id
          }
        }).then((postagens) => {
          res.render('categorias/postagem', {postagens: postagens, categoria: categoria})
        }).catch((err) => {
          req.flash("error_msg", "Houve um erro ao listar os posts!")
          res.redirect('/')
        })
      }else{
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect('/')
      }
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro interno ao carregar a página desta categoria")
      res.redirect('/')
    })
  })



  app.get('/posts', (req, res) => {
    res.send('Lista de posts')
  })
  app.use('/admin', admin)
  app.use('/usuarios', usuarios)
//Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log('Servidor rodando na url http://localhost:8081')
})