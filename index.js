const dropZone = document.querySelector(".drop-zone")
const fileBtn = document.querySelector("#fileBtn")
const progressContainer = document.querySelector(".progress-container")
const bgProgress = document.querySelector(".bg-progress")
const precentDiv = document.querySelector("#precent")
const fileURL = document.querySelector("#fileURL")
const copyBtn = document.querySelector("#copy-btn")
const emailForm = document.querySelector("#email-form")
const progressBar = document.querySelector(".progress-bar")
const sharingContainer = document.querySelector(".sharing-container")
const toast = document.querySelector(".toast")

const host = "https://nvnshare.herokuapp.com/"
const uploadUrl = `${host}api/files`
const emailUrl = `${host}api/files/send`

dropZone.addEventListener("dragover",(e) => {
    e.preventDefault()
    if (!dropZone.classList.contains("dragged")){
        dropZone.classList.add("dragged")
    }    
})

dropZone.addEventListener("dragleave",() => {
    dropZone.classList.remove("dragged")
})

copyBtn.addEventListener("click",()=>{
    fileURL.select();
    document.execCommand("copy");
    showToast("Link Copied")
})

fileBtn.addEventListener("change",()=>{
    uploadFile()
})
dropZone.addEventListener("drop",(e) => {
    e.preventDefault()
    dropZone.classList.remove("dragged")
    const files = e.dataTransfer.files
    if (files.length) {
        fileBtn.files = files;
        uploadFile()
    }
})

dropZone.addEventListener("click",()=>{
   fileBtn.click() 
})

const uploadFile = () => {
    progressContainer.style.display = "flex";
    const files = fileBtn.files[0]
    const formData = new FormData()
    formData.append("myfile",files);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE){
            onUploadSuccess(JSON.parse(xhr.response))
        }
    }
    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror= () => {
        fileBtn.value = ""
        showToast(`Error in upload: ${xhr.statusText}`)
    }

    xhr.open("POST",uploadUrl)
    xhr.send(formData)
}

const updateProgress = (e) => {
    const precent = Math.round((e.loaded/e.total)*100);
    bgProgress.style.transform = `scaleX(${precent/100})`;
    precentDiv.innerText = precent;
    progressBar.style.transform = `scaleX(${precent/100})`
}

const onUploadSuccess = () => {
    emailForm[2].removeAttribute("disabled","true");
    fileBtn.value = "";
    progressContainer.style.display = "none";
    sharingContainer.style.display = "block";
    fileURL.value = url;
}

emailForm.addEventListener("submit",(e)=>{
    e.preventDefault()
    const url = fileURL.value;
    const formData = {
        uuid: uploadUrl.split("/").splice(-1,1)[0],
        emailTo : emailForm.elements("to-email").value,
        emailFrom: emailForm.elements("from-email").value
    }
    emailForm[2].setAttribute("disabled","true");
    fetch(emailUrl,{
        method: "POST",
        headers:{
            "Content-Type":"application/json"
        },
        body: JSON.stringify(formData)
    })
    .then((res) => res.json())
    .then(({success}) => {
        if (success){
            sharingContainer.style.display = "none";
            showToast("Email Sent")
        }
    });
})
let toastTimer;
const showToast = (msg) => {
    toast.innerText = msg;
    toast.style.transform = "translate(-50%,0)"
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%,60px)"
    }, 5000);
}