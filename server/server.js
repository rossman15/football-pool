const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')

// Routes
const {
  getPickHandler,
  postPickHandler,
  getAllPicksHandler,
  getAllVisiblePicksHandler,
  getUsersVisiblePicksHandler
} = require('./routes/picks')
const {
  getPicksCSVHandler,
  getVisiblePicksCSVhandler
} = require('./routes/csv')
const { getWeekHandler, postVisibleWeekHandler } = require('./routes/week')
const { getGamesHandler, postGamesHandler } = require('./routes/games')
const { loginUserHandler, getUsersHandler } = require('./routes/users')

var pool = mysql.createPool({
  connectionLimit: 4,
  host: 'localhost',
  user: 'ross',
  password: 'pass',
  database: 'footballpool'
})

app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = process.env.PORT || 8080
const router = express.Router()

// Unsafely enable cors
router.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept'
  )
  next()
})

// logging middleware
router.use(function(req, res, next) {
  console.log('\nReceived:', {
    url: req.originalUrl,
    body: req.body,
    query: req.query
  })
  next()
})

// get all users
router.get('/users', getUsersHandler(pool))

router.post('/:userId/login', loginUserHandler(pool))

// get YOUR previous picks
router.get('/visiblePicks', getUsersVisiblePicksHandler(pool))

// get everyone's picks
router.get('/allPicks', getAllPicksHandler(pool))

// get everyone's visible picks
router.get('/allVisiblePicks', getAllVisiblePicksHandler(pool))

// get this week's pick
router
  .route('/pick')
  .get(getPickHandler(pool))
  .post(postPickHandler(pool))

router.get('/picksCSV', getPicksCSVHandler(pool))

router.get('/visiblePicksCSV', getVisiblePicksCSVhandler(pool))

router.get('/week', getWeekHandler(pool))
router.post('/makeVisibleWeek', postVisibleWeekHandler(pool))

// Get query params: week, teamId
router
  .route('/games')
  .get(getGamesHandler(pool))
  .post(postGamesHandler(pool))

app.use('/api', router)
app.listen(port)
console.log(`API running at localhost:${port}/api`)
