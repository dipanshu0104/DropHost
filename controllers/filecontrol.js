const fsp = require('fs').promises;
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Async function to get file size
async function getFileSize(filePath) {
  try {
    const stats = await fsp.stat(filePath);
    const fileSizeInBytes = stats.size;
    const fileSizeInKilobytes = fileSizeInBytes / 1024;
    const fileSizeInMegabytes = fileSizeInKilobytes / 1024;
    return fileSizeInMegabytes.toFixed(2) + ' MB';
  } catch (error) {
    console.error(`Error getting file size for ${filePath}:`, error);
    throw new Error('Unable to retrieve file size.');
  }
}

// Async function to get file modification date
async function getFileDate(filePath) {
  try {
    const stats = await fsp.stat(filePath);
    const modificationDate = new Date(stats.mtime);
    return modificationDate.toLocaleString();
  } catch (error) {
    console.error(`Error getting file date for ${filePath}:`, error);
    throw new Error('Unable to retrieve file date.');
  }
}

module.exports.fileState = async (req, res) => {
  const user = req.user;
  try {
    const files = await fsp.readdir(`uploads/${user.username}`);
    const fileDetails = await Promise.all(files.map(async (file) => {
      const filePath = path.join(__dirname, `../uploads/${user.username}`, file);
      return {
        name: file,
        size: await getFileSize(filePath),
        date: await getFileDate(filePath)
      };
    }));

    res.render('myfiles', { user, files: fileDetails });
  } catch (error) {
    console.error('Error reading files:', error);
    res.status(500).send('Error reading files.');
  }
};

module.exports.deleteFile = async (req, res) => {
  const user = req.user;
  const filePath = path.join(__dirname, `../uploads/${user.username}`, req.params.filename);
  try {
    await fsp.unlink(filePath);
    res.redirect('/myfiles');
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).send('Error deleting file.');
  }
};

module.exports.downloadFile = async (req, res) => {
  const user = req.user;
  const filePath = path.join(__dirname, `../uploads/${user.username}`, req.params.filename);

  try {
    await res.download(filePath);
  } catch (error) {
    console.error('Error downloading file:', error);
    res.status(500).send('Error downloading file.');
  }
};

module.exports.renameFile = async (req, res) => {
  const user = req.user;
  const oldFileName = req.body.oldFileName;
  const newFileName = req.body.newFileName;
  const oldFilePath = path.join(__dirname, `../uploads/${user.username}`, oldFileName);
  const newFilePath = path.join(__dirname, `../uploads/${user.username}`, newFileName);

  try {
    await fsp.rename(oldFilePath, newFilePath);
    res.redirect('/myfiles');
  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).send('Error renaming file.');
  }
};

module.exports.downloadDeleteHandler = async (req, res) => {
  const user = req.user;
  const folderPath = path.join(__dirname, `../uploads/${user.username}`);

  // Handle delete request
  if (req.body.deleteBox) {
    const filesToDelete = req.body.files;

    if (!filesToDelete) {
      return res.redirect('/myfiles');
    }

    try {
      if (!Array.isArray(filesToDelete)) {
        await fs.unlink(path.join(folderPath, filesToDelete));
      } else {
        await Promise.all(filesToDelete.map(file => fsp.unlink(path.join(folderPath, file))));
      }
      res.redirect('/myfiles');
    } catch (error) {
      console.error('Error deleting files:', error);
      res.status(500).send('Error deleting files.');
    }
  }

  // Handle download request
  if (req.body.downloadBox) {
    const files = req.body.files;
    const zip = archiver('zip');
    const output = fs.createWriteStream(path.join(folderPath, 'files.zip'));

    zip.pipe(output);

    // Append files to the zip
    files.forEach(file => {
      zip.append(fs.createReadStream(path.join(folderPath, file)), { name: file });
    });

    // Finalize the zip process
    zip.finalize();

    output.on('close', () => {
      const zipFilePath = path.join(folderPath, 'files.zip');

      // Download the zip file
      res.download(zipFilePath, 'files.zip', async (err) => {
        if (err) {
          console.error('Error sending the file for download:', err);
          res.status(500).send('Error during zip download.');
        } else {
          // Only delete the file after the download completes
          try {
            await fs.promises.unlink(zipFilePath);  // Using fs.promises for deletion
          } catch (unlinkErr) {
            console.error('Error deleting the zip file:', unlinkErr);
          }
          
        }
      });
    });

    // Handle zip creation errors
    output.on('error', (error) => {
      console.error('Error writing zip file:', error);
      res.status(500).send('Error creating zip file.');
    });

  }
};