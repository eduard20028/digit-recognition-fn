const inputImg = document.getElementById('input_img')

function clearUrl() {
  inputImg.value = ''
  viewImg.removeAttribute('src')
}

function readUrl() {
  if (inputImg.files && inputImg.files[0]) {
    let reader = new FileReader()
    reader.onload = e => {
      viewImg.setAttribute('src', e.target.result)
    }
    reader.readAsDataURL(inputImg.files[0])
  }
  setShow(false, true)
  clearUrl()
}

inputImg.onchange = readUrl
