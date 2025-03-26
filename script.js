function updateFileName() {
    let fileInput = document.getElementById("fileInput");
    let fileNameDisplay = document.getElementById("fileName");

    if (fileInput.files.length > 0) {
        fileNameDisplay.textContent = `📂 ${fileInput.files[0].name}`;
    } else {
        fileNameDisplay.textContent = "Noch keine Datei ausgewählt";
    }
}

function uploadFile() {
    let fileInput = document.getElementById("fileInput");
    let file = fileInput.files[0];
    let statusText = document.getElementById("status");
    let progressBar = document.getElementById("progress-bar");

    if (!file) {
        alert("Bitte eine Datei auswählen!");
        return;
    }

    let formData = new FormData();
    formData.append("file", file);

    let xhr = new XMLHttpRequest();
    xhr.open("POST", "/upload", true);

    // Fortschrittsanzeige
    xhr.upload.onprogress = function (event) {
        if (event.lengthComputable) {
            let percent = Math.round((event.loaded / event.total) * 100);
            progressBar.style.width = percent + "%";
            progressBar.innerText = percent + "%";
        }
    };

    xhr.onload = function () {
        if (xhr.status === 200) {
            let downloadLink = "http://localhost:3000" + xhr.responseText;
            statusText.innerHTML = `✅ Datei erfolgreich hochgeladen!<br>Download: <a href="${downloadLink}" target="_blank">${downloadLink}</a>`;
            progressBar.style.background = "#28a745";
        } else {
            statusText.innerText = "❌ Fehler beim Hochladen!";
            progressBar.style.background = "red";
        }
    };

    xhr.send(formData);
    statusText.innerText = "📤 Datei wird hochgeladen...";
}
