function digitRecognition(document) {
  let model

  let canvasStrokeStyle = 'white'
  let canvasLineJoin = 'round'
  let canvasLineWidth = 10

  let clickX = new Array()
  let clickY = new Array()
  let clickD = new Array()
  let drawing

  let clearBtn = document.getElementById('btn_clear')
  let predictBtn = document.getElementById('btn_predict')

  let canvas = document.getElementById('canvas_draw')
  let viewImg = document.getElementById('view_img')
  let inputImg = document.getElementById('input_img')

  let predictTxt = document.querySelector('.prediction-txt')

  canvas.style.borderRadius = '20px'

  if (typeof G_vmlCanvasManager != 'undefined') {
    canvas = G_vmlCanvasManager.initElement(canvas)
  }

  let ctx = canvas.getContext('2d')
  ctx.font = '16px Arial'
  ctx.fillText('Нарисуй цифру здесь', 20, 100)

  canvas.onmousedown = function (e) {
    let rect = canvas.getBoundingClientRect()
    let mouseX = e.clientX - rect.left
    let mouseY = e.clientY - rect.top
    drawing = true
    addUserGesture(mouseX, mouseY)
    drawOnCanvas()
  }

  canvas.onmousemove = function (e) {
    if (drawing) {
      let rect = canvas.getBoundingClientRect()
      let mouseX = e.clientX - rect.left
      let mouseY = e.clientY - rect.top
      addUserGesture(mouseX, mouseY, true)
      drawOnCanvas()
    }
  }

  canvas.onmouseup = function (e) {
    drawing = false
  }

  canvas.mouseleave = function (e) {
    drawing = false
  }

  function addUserGesture(x, y, dragging) {
    clickX.push(x)
    clickY.push(y)
    clickD.push(dragging)
  }

  function drawOnCanvas() {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    ctx.strokeStyle = canvasStrokeStyle
    ctx.lineJoin = canvasLineJoin
    ctx.lineWidth = canvasLineWidth

    for (let i = 0; i < clickX.length; i++) {
      ctx.beginPath()
      if (clickD[i] && i) {
        ctx.moveTo(clickX[i - 1], clickY[i - 1])
      } else {
        ctx.moveTo(clickX[i] - 1, clickY[i])
      }
      ctx.lineTo(clickX[i], clickY[i])
      ctx.closePath()
      ctx.stroke()
    }
  }

  clearBtn.onclick = function () {
    ctx.restore()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.scale(1, 1)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    clickX = new Array()
    clickY = new Array()
    clickD = new Array()
    predictTxt.innerHTML = ''
    setShow(true, false)
  }

  async function loadModel() {
    model = undefined
    model = await tf.loadLayersModel('./models/model.json')
  }

  loadModel()

  function preprocessCanvas(image) {
    let tensor = tf.browser
      .fromPixels(image)
      .resizeNearestNeighbor([28, 28])
      .mean(2)
      .expandDims(2)
      .expandDims()
      .toFloat()
    return tensor.div(255.0)
  }

  predictBtn.onclick = async function () {
    let tensor
    if (!canvas.classList.contains('d-none')) {
      tensor = preprocessCanvas(canvas)
    } else if (!viewImg.classList.contains('d-none')) {
      tensor = preprocessCanvas(viewImg)
    }
    let predictions = await model.predict(tensor).data()
    let results = Array.from(predictions)

    displayLabel(results)
  }

  function displayLabel(data) {
    let max = data[0]
    let maxIndex = 0

    for (let i = 1; i < data.length; i++) {
      if (data[i] > max) {
        maxIndex = i
        max = data[i]
      }
    }
    predictTxt.innerHTML =
      'Нарисованная цифра: <b>' + maxIndex + '</b>, процент совпадения <b>' + Math.trunc(max * 100) + '%</b>'
  }

  function setShow(isCanvas, isImage) {
    if (isCanvas) {
      canvas.classList.remove('d-none')
      viewImg.classList.add('d-none')
    } else if (isImage) {
      canvas.classList.add('d-none')
      viewImg.classList.remove('d-none')
    }
  }

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
}

export default digitRecognition
