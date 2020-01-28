import * as express from 'express';
import * as mongoose from 'mongoose';
import * as bodyParser from 'body-parser';
import * as fs from 'fs';
import { ObjectId } from 'mongodb';
import * as multer from 'multer';
import * as path from 'path';
import * as util from 'util';

const unlink = util.promisify(fs.unlink);

const app = express();

mongoose.connect('mongodb://localhost/notes', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true });

const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.on('open', () => console.log(`connected`));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }))
//app.use('/file', express.static(__dirname + "\\files")) // Error, issue with static dir.
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
    const pageNumber = req.query.page;
    const itemsPerPage = req.query.ipp;
    const notesPerPage = await NoteModel.find({})
        .limit(Number(itemsPerPage))
        .skip(Number(itemsPerPage) * Number(pageNumber))
    if (!notesPerPage) return res.sendStatus(404);
    res.send(notesPerPage);
});

app.get('/all', async (req, res) => {
    const notes = await NoteModel.find({}).lean();
    if (!notes) return res.sendStatus(404);
    res.send(notes);    
}); // Find all items in DBs.

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

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname + "/files"));
    }
});

let upload = multer({ storage: storage});

const fileSchema = new mongoose.Schema({
    filename: String,
    contentType: String
});

const FileModel = mongoose.model('FileModel', fileSchema);

app.post('/file', upload.single('file'), async (req, res) => {
    const model = new FileModel({
        filename: req.file.filename,
        contentType: req.file.mimetype
    })
    await model.save();
    res.sendStatus(200);
});

app.get('/file/:name', async (req, res) => {
    const file = await FileModel.findOne({ filename: req.params.name }).lean();
    if (!file) return res.sendStatus(404);
    res.contentType(file.contentType);
    res.sendFile(path.resolve(__dirname + "/files/" + file.filename));
    
});

app.delete('/file/:name', async (req, res) => {
    const file = await FileModel.findOne({ filename: req.params.name }).lean();
    if (!file) return res.sendStatus(404);
    await unlink(path.resolve(__dirname + "/files/" + file.filename));
    await FileModel.findByIdAndDelete({ _id: new ObjectId(file._id) });
    res.sendStatus(200);
})

app.listen(3000);
