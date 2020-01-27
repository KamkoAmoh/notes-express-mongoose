"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const mongodb_1 = require("mongodb");
const multer = require("multer");
const path = require("path");
const app = express();
mongoose.connect('mongodb://localhost/notes', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, "connection error"));
db.on('open', () => console.log(`connected`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use('/file', express.static(__dirname + "\\files"))
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
        .skip(Number(itemsPerPage) * Number(pageNumber));
    if (!notesPerPage)
        return res.sendStatus(404);
    res.send(notesPerPage);
});
app.get('/all', async (req, res) => {
    const notes = await NoteModel.find({}).lean();
    if (!notes)
        return res.sendStatus(404);
    res.send(notes);
}); // Find all items in DBs.
app.get('/:id', async (req, res) => {
    const note = await NoteModel.findById(new mongodb_1.ObjectId(req.params.id));
    if (!note)
        return res.sendStatus(404);
    res.send(note.toJSON());
});
app.delete('/:id', async (req, res) => {
    const note = await NoteModel.findByIdAndDelete(new mongodb_1.ObjectId(req.params.id));
    if (!note)
        return res.sendStatus(404);
    res.send(note.toJSON());
});
app.put('/:id', async (req, res) => {
    const note = req.body;
    const update = await NoteModel.findOneAndUpdate({ _id: new mongodb_1.ObjectId(req.params.id) }, {
        user: note.user,
        comment: note.comment,
        posted: note.posted
    });
    if (!update)
        return res.sendStatus(404);
    res.send(update.toJSON());
});
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.resolve(__dirname + "/files"));
    }
});
let upload = multer({ storage: storage });
const fileSchema = new mongoose.Schema({
    filename: String,
    contentType: String
});
const FileModel = mongoose.model('FileModel', fileSchema);
app.post('/file', upload.single('file'), async (req, res) => {
    const model = new FileModel({
        filename: req.file.filename,
        contentType: req.file.mimetype
    });
    await model.save();
    res.sendStatus(200);
});
// app.get('/file/:id', async (req, res) => {
//     const file = await FileModel.findById({_id: req.params.id});
//     if (!file) return res.sendStatus(404);
//     const contentType = file.toObject().contentType;
//     const fileName = file.toObject().filename;
//     res.contentType(contentType);
//     res.sendFile(path.resolve(__dirname + "/files/" + fileName));
// });
app.get('/file/:name', async (req, res) => {
    const file = await FileModel.findOne({ filename: req.params.name }).lean();
    if (!file)
        return res.sendStatus(404);
    res.contentType(file.contentType);
    res.sendFile(path.resolve(__dirname + "/files/" + file.filename));
});
// app.delete('/file/:id', async (req, res) => {
//     const file = await FileModel.find({_id: new ObjectId(req.params.id)});
//     if (!file) return res.sendStatus(404);
//     fs.unlink(path.resolve(__dirname + '/files/' + file[0].toObject().filename), (err) => console.log(err));
//     await FileModel.findByIdAndDelete({_id: new ObjectId(req.params.id)})
//     res.sendStatus(200);
// });
app.delete('/file/:name', async (req, res) => {
    const file = await FileModel.findOne({ filename: req.params.name }).lean();
    if (!file)
        return res.sendStatus(404);
    fs.unlink(path.resolve(__dirname + "/files/" + file.filename), (err) => console.log(err));
    await FileModel.findByIdAndDelete({ _id: new mongodb_1.ObjectId(file._id) });
    res.sendStatus(200);
});
app.listen(3000);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9pbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG1DQUFtQztBQUNuQyxxQ0FBcUM7QUFDckMsMENBQTBDO0FBQzFDLHlCQUF5QjtBQUN6QixxQ0FBbUM7QUFDbkMsaUNBQWlDO0FBQ2pDLDZCQUE2QjtBQUU3QixNQUFNLEdBQUcsR0FBRyxPQUFPLEVBQUUsQ0FBQztBQUV0QixRQUFRLENBQUMsT0FBTyxDQUFDLDJCQUEyQixFQUFFLEVBQUUsZUFBZSxFQUFFLElBQUksRUFBRSxrQkFBa0IsRUFBRSxJQUFJLEVBQUUsZ0JBQWdCLEVBQUUsSUFBSSxFQUFFLENBQUMsQ0FBQztBQUUzSCxNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsVUFBVSxDQUFDO0FBQy9CLEVBQUUsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxrQkFBa0IsQ0FBQyxDQUFDLENBQUM7QUFDaEUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxNQUFNLEVBQUUsR0FBRyxFQUFFLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO0FBRTlDLEdBQUcsQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7QUFDM0IsR0FBRyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFDLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNuRCx5REFBeUQ7QUFDekQsR0FBRyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsS0FBSyxDQUFDLENBQUM7QUFFOUIsTUFBTSxVQUFVLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDO0lBQ25DLElBQUksRUFBRSxNQUFNO0lBQ1osT0FBTyxFQUFFLE1BQU07SUFDZixNQUFNLEVBQUUsT0FBTztDQUNsQixDQUFDLENBQUM7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