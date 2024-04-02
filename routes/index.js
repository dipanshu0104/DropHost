var express = require('express');
var router = express.Router();
let UserModel = require("./users");
const localStrategy = require('passport-local');
const passport = require('passport');
const archiver = require('archiver');

const upload = require('./file_uploader');
const dp_upload = require('./dp_uploader');

const fs = require('fs');
const path = require('path');

passport.use(new localStrategy(UserModel.authenticate()));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { error: req.flash('error') });
});

router.get("/register", function(req, res) {
  res.render('register');
})

router.get('/dashboard', isLoggedIn, async function(req, res) {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  const folderPath = path.join(__dirname, `../uploads/${user.username}`);

  // Function to calculate the size of a directory
function calculateDirectorySize(directoryPath) {
  let totalSizeInBytes = 0;

  // Synchronously read the contents of the directory
  const files = fs.readdirSync(directoryPath);

  // Iterate through each file in the directory
  files.forEach(file => {
    const filePath = path.join(directoryPath, file);

    // Get file stats
    const stats = fs.statSync(filePath);

    // Check if it's a file or a directory
    if (stats.isFile()) {
      // Add the file size to the total
      totalSizeInBytes += stats.size;
    } else if (stats.isDirectory()) {
      // If it's a directory, recursively calculate its size
      totalSizeInBytes += calculateDirectorySize(filePath);
    }
  });

  return totalSizeInBytes;
}

// Function to convert bytes to megabytes
function bytesToMegabytes(bytes) {
  return bytes / (1024 * 1024);
}

function bytesToGigabytes(bytes) {
    return bytes / (1024 * 1024 * 1024);
  }

// Specify the path to the folder you want to analyze

// Calculate the total size of the specified directory
const totalSizeInBytes = calculateDirectorySize(folderPath);

// Convert the total size to megabytes
const totalSizeInMegabytes = bytesToMegabytes(totalSizeInBytes);
const totalSizeInGigabytes = bytesToGigabytes(totalSizeInBytes);


const MB = totalSizeInMegabytes.toFixed(2);
const GB = totalSizeInGigabytes.toFixed(2);

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Error reading folder:', err);
      return;
    }
    const numberOfFiles = files.length;
    res.render('dashboard', { user, files , numberOfFiles, MB, GB,  });
  });
});


function getFileSize(filePath) {
  const stats = fs.statSync(filePath);
  const fileSizeInBytes = stats.size;
  const fileSizeInKilobytes = fileSizeInBytes / 1024;
  const fileSizeInMegabytes = fileSizeInKilobytes / 1024;
  return fileSizeInMegabytes.toFixed(2) + ' MB  ';
}

router.get('/myfiles', isLoggedIn, async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  const files = fs.readdirSync(`uploads/${user.username}`);
  const fileDetails = files.map((file) => {
    const filePath = path.join(__dirname, `../uploads/${user.username}`, file);
    return {
      name: file,
      size: getFileSize(filePath),
    };
  });
  res.render('myfiles', { user, files: fileDetails });
});

router.get('/user', isLoggedIn, async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  res.render('userpage', { user });
});

// Authentication routes

router.post('/register', function (req, res, next) {
  const userdata = new UserModel({
     username: req.body.username,
  });

  if (req.body.password!= req.body.retype) {
    res.redirect("/register");
  }
  else {
    UserModel.register(userdata, req.body.password)
  .then(function (registereduser) {
    passport.authenticate('local')(req, res, function () {
      let folderpath = path.join(__dirname, '../uploads', req.body.username);
      fs.mkdir(folderpath, (err) => {
        if (err) {
          console.error(`Error creating folder`);
        } else {
          console.log(`Folder created successfully.`);
        }
      });
      res.redirect('/dashboard');
    })
  })
  }
  
});

router.post("/login", passport.authenticate("local", {
  successRedirect: '/dashboard',
  failureRedirect: "/",
  failureFlash: true
}), function (req, res) {
  
});

router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if(req.isAuthenticated()) return next();
  res.redirect("/")
}

router.post('/upload', isLoggedIn ,upload.array('files'), (req, res) => {

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

  return res.redirect("/myfiles");

});

router.post("/dp-upload", isLoggedIn ,dp_upload.single("image"), async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  user.dp = req.file.filename;
  await user.save();
  res.redirect('/user');
});

router.get('/upload_file', isLoggedIn , async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  res.render('uploadpage', { user });
});

// file operation routes
router.get('/download/:filename', isLoggedIn , async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  const filePath = path.join(__dirname, `../uploads/${user.username}`, req.params.filename);
  res.download(filePath);
});


router.get('/delete/:filename', isLoggedIn , async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  const filePath = path.join(__dirname, `../uploads/${user.username}`, req.params.filename);
  fs.unlinkSync(filePath);
  res.redirect('/myfiles');
});


router.post('/rename', isLoggedIn ,async (req, res) => {

  const user = await UserModel.findOne({ username: req.session.passport.user });
  const oldFileName = req.body.oldFileName;
  const newFileName = req.body.newFileName;
  const oldFilePath = path.join(__dirname, `../uploads/${user.username}`, oldFileName);
  const newFilePath = path.join(__dirname, `../uploads/${user.username}`, newFileName);

  fs.renameSync(oldFilePath, newFilePath);
  res.redirect('/myfiles');
});

// route for delete and download all 

router.post('/delete-download', isLoggedIn ,async (req, res) => {

  if (req.body.deleteBox) {
    const user = await UserModel.findOne({ username: req.session.passport.user });
    const folderPath = path.join(__dirname, `../uploads/${user.username}`);
    const filesToDelete = req.body.files;
    if (!filesToDelete) {
        return res.redirect('/myfiles');
    }
  
    if (!Array.isArray(filesToDelete)) {
        fs.unlink(path.join(folderPath, filesToDelete), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Error deleting file.');
            }
            res.redirect('/myfiles');
        });
    } else {
        filesToDelete.forEach((file) => {
            fs.unlink(path.join(folderPath, file), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Error deleting files.');
                }
            });
        });
        res.redirect('/myfiles');
    }
  }

  if (req.body.downloadBox) {
    const user = await UserModel.findOne({ username: req.session.passport.user });
    const folderPath = path.join(__dirname, `../uploads/${user.username}`);
    const files = req.body.files;
        const zip = archiver('zip');
        const output = fs.createWriteStream(folderPath + '/files.zip');
    
        zip.pipe(output);
    
        files.forEach(file => {
            zip.append(fs.createReadStream(folderPath + `/${file}`), { name: file });
        });
    
        zip.finalize();
        output.on('close', () => {
            res.download(folderPath + '/files.zip', 'files.zip', (err) => {
                if (err) {
                    console.error(err);             
                }
                fs.unlinkSync(folderPath + '/files.zip');
            });
        });
  }
  
});


router.get('/delete-ac', isLoggedIn , async (req, res) => {
  const user = await UserModel.findOne({ username: req.session.passport.user });
  const folderPath = path.join(__dirname, '../uploads', user.username);
  fs.rmdir(folderPath, { recursive: true }, (err) => {
    if (err) {
        console.error('Error deleting folder:', err);
        return;
    }
    console.log('Folder deleted successfully.');
  });
  await UserModel.findOneAndDelete({ username: req.session.passport.user });
  res.redirect('/');
});


module.exports = router;
