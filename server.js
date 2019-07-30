const express      = require('express')
const app          = express()
const bodyParser   = require('body-parser')
const mysql        = require('mysql')
const Promise      = require('promise')

var pool  = mysql.createPool({
  connectionLimit : 4,
  host            : 'localhost',
  user            : 'ross',
  password        : 'pass',
  database        : 'footballpool'
});



app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const port = process.env.PORT || 8080


const router = express.Router()

// Unsafely enable cors
router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next()
})

// logging middleware
router.use(function(req, res, next) {
    console.log('\nReceived:',{ url: req.originalUrl, body: req.body, query: req.query })
    next()
})

const TEAMS = {
  "arz": "Arizona Cardinals",
  "atl": "Atlanta Falcons",
  "bal": "Baltimore Ravens",
  "buf": "Buffalo Bills",
  "car": "Carolina Panthers",
  "chi": "Chicago Bears",
  "cin": "Cincinnati Bengals",
  "cle": "Cleveland Browns",
  "dal": "Dallas Cowboys",
  "den": "Denver Broncos",
  "det": "Detroit Lions",
  "gb": "Green Bay Packers",
  "hou": "Houston Texans",
  "ind": "Indianapolis Colts",
  "jac": "Jacksonville Jaguars",
  "kc": "Kansas City Chiefs",
  "mia": "Miami Dolphins",
  "min": "Minnesota Vikings",
  "ne": "New England Patriots",
  "no": "New Orleans Saints",
  "nyg": "New York Giants",
  "nyj": "New York Jets",
  "oak": "Oakland Raiders",
  "phi": "Philadelphia Eagles",
  "pit": "Pittsburgh Steelers",
  "stl": "St. Louis Rams",
  "sd": "San Diego Chargers",
  "sf": "San Francisco 49ers",
  "sea": "Seattle Seahawks",
  "tb": "Tampa Bay Buccaneers",
  "ten": "Tennessee Titans",
  "was": "Washington Redskins"
}

// Simple in memory DATABASE
const DATABASE = [
  { name: 'Ross', isAdmin: true, passcode: 'RT23', id: 1, authorization: null  },
  { name: 'Tim',  isAdmin: true, passcode: 'RT24', id: 2, authorization: null  },
  { name: 'Sam',  passcode: 'RT25', id: 3, authorization: null  },
  { name: 'Andy',  passcode: 'AN25', id: 4, authorization: null  },
  { name: 'Drew',  passcode: 'DR25', id: 5, authorization: null  },
  { name: 'Brian',  passcode: 'BG25', id: 6, authorization: null  },
  { name: 'Bri',  passcode: 'BG26', id: 7, authorization: null  }
]

let WEEK = 3

let PICKS = [
  {userId: 1, week: 1, teamId: "det"},
  {userId: 1, week: 2, teamId: "arz"},
  {userId: 2, week: 1, teamId: "ind"},
  {userId: 2, week: 2, teamId: "ne"},
  {userId: 3, week: 1, teamId: "sea"},
  {userId: 4, week: 1, teamId: "arz"},
  {userId: 5, week: 1, teamId: "buf"},
  {userId: 5, week: 2, teamId: "nyg"},
  {userId: 6, week: 1, teamId: "ne"},
  {userId: 6, week: 2, teamId: "pit"},
  {userId: 6, week: 3, teamId: "den"},
  {userId: 7, week: 1, teamId: "sea"}
]

const sortByWeek = (a, b) => {
  if (a.week < b.week) return -1
  if (a.week > b.week) return 1
  return 0
}

const picksSorter = (a, b) => {
  if (a.userId < b.userId) return -1
  if (a.userId > b.userId) return 1
  if (a.week < b.week) return -1
  if (a.week > b.week) return 1
  return 0
}

const userNameSorter = (a, b) => {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

// Utility functions
const getUserId = req => parseInt(req.params.userId, 10)

const getUserPicks = userId => new Promise((res, rej) =>
  pool.query('SELECT * FROM Picks WHERE userId = ? order by week asc', [userId], (err, rows, fields) => {
    if (err) rej(err)
    console.log('Num picks queried:', rows.length);
    res(rows.map(r => ({
      week: r.week,
      teamId: r.teamId
    })))
  })
)

 const getPastUserPicks = userId =>
    PICKS.filter(pick => pick.userId === userId && pick.week !== WEEK).sort(sortByWeek)

const getAllPicks = () => PICKS.sort(picksSorter).map(({teamId, userId, week}) => ({
  teamId,
  week,
  userId,
  userName: (DATABASE.find(user => user.id === userId) || {}).name
}))

const getAllPastPicks = () => getAllPicks().filter(pick => pick.week < WEEK)

const getPicksCSV = (isOnlyPastPicks) => {
  let csv = '"Name"'
  for (let i = 1; i <= WEEK; ++i) {
    csv += `,"Week ${i}"`
  }
  csv += "\n"

  const sortedUsers = DATABASE.sort((a, b) => {
    const picks_a = PICKS.filter(pick => pick.userId === a.id).sort(sortByWeek)
    const picks_b = PICKS.filter(pick => pick.userId === b.id).sort(sortByWeek)
    if (picks_a.length > picks_b.length) return -1
    if (picks_a.length < picks_b.length) return 1
    if (!picks_a.length) return 0
    const lastPick_a = picks_a[picks_a.length - 1]
    const lastPick_b = picks_b[picks_b.length - 1]
    if (lastPick_a.teamId < lastPick_b.teamId) return -1
    if (lastPick_a.teamId > lastPick_b.teamId) return 1
    if (a.name < b.name) return -1
    if (a.name > b.name) return 1
    return 0
  })
  for (let i = 0; i < sortedUsers.length; ++i) {
    csv += `"${sortedUsers[i].name}"`
    const userPicks = isOnlyPastPicks
      ? getPastUserPicks(sortedUsers[i].id)
      : getUserPicks(sortedUsers[i].id)
    for (let i = 0; i < userPicks.length; ++i) {
      csv += `,"${userPicks[i].teamId.toUpperCase()}"`
    }
    csv += "\n"
  }
  return csv
}
const getAllPicksCSV = () => getPicksCSV(false)
const getPastPicksCSV = () => getPicksCSV(true)

const getWeeklyPick = userId => PICKS.find(pick => pick.userId === userId && pick.week === WEEK)

const hasPickedAlready = (userId, teamId) => !!PICKS.find(pick => pick.userId === userId && pick.teamId === teamId)

const getRandomCode = () => {
  return Math.random().toString(36).substr(2, 14);
}

const isRandomCodeUsed = code => !!DATABASE.find(user => user.authorization === code)

const getUserIdFromAuth = auth =>
  new Promise(function (resolve, reject) {
    pool.query('SELECT id FROM Users WHERE authorization = ?', [auth], (err, rows, fields) => {
      if (err) reject(err)
      if (rows.length > 0) resolve(rows[0].id)
      else reject()
    })
  })
const checkAuthentication = auth => getUserIdFromAuth(auth)



const isAdminAuthenticated = auth => {
  const user = DATABASE.find(user => user.authorization === auth) || {}
  return !!user.isAdmin
}

// API Routes
router.get('/users', function(req, res) {
    pool.query('SELECT id, name, email, isAdmin FROM footballpool.Users', function (err, rows, fields) {
      const users = rows.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      })).sort(userNameSorter)
      console.log('Response:', users)
      res.json(users)
    })
})

router.post('/:userId/login', function(req, res) {
    const { passcode } = req.body
    const userId = getUserId(req)

    if (!passcode) return res.status(400).json({error: "Must provide passcode"})

    pool.getConnection(function(err, connection) {
      connection.query('SELECT passcode = ? as authorized FROM footballpool.Users WHERE id = ?', [passcode, userId], function (err, rows, fields) {
        if (rows[0].authorized) {
          console.log('Authorization:', rows[0])
          let code = getRandomCode()
          while(isRandomCodeUsed(code)) {
            // add userId to make them unique to this user
            code = `${userId}.${getRandomCode()}`
          }
          connection.query('UPDATE footballpool.Users SET authorization = ? WHERE id = ?', [code, userId], function (err, rows, fields) {
            res.status(200).json({
              authorization: code,
            })
            connection.release()
          })
        } else {
          res.status(401).json({
            error: 'Wrong Password'
          })
          console.log('Response:', 401)
          connection.release();
        }
      })
    })
})

// get your previous picks
router.get('/pastPicks', async (req, res) => {
  const { authorization} = req.headers
  let userId
  try {
    userId = await checkAuthentication(authorization)
    console.log('UserId:', userId);
  } catch (e) {
    return res.status(401).json({
      error: 'Wrong Authorization'
    })
  }
  console.log('Retrieving Picks...');
  try {
    const picks = await getUserPicks(userId)
    console.log('Response:', picks)
    res.json(picks)
  } catch (e) {
    res.status(401).json({
      error: 'Error fetching picks'
    })
  }
})

router.get('/allPicks', (req, res) => {
  const { authorization} = req.headers
  if (!isAdminAuthenticated(authorization))
    return res.status(401).json({
      error: 'Wrong Authorization'
    })
  const picks = getAllPicks()
  console.log('Response:', picks)
  res.json(picks)
})

router.get('/allPastPicks', function(req, res) {
  const { authorization} = req.headers
  if (!checkAuthentication(authorization))
    return res.status(401).json({
      error: 'Wrong Authorization'
    })
  const pastPicks = getAllPastPicks()
  console.log('Response:', pastPicks)
  res.json(pastPicks)
})

router.route('/pick')
  .get(function(req, res) {
    const { authorization} = req.headers
    if (!checkAuthentication(authorization))
      return res.status(401).json({
        error: 'Wrong Authorization'
      })
    const userId = getUserIdFromAuth(authorization)
    const pick = getWeeklyPick(userId)
    console.log('Response:', pick)
    res.json(pick || {})
  })
  .post(function(req, res) {
    const { teamId } = req.body
    const { authorization} = req.headers
    if (!teamId)
      return res.status(400).json({
        error: 'teamId Required'
      })
    if (!checkAuthentication(authorization))
      return res.status(401).json({
        error: 'Wrong Passcode'
      })
    const userId = getUserIdFromAuth(authorization)
    if (hasPickedAlready(userId, teamId))
      return res.status(401).json({
        error: 'Cannot pick same team twice'
      })
    const pickObj = {userId, teamId, week: WEEK}
    // remove this week's pick if they have one
    PICKS = PICKS.filter(pick => !(pick.userId === userId && pick.week === WEEK ))
    // add the pick
    PICKS.push(pickObj)
    console.log('Response:', 'Ok')
    res.status(200).json(pickObj)
  })

router.get('/picksCSV', function(req, res) {
  const { authorization} = req.headers
  if (!isAdminAuthenticated(authorization))
    return res.status(401).json({
      error: 'Wrong Authorization'
    })
  const csv = getAllPicksCSV()
  console.log('Response:', csv)
  res.status(200).send(csv)
})

router.get('/pastPicksCSV', function(req, res) {
  const { authorization} = req.headers
  if (!checkAuthentication(authorization))
    return res.status(401).json({
      error: 'Wrong Authorization'
    })
  const csv = getPastPicksCSV()
  console.log('Response:', csv)
  res.status(200).send(csv)
})

router.get('/week', function(req, res) {
  res.status(200).json({week: WEEK})
})

router.post('/week', function(req, res) {
  const { week} = req.body
  const { authorization} = req.headers
  if (!isAdminAuthenticated(authorization))
    return res.status(401).json({
      error: 'Wrong Authorization'
    })
  WEEK = week
  console.log('Response:', WEEK)
  res.status(200).json({week: WEEK})
})

app.use('/api', router)
app.listen(port)
console.log(`API running at localhost:${port}/api`)
