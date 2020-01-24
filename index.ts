import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import { ObjectId } from 'mongodb';

const app = express();

mongoose.connect('mongodb://localhost/notes', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.on('open', () => console.log(`connected ${db.modelNames}`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'ejs');

const noteSchema = new mongoose.Schema({
    user: String,
    comment: String,
    posted: Boolean
});

const NoteModel = mongoose.model("NoteModel", noteSchema);

app.post('/', async (req, res) => {
    const model = new NoteModel({
        user: req.body.user,
        comment: req.body.comment,
        posted: req.body.posted
    });

    await model.save();

    res.send(model.toJSON());
});

app.get('/', async (req, res) => {
    const notes = await NoteModel.find({}).lean();
    if (!notes) return res.sendStatus(404);
    res.send(notes);    
});

app.get('/:id', async (req, res) => {
    const note = await NoteModel.findById(new ObjectId(req.params.id));
    if (!note) return res.sendStatus(404);
    res.send(note.toJSON());
});


app.delete('/:id', async (req, res) => {
    const note = await NoteModel.findByIdAndDelete(new ObjectId(req.params.id));
    if (!note) return res.sendStatus(404);
    res.send(note.toJSON());
    
});

app.put('/:id', async (req, res) => {
    const note = req.body;
    const update = await NoteModel.findOneAndUpdate({_id : new ObjectId(req.params.id)}, {
        user: note.user,
        comment: note.comment,
        posted: note.posted
    });
    if (!update) return res.sendStatus(404);
    res.send(update.toJSON());
});

app.listen(3000);
