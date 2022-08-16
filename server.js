const express = require('express')
const mongoose = require('mongoose')
const exphbs = require('express-handlebars')
const path = require('path')
const multer = require('multer')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const sharp = require("sharp")
const fs = require("fs")
require('dotenv').config()


const { Order } = require("./models/order")
// const { OrderedBulkOperation } = require('mongodb')

const upload = multer({ dest: "./uploads" })

// File upload folder
// const DIR = './uploads/';
// const storage = multer.memoryStorage()
// const upload = multer({ storage: storage })

//init app
const app = express()

// app.use(express.static('/public'));
app.use(express.static('./uploads'));
// app.use('/uploads', express.static('uploads'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(morgan('dev'))


app.engine('handlebars', exphbs.engine({
  extname: 'handlebars',
  defaultLayout: 'main',
  layoutDir: __dirname + '/views/layouts',
  partialsDir: 'views/partials'
}))
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'handlebars')



app.post('/create-order', upload.single('Image'), async (req, res, next) => {
  console.log(req.file)
  if (!req.file) {
    return res.render("index", {
      success: "nofile uploaded"
    })
  }
  // if (req.file.mimetype == "image/jpeg" || req.file.mimetype == "image/png") {
  //   res.redirect('/')
  // // } else {
  // //   res.render("index", {
  //     success: "upload only image file"
  //   })
  // app.post('/create-order', async (req, res) => {
  console.log("Body: ", req.body)
  await new Order({ ...req.body, image: req.file.filename }).save()
  res.redirect('/')
})



app.get('/update-order', async (req, res) => {
  console.log(req.query)
  await Order.findByIdAndUpdate(req.query.id, {
    status: req.query.status,
    $inc:{
      total: 1,served: 0, available:1
          }
  })
  res.redirect('/')
})

app.get('/delete-order', async (req, res) => {
  // console.log(req.query)
  await Order.findByIdAndDelete(req.query.id)
  res.redirect("/")
})


app.get('/', async (req, res) => {
  // await Order.deleteMany()
  let orders = await Order.find().lean()
  await Order.findByIdAndUpdate(req.query.id,{
    $inc:{
total: 1, available:-1,
    }, $max: {served: -1}
  
  })
  // console.log(orders)
  // let orders = [{
  //   title: "Dish 1",
  //   description: "Hot spicy rice dish",
  //   available: 5,
  //   served: 2,
  //   total: 7,
  //   image: "dish1",
  // }]
  res.render('home', {
    title: "NodeJS Canteen",
    orders,
    helpers: {
      count(value) {
        if(value=="available")
          return "text-primary"       
        if(value=="served")
          return "text-warning"
         if(value=="total")
          return "text-success"      
      }
    //   function(a, b, opts) {
    //     if (a == b) {
    //         return opts.fn(this);
    //     } else {
    //         return opts.inverse(this);
    //     }
    // }
    }
    // helpers: {
    //   calculation: function (value) {
    //     return value * 5
    //   },

    //   list: function (value, options) {
    //     let out = "<ul>";
    //     for (let i = 0; i < value.length; i++) {
    //       out = out + "<li>" + options.fn(value[i]) + "</li>";
    //     }
    //     return out + "</ul>";
    //   }
    // }
  })
})

// app.post('/upload', (req, res) => {
//   upload(req, res, (err) => {
//     if(err){
//       res.render('index', {
//         msg: err
//       });
//     } else {
//       if(req.file == undefined){
//         res.render('index', {
//           msg: 'Error: No File Selected!'
//         });
//       } else {
//         res.render('index', {
//           msg: 'File Uploaded!',
//           file: `uploads/${req.file.filename}`
//         });
//       }
//     }
//   });
// });


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
