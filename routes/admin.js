const express = require('express')
const sql = require('../models/sql')
const router = express.Router()
const connection = require('../models/mysql')
const {ehAdmin} = require('../helpers/ehadmin')


connection.connect((err) => {
  if(err){
    console.log(err)
  }else{
    console.log('Conectado com sucesso')
  }
})
router.get('/', ehAdmin, (req, res) => {
  res.render('admin/index')
})

router.get('/posts',  ehAdmin, (req, res) => {
  res.send('Página de posts')
})

router.get('/categorias', ehAdmin, (req, res) => {
  sql.Categoria.findAll().then((categorias) => {
    res.render('admin/categorias', {categorias: categorias})
  }
  ).catch((err) => {
    res.render('admin/categorias', {categorias: []})
  })
})

router.get('/categorias/add', ehAdmin, (req, res) => {
  res.render('admin/addcategorias')
})

router.post('/categorias/nova', ehAdmin, (req, res) => {
  var errors = []
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    errors.push({text: 'Nome inválido'})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    errors.push({text: 'Slug inválido'})
  }

  if(req.body.nome.length < 2){
    errors.push({text: 'Nome da categoria muito pequeno'})
  }

  if(errors.length > 0){
    res.render('admin/addcategorias', {errors: errors})
  }else{
    const nome = req.body.nome
    const slug = req.body.slug
    sql.Categoria.create({
      nome: nome,
      slug: slug
    }).then(() => {
      req.flash("success_msg", "Categoria criada com sucesso")
      res.redirect('/admin/categorias')
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a categoria")
      console.log(err)
    })
    }
  })

router.get('/categorias/edit/:id', ehAdmin, (req, res) => {
  sql.Categoria.findByPk(req.params.id).then((categoria) => {
    res.render('admin/editcategorias', {categoria: categoria})
  }).catch((err) => {
    req.flash("error_msg", "Esta categoria não existe")
    res.redirect('/admin/categorias')
  })
})

router.post('/categorias/edit/', ehAdmin, (req, res) => {
  var errors = []
  if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
    errors.push({text: 'Nome inválido'})
  }

  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    errors.push({text: 'Slug inválido'})
  }

  if(req.body.nome.length < 2){
    errors.push({text: 'Nome da categoria muito pequeno'})
  }

  if(errors.length > 0){
    res.render('admin/editcategorias', {errors: errors})
  }else{
    const nome = req.body.nome
    const slug = req.body.slug
    sql.Categoria.update({
      nome: nome,
      slug: slug
    }, {
      where: {
        id_categoria: req.body.id
      }
    }).then(() => {
      req.flash("success_msg", "Categoria editada com sucesso")
      res.redirect('/admin/categorias')
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao editar a categoria")
      console.log(err)
    })
  }
})

router.post('/categorias/deletar', ehAdmin, (req, res) => {
  sql.Categoria.destroy({
    where: {
      id_categoria: req.body.id
    }
  }).then(() => {
    req.flash("success_msg", "Categoria deletada com sucesso")
    res.redirect('/admin/categorias')
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar a categoria")
    console.log(err)
  })
})



router.get('/postagens', ehAdmin, (req, res) => {
  connection.query('SELECT postagens.*, categorias.nome FROM postagens INNER JOIN categorias ON postagens.categoriaId = categorias.id ORDER BY postagens.createdAt DESC', function (error, results, fields) {
    if (error) throw error;
    res.render('admin/postagens', { postagens: results });
  });
});

router.get('/postagens/add', ehAdmin, (req, res) => {
  sql.Categoria.findAll().then((categorias) => {
    res.render('admin/addpostagem', {categorias: categorias})
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao carregar o formulário")
    res.redirect('/admin')
  })
})

router.post('/postagens/nova', ehAdmin, (req, res) => {
  var errors = []
  if(req.body.categoria == "0"){
    errors.push({text: 'Categoria inválida, registre uma categoria'})
  }
  if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
    errors.push({text: 'Título inválido'})
  }
  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    errors.push({text: 'Slug inválido'})
  }
  if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
    errors.push({text: 'Descrição inválida'})
  }
  if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
    errors.push({text: 'Conteúdo inválido'})
  }
  
  if(errors.length > 0){
    res.render('admin/addpostagem', {errors: errors})
  }else{
    const titulo = req.body.titulo
    const slug = req.body.slug
    const descricao = req.body.descricao
    const conteudo = req.body.conteudo
    const categoria = req.body.categoria
    sql.Postagens.create({
      titulo: titulo,
      slug: slug,
      descricao: descricao,
      conteudo: conteudo,
      categoriaId: categoria
    }).then(() => {
      req.flash("success_msg", "Postagem criada com sucesso")
      res.redirect('/admin/postagens')
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a postagem")
      console.log(err)
    })
  }
})

router.get('/postagens/edit/:id', ehAdmin, (req, res) => {
  sql.Postagens.findByPk(req.params.id).then((postagem) => {
    sql.Categoria.findAll().then((categorias) => {
      res.render('admin/editpostagens', {categorias: categorias, postagem: postagem})
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao listar as categorias")
      res.redirect('/admin/postagens')
    })
  }).catch((err) => {
    req.flash("error_msg", "Esta postagem não existe")
    res.redirect('/admin/postagens')
  })
})



router.post('/postagens/edit', ehAdmin, (req, res) => {
  var errors = []
  if(req.body.categoria == "0"){
    errors.push({text: 'Categoria inválida, registre uma categoria'})
  }
  if(!req.body.titulo || typeof req.body.titulo == undefined || req.body.titulo == null){
    errors.push({text: 'Título inválido'})
  }
  if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
    errors.push({text: 'Slug inválido'})
  }
  if(!req.body.descricao || typeof req.body.descricao == undefined || req.body.descricao == null){
    errors.push({text: 'Descrição inválida'})
  }
  if(!req.body.conteudo || typeof req.body.conteudo == undefined || req.body.conteudo == null){
    errors.push({text: 'Conteúdo inválido'})
  }
  if(errors.length > 0){
    res.render('admin/editpostagens', {errors: errors})
  }else{
    const titulo = req.body.titulo
    const slug = req.body.slug
    const descricao = req.body.descricao
    const conteudo = req.body.conteudo
    const categoria = req.body.categoria
    sql.Postagens.update({
      titulo: titulo,
      slug: slug,
      descricao: descricao,
      conteudo: conteudo,
      categoria: categoria
    }, {
      where: {
        id_post: req.body.id
      }
    }).then(() => {
      req.flash("success_msg", "Postagem editada com sucesso")
      res.redirect('/admin/postagens')
    }).catch((err) => {
      req.flash("error_msg", "Houve um erro ao salvar a edição")
      console.log(err)
    })
  }
})

router.post('/postagens/deletar', ehAdmin, (req, res) => {
  sql.Postagens.destroy({
    where: {
      id_post: req.body.id
    }
  }).then(() => {
    req.flash("success_msg", "Postagem deletada com sucesso")
    res.redirect('/admin/postagens')
  }).catch((err) => {
    req.flash("error_msg", "Houve um erro ao deletar a postagem")
    console.log(err)
  })
})



module.exports = router