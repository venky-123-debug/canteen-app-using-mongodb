// importing modules

const express = require('express') // express app
const mongoose = require('mongoose') // for database
const exphbs = require('express-handlebars') //templte engine
const path = require('path') //to handle file paths
const multer = require('multer') //to upload image file
const bodyParser = require('body-parser')
const morgan = require('morgan')
const sharp = require("sharp")
const fs = require("fs")
require('dotenv').config() //

//consuming order schema from database
const { Order } = require("./models/order")


//uploading images using multer
const upload = multer({ dest: "./uploads" })

//initialising express app
const app = express()

//static files
app.use(express.static('./uploads'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(morgan('dev'))

//setting handlebas engine
app.engine('handlebars', exphbs.engine({
  extname: 'handlebars',
  defaultLayout: 'main',
  layoutDir: __dirname + '/views/layouts',
  partialsDir: 'views/partials'
}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'handlebars')


//create order
app.post('/create-order', upload.single('Image'), async (req, res, next) => {
  console.log(req.file)
  if (!req.file) {
    return res.render("index", {
      success: "nofile uploaded"
    })
  }
  console.log("Body: ", req.body)
  await new Order({ ...req.body, image: req.file.filename }).save()
  res.redirect('/')
})

//update
app.get('/update-order', async (req, res) => {
   console.log(req.query.update) // add or sub dishes
  let order = await Order.findById(req.query.id).lean()
  console.log(order)  // let total= available +  served

  // for add a dish to the dashboard
  if (req.query.update == "add") {
    await Order.findByIdAndUpdate(req.query.id, {
      available: order.available+1,
      total: order.total+1
    })
  }
  //for substract a dish after surving
  if (req.query.update == "sub") {
    if(order.available) {
      await Order.findByIdAndUpdate(
        req.query.id, {
          $inc: {
            available: -1, served: 1
          }
        }
      )
    }
     
  }
  res.redirect('/')
})

app.get('/delete-order', async (req, res) => {
  // console.log(req.query)
  await Order.findByIdAndDelete(req.query.id)
  res.redirect("/")
})

//home page rendering
app.get('/', async (req, res) => {
  // await Order.deleteMany()
  let orders = await Order.find().lean()
  await Order.findByIdAndUpdate(req.query.id)
  res.render('home', {
    title: "NodeJS Canteen",
    orders,
  })
})
//server
async function start() {
  try {
    // conditions
    await mongoose.connect(process.env.MONGO_DB)

    app.listen(process.env.PORT, () => {
      console.log(`canteen app listening on port ${process.env.PORT}`)
    })
  } catch (error) {
    console.error(error)
  }
}
start()
