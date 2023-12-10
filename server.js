const express = require('express');
const path = require('path');
const multer = require('multer');

const app = express();
const port = process.env.PORT || 3000;

// Set up multer for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage })

// Serve static files from the 'public' directory
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Handle file uploads
app.post('/upload', upload.array('files'), (req, res) => {

    const files = req.files;
    if (!files || files.length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // Iterate through the array to get details of each file
    files.forEach((file) => {

        fileData = {
            "Filename": `${file.originalname}`,
            "Fieldname": `${file.fieldname}`,
            "Encoding": `${file.encoding}`,
            "MIME_Type": `${file.mimetype}`,
            "Destination": `${file.destination}`,
            "Path": `${file.path}`,
            "Size": `${file.size} bytes`,

        }

        console.log(fileData);
        console.log(" ");

    });

    return res.redirect("/");

});


// Start the server
app.listen(port, () => {
    console.log(`Server is listen on http://localhost:${port}`);

});