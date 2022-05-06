let startPage;
let scanPage;
let header;
let modal;

window.onload = function(){
    startPage = document.getElementById("start-page");
    scanPage = document.getElementById("scan-page");
    header = document.getElementById("header-container");
    modal = document.getElementById("info-modal-container");
}

function hideStartPage() {
    startPage.style.display = "none";
    header.style.display = "flex";
    console.log(header.style);
    scanPage.style.display = "block";
    // modal.style.display = "flex";
    // console.log(modal.classList);
    // modal.classList.toggle('visible');
    // console.log(modal.classList);
}