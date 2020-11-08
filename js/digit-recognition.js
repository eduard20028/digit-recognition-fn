let model

let canvasStrokeStyle = 'white'
let canvasLineJoin = 'round'
let canvasLineWidth = 10

let clickX = new Array()
let clickY = new Array()
let clickD = new Array()
let drawing

const clearBtn = document.getElementById('btn_clear')
const predictBtn = document.getElementById('btn_predict')
const canvasChart = document.getElementById('canvas_chart')

const canvas = document.getElementById('canvas_draw')
const viewImg = document.getElementById('view_img')

const predictTxt = document.querySelector('.prediction-txt')

canvas.style.borderRadius = '20px'

if (typeof G_vmlCanvasManager != 'undefined') {
  canvas = G_vmlCanvasManager.initElement(canvas)
}

let ctx = canvas.getContext('2d')
ctx.font = '16px Arial'
ctx.fillText('Draw just here', 50, 100)

//---------------------
// MOUSE DOWN function
//---------------------
canvas.onmousedown = function (e) {
  let rect = canvas.getBoundingClientRect()
  let mouseX = e.clientX - rect.left
  let mouseY = e.clientY - rect.top
  drawing = true
  addUserGesture(mouseX, mouseY)
  drawOnCanvas()
}

//---------------------
// MOUSE MOVE function
//---------------------
canvas.onmousemove = function (e) {
  if (drawing) {
    let rect = canvas.getBoundingClientRect()
    let mouseX = e.clientX - rect.left
    let mouseY = e.clientY - rect.top
    addUserGesture(mouseX, mouseY, true)
    drawOnCanvas()
  }
}

//-------------------
// MOUSE UP function
//-------------------
canvas.onmouseup = function (e) {
  drawing = false
}

//----------------------
// MOUSE LEAVE function
//----------------------
canvas.mouseleave = function (e) {
  drawing = false
}

//--------------------
// ADD CLICK function
//--------------------
function addUserGesture(x, y, dragging) {
  clickX.push(x)
  clickY.push(y)
  clickD.push(dragging)
}

//-------------------
// RE DRAW function
//-------------------
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

//------------------------
// CLEAR CANVAS function
//------------------------

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
  canvasChart.style.display = 'none'
}

// -------------------------------------
// loader for cnn model
// -------------------------------------
async function loadModel() {
  console.log('model loading...')

  // clear the model letiable
  model = undefined

  // load the model using a HTTPS request (where you have stored your model files)
  model = await tf.loadLayersModel('../models/model.json')
  console.log('model loaded.')
}

loadModel()

//-----------------------------------------------
// preprocess the canvas
//-----------------------------------------------
function preprocessCanvas(image) {
  // resize the input image to target size of (1, 28, 28)
  let tensor = tf.browser.fromPixels(image).resizeNearestNeighbor([28, 28]).mean(2).expandDims(2).expandDims().toFloat()
  return tensor.div(255.0)
}

//--------------------------------------------
// predict function
//--------------------------------------------

predictBtn.onclick = async function () {
  let tensor
  if (!canvas.classList.contains('d-none')) {
    tensor = preprocessCanvas(canvas)
  } else if (!viewImg.classList.contains('d-none')) {
    tensor = preprocessCanvas(viewImg)
  }

  // make predictions on the preprocessed image tensor
  let predictions = await model.predict(tensor).data()

  // get the model's prediction results
  let results = Array.from(predictions)

  // display the predictions in chart
  displayChart(results)
  displayLabel(results)

  canvasChart.style.display = 'block'
}

//------------------------------
// Chart to display predictions
//------------------------------
let chart = ''
let firstTime = 0

function loadChart(label, data, modelSelected) {
  let ctx = document.getElementById('canvas_chart').getContext('2d')
  chart = new Chart(ctx, {
    // The type of chart we want to create
    type: 'bar',

    // The data for our dataset
    data: {
      labels: label,
      datasets: [
        {
          label: modelSelected + ' prediction',
          backgroundColor: '#f50057',
          borderColor: 'rgb(255, 99, 132)',
          data: data
        }
      ]
    }
  })
}

//----------------------------
// display chart with updated
// drawing from canvas
//----------------------------
function displayChart(data) {
  let select_option = 'CNN'

  let label = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9']
  if (firstTime == 0) {
    loadChart(label, data, select_option)
    firstTime = 1
  } else {
    chart.destroy()
    loadChart(label, data, select_option)
  }
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
    'Predicting you draw <b>' + maxIndex + '</b> with <b>' + Math.trunc(max * 100) + '%</b> confidence'
}
