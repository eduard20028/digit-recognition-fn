function setShow(isCanvas, isImage) {
  if (isCanvas) {
    canvas.classList.remove('d-none')
    viewImg.classList.add('d-none')
  } else if (isImage) {
    canvas.classList.add('d-none')
    viewImg.classList.remove('d-none')
  }
}
