require('dotenv').config();
const secret = process.env.JWT_TOKEN;

const jwt = require('jsonwebtoken');
const user = require('../models/user');

const withAuth = (req, res, next) =>{
    const token = req.headers['x-access-token'];
    if (!token){
        res.status(401).json({error: "Acesso não autorizado. Token não encontrado"});
    }else{
        jwt.verify(token, secret, (err, decoded) =>{
            if (err){
                res.status(401).json({error: "Acesso não autorizado. Token inválido"});
            }else{
                req.email = decoded.email;
                user.findOne({email: decoded.email}).then( user => {
                    req.user = user;
                    next();
                }).catch(err => {
                    res.status(401).json({error: err});
                })
            }
        })
    }
    
}

module.exports = withAuth;