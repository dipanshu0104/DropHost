const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");
const bgProgress = document.querySelector("#progressBar");



dropZone.addEventListener("dragover", (e) => {
  e.preventDefault();

  if (!dropZone.classList.contains("dragged")) {
    dropZone.classList.add("dragged");
  }
});

dropZone.addEventListener("dragleave", () => {
  dropZone.classList.remove("dragged");
});

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("dragged");
  const files = e.dataTransfer.files;
  console.log(files);
  if (files.length) {
    fileInput.files = files;
    uploadFiles();
  }
});

browseBtn.addEventListener("click", () => {
  fileInput.click();
  document.getElementById('show').classList.remove('hidden');
});


//  load the files into the input section
function uploadFiles() {
  const fileInput = document.getElementById('fileInput');
  const files = fileInput.files;

  if (files.length === 0) {
    alert('Please select at least one file.');
    return;
  }

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('files', files[i]);
  }

  const xhr = new XMLHttpRequest();

  xhr.upload.addEventListener('progress', (event) => {
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const progress = Math.round((event.loaded / event.total) * 100);
    progressBar.style.width = progress + '%';
    progressText.innerText = progress + '%';
  });

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        alert('Files uploaded successfully!');
        location.reload();
      } else {
        alert('Error uploading files.');
        location.reload();
      }

      // Reset the form and progress bar
      fileInput.value = '';
      document.getElementById('progressContainer').classList.add('hidden');
      document.getElementById('text').classList.add('hidden');

    }
  };

  xhr.open('POST', '/upload', true);
  xhr.send(formData);

  // Show the progress bar
  document.getElementById('progressContainer').classList.remove('hidden');
  document.getElementById('progressText').classList.remove('hidden');
  document.getElementById('text').classList.remove('hidden');

}