var express = require('express');
var router = express.Router();
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const withAuth = require('../middleware/auth');
require('dotenv').config();
const secret = process.env.JWT_TOKEN

router.post('/register', async (req, res) => {
  const {name, email, password} = req.body;
  const user = new User({name, email, password});

  try {
    await user.save();
    res.status(200).json(user)
  } catch (error) {
    res.status(500).json({error: 'Erro ao registrar novo usuário'})
  }
})

router.post('/login', async (req, res)=>{
  const {email, password} = req.body;

  try {
    let user = await User.findOne({email})
    if(!user){
      res.status(401).json({error: "E-mail não cadastrado"})
    }else{
      user.isCorrectPassword(password, function (err, same){
        if (!same){
          res.status(401).json({error: "Senha incorreta"})
        }else{
          const token = jwt.sign({email}, secret, {expiresIn: '30d'}); //30d corresponde a validade de 30 dias do token
          res.json({user: user, token: token});
        }
      })
    }
  } catch (error) {
    res.status(500).json({error: "Erro interno, favor tente novamente"})
  }
})

router.put('/', withAuth, async (req, res) =>{
  const {name, email} = req.body;

  try {
    let user = await User.findOneAndUpdate(
      {_id: req.user._id},
      {$set:{name: name, email: email}},
      {upsert:true, 'new': true}
    )
    res.json(user)
  } catch (error) {
    res.status(401).json({error: error})
  }
})

router.put('/password', withAuth , async (req, res) => {
  const {password} = req.body;

  try {
    let user = await User.findById({_id:req.user._id})
    user.password = password
    user.save()
    res.json(user) 
  } catch (error) {
    res.status(401).json({error: error})
  }
})

router.delete('/', withAuth, async (req, res) =>{
  try {
    let user = await User.findOne({_id: req.user._id})
    await user.delete()
    res.json({message: 'Usuário excluío com sucesso'}).status(201);
  } catch (error) {
    res.status(500).json({error: error})
  }
})

module.exports = router;
