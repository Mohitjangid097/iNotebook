const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// Route 1 : Get all the notes: Get "/api/notes/fetchallnotes". Login required
router.get('/fetchallnotes', fetchuser, async(req, res)=>{
    try {
        const notes = await Note.find({user: req.user.id});
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
} )

// Route 2 : Add a new Notes using: Post "/api/notes/addnote". Login required
router.post('/addnote', fetchuser,[
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description must be 10 characters').isLength({ min: 3 }),
], async(req, res)=>{
        try {
        
            const {title,description,tag} = req.body;
            //if error, then return error
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const saveNote = await note.save();

            res.json(saveNote)
        
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Internal server error");
        }
} )

// Route 3 : Update an existing Note using: put "/api/notes/updatenote". Login required
router.put('/updatenote/:id', fetchuser, async(req, res)=>{
    const {title, description, tag} = req.body;

    try {
        //create a newNote oject
        const newNote = {};
        if(title){newNote.title = title};
        if(description){newNote.description = description};
        if(tag){newNote.tag = tag};
        
        //find the node to be updated
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("not found")}

        if(note.user.toString() !== req.user.id){
            return res.status(404).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new:true})
        res.json({note});
        
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

// Route 4 : delete an existing Note using: Delete "/api/notes/deletenote". Login required
    router.delete('/deletenote/:id', fetchuser, async(req, res)=>{
        
    try {
        //find the node to be delete and delete it
        let note = await Note.findById(req.params.id);
        if(!note){return res.status(404).send("not found")}

        // allow deletion only if user owns this note
        if(note.user.toString() !== req.user.id){
            return res.status(404).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({"success":  "Note has been sucessfully deleted", note:note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal server error");
    }
})

module.exports = router