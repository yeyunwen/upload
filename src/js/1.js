const doms = {
  container: document.querySelector(".upload"),
  selectFile: document.querySelector(".upload-select input"),
  progress: document.querySelector(".upload-progress"),
  progressText: document.querySelector(".progress-text"),
  result: document.querySelector(".upload-result"),
  cancelBtn: document.querySelector(".cancel"),
  delBtn: document.querySelector(".upload-result button"),
  img: document.querySelector("img"),
};

function showArea(areaName) {
  doms.container.className = `upload ${areaName}`;
}

function setProgress(percent) {
  doms.progressText.innerHTML = `${percent}%`;
  doms.progress.style.setProperty("--progress", percent);
}

let cancelUpload = null;
function cancel() {
  cancelUpload && cancelUpload();
  showArea("select");
  doms.selectFile.value = null;
}
doms.selectFile.onchange = function () {
  if (this.files.length === 0) {
    return;
  }
  const file = this.files[0];
  if (!validateFile(file)) {
    return;
  }
  // 切换界面
  showArea("progress");
  // 显示预览图
  const reader = new FileReader();
  reader.onload = function (e) {
    doms.img.src = e.target.result;
  };
  reader.readAsDataURL(file);
  // 上传
  console.log(file);
  cancelUpload = upload(file, setProgress, (result) => {
    showArea("result");
    doms.img.src = result.data;
  });
};

function upload(file, onProgress, onFinish) {
  const xhr = new XMLHttpRequest();
  xhr.onload = function () {
    const resp = JSON.parse(xhr.responseText);
    onFinish(resp);
  };
  xhr.upload.onprogress = (e) => {
    const percent = Math.floor((e.loaded / e.total) * 100);
    onProgress(percent);
  };
  xhr.open("POST", "http://127.0.0.1:3000/upload");
  const form = new FormData();
  form.append("file", file);
  xhr.send(form);

  return function () {
    xhr.abort();
  };
}

function validateFile(file) {
  const sizeLimit = 1 * 1024 * 1024;
  const legalExts = [".png", ".jpg", ".jpeg"];
  if (file.size > sizeLimit) {
    alert("文件太大了");
    return false;
  }
  const name = file.name.toLowerCase();
  if (!legalExts.some((ext) => name.endsWith(ext))) {
    alert("文件格式不合法");
    return false;
  }
  return true;
}

doms.cancelBtn.onclick = doms.delBtn.onclick = cancel;
