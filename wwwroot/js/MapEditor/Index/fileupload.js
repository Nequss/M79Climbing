document.getElementById("uploadButton").addEventListener("click", function () {
    // Trigger the hidden file input dialog
    document.getElementById("fileInput").click();
});

document.getElementById("fileInput").addEventListener("change", function () {
    // Submit the form automatically after selecting a file
    const uploadForm = document.getElementById("uploadForm");
    if (this.files.length > 0) {
        uploadForm.submit();
    }
});