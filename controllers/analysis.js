const fs = require('fs');
const path = require('path');

module.exports.analysis =  async function(req, res) {
    const user = req.user;
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
  };