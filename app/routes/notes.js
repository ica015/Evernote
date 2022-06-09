var express = require('express');
var router = express.Router()
const Note = require('../models/note')
const withAuth = require('../middleware/auth');
const note = require('../models/note');

router.post('/', withAuth, async (req, res) =>{
    const {title, body} = req.body;
    
    try {
        let note = new Note({title: title, body: body, author: req.user._id});
        await note.save();
        res.status(200).json(note)
    } catch (error) {
        res.status(500).json({error: "Não foi possível criar uma nota"})
    }
})

router.get('/', withAuth, async(req, res) =>{
    try {
        let notes = await Note.find({author: req.user._id})
        res.status(200).json(notes)
    } catch (error) {
        res.status(401).json({error: error})
    }
})

router.get('/search', withAuth, async (req, res) =>{
    const {query} = req.query;
    try {
        let notes = await Note
            .find({ author: req.user._id }) //procura todas as notas do autor
            .find({ $text: { $search: query }}) //dentro das notas do autor, procura a query tanto no titulo quanto no corpo
            res.status(200).json(notes)
    } catch (error) {
        res.status(500).json({error: error})
    }
})

router.put('/:id', withAuth, async(req, res)=>{
    const {title, body} = req.body;
    const {id} = req.params;

    try {
        let note = await Note.findById(id)
        if (isOwner(req.user, note)){
            let note = await Note.findOneAndUpdate(id, 
                { $set:{ title: title, body: body }},
                { upsert: true, 'new': true } //faz com que a atualização seja apresentada no front-end
            );
            res.status(200).json(note)
        }else{
            res.status(403).json({error: "Acesso negado. Você não tem autorização apra acessar esta nota"})
        }
    } catch (error) {
        res.status(500).json({error: "Erro ao atualizar a nota"})
    }
})

router.delete('/:id', withAuth, async (req, res)=>{
    let {id} = req.params
    try {
        let note = await Note.findById(id);
        if (isOwner(req.user, note)){
            await note.delete()
            res.status(204).json({message: "Nota deletada com sucesso"})
        }else{
            res.status(403).json({error: "Acesso negado. Você não tem permissão para apagar esta nova"})
        }
    } catch (error) {
        res.status(500).json({error: error})
    }
    
})

router.get('/:id', withAuth, async (req, res)=>{
    try {
        const {id} = req.params
        let note = await Note.findById(id);
        if (isOwner(req.user, note)){
            res.json(note)
        }else{
            res.status(403).json({error: "Acesso negado. Você não tem permissão para acessar esta nota"} )
        }
    } catch (error) {
        res.status(500).json({error: "Erro ao abrir a nota"})
    }
})

const isOwner = (user, note) =>{
    if (JSON.stringify(user._id) === JSON.stringify(note.author._id)){
        return true
    }else{
        return false
    }
}
module.exports = router;