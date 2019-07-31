const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mysql = require('mysql')
const Promise = require('promise')
const _ = require('lodash')

const TEAMS = require('./config/teams.json')
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

/*****************  Functions  *****************/

const userNameSorter = (a, b) => {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

// Utility functions
// TODO
const getWeek = () => {
  return 4
}

const getUserPicks = userId =>
  new Promise((res, rej) => {
    console.log('Fetching User Picks...:')
    return pool.query(
      'SELECT * FROM Picks WHERE userId = ? order by week asc',
      [userId],
      (err, rows, fields) => {
        if (err) rej(err)
        console.log('Num picks queried:', rows.length)
        res(
          rows.map(r => ({
            week: r.week,
            teamId: r.teamId
          }))
        )
      }
    )
  })

// grouped by users
/*
  {
    <userId>: [
      {id, name, email, week, teamId},
      ...
    ]
  }
*/
const getAllPicks = (pastPicksOnly, userId) =>
  new Promise((res, rej) => {
    console.log('Fetching All Picks...:')
    const week = getWeek()

    // oncstruct where clause
    let whereClause = `WHERE week <${pastPicksOnly ? '' : '='} ?`
    whereClause += userId ? ' AND id = ?' : ''

    // sql
    let sql = `SELECT id, name, email, week, teamId FROM Picks p
    JOIN Users u on(u.id = p.userId) ${whereClause}
    ORDER BY id ASC, week ASC`
    return pool.query(sql, [week, userId], (err, rows, fields) => {
      if (err) rej(err)
      console.log('Num picks queried:', rows.length)
      res(
        _.groupBy(
          rows.map(r => ({
            id: r.id,
            name: r.name,
            email: r.email,
            week: r.week,
            teamId: r.teamId
          })),
          'id'
        )
      )
    })
  })

const getAllPastPicks = () => getAllPicks(true)

const getPicksCSV = async isOnlyPastPicks => {
  const week = getWeek()

  let csv = '"NAME"'
  for (let i = 1; i <= week; ++i) {
    csv += `,"WEEK ${i}"`
  }
  csv += '\n'

  let allPicks
  try {
    allPicks = Object.values(
      isOnlyPastPicks ? await getAllPastPicks() : await getAllPicks()
    )
  } catch (e) {
    console.error(e)
    console.error('Error fetching picks')
    throw e
  }

  // allPicks is an array of arrays (of picks, one for each user)
  const sortedUsers = allPicks.sort((a, b) => {
    if (a.length > b.length) return -1
    if (a.length < b.length) return 1
    if (!a.length) return 0
    const lastPick_a = a[a.length - 1]
    const lastPick_b = b[b.length - 1]
    if (lastPick_a.teamId < lastPick_b.teamId) return -1
    if (lastPick_a.teamId > lastPick_b.teamId) return 1
    if (lastPick_a.name < lastPick_b.name) return -1
    if (lastPick_a.name > lastPick_b.name) return 1
    return 0
  })

  sortedUsers.forEach(userPicks => {
    csv += `"${userPicks[0].name}"`
    userPicks.forEach(pick => {
      csv += `,"${pick.teamId.toUpperCase()}"`
    })
    csv += '\n'
  })
  return csv
}

const getAllPicksCSV = () => getPicksCSV(false)
const getPastPicksCSV = () => getPicksCSV(true)

const getUserIdFromAuth = auth =>
  new Promise(function(resolve, reject) {
    pool.query(
      'SELECT id FROM Users WHERE authorization = ?',
      [auth],
      (err, rows, fields) => {
        if (err || rows.length < 1) reject(err)
        else resolve(rows[0].id)
      }
    )
  })

const checkAuthentication = async (auth, res) => {
  try {
    const userId = await getUserIdFromAuth(auth)
    console.log('User Id:', userId)
    return userId
  } catch (e) {
    console.error(e)
    respond(res, 401, { error: 'Wrong Authorization' })
    throw e
  }
}

const checkAdminAuthentication = async (auth, res) =>
  new Promise(function(resolve, reject) {
    pool.query(
      'SELECT id FROM Users WHERE authorization = ? and isAdmin IS TRUE',
      [auth],
      (err, rows, fields) => {
        if (err || rows.length < 1) {
          reject(err)
          res.status(401).json({
            error: 'Wrong Admin Authorization'
          })
          throw err
        } else {
          console.log('Admin User Id:', rows[0].id)
          resolve()
        }
      }
    )
  })

const getRandomCode = () =>
  Math.random()
    .toString(36)
    .substr(2, 14)

const respond = (res, code, json) => {
  console.log('Response:', json)
  res.status(code).json(json)
}

/*****************  API Routes  *****************/

// get all users
router.get('/users', function(req, res) {
  pool.query('SELECT id, name, email, isAdmin FROM Users', function(
    err,
    rows,
    fields
  ) {
    if (err) return respond(res, 500, { error: 'Error getting users' })
    const users = rows
      .map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin
      }))
      .sort(userNameSorter)
    respond(res, 200, users)
  })
})

router.post('/:userId/login', function(req, res) {
  const { passcode } = req.body
  const userId = parseInt(req.params.userId, 10)

  if (!passcode) return respond(res, 400, { error: 'Must provide passcode' })

  pool.getConnection(function(err, connection) {
    connection.query(
      'SELECT passcode = ? as authorized FROM Users WHERE id = ?',
      [passcode, userId],
      function(err, rows, fields) {
        if (rows[0].authorized) {
          console.log('Authorization:', rows[0])
          // add userId to make them unique to this user
          const code = `${userId}.${getRandomCode()}`
          connection.query(
            'UPDATE Users SET authorization = ? WHERE id = ?',
            [code, userId],
            function(err, rows, fields) {
              respond(res, 200, { authorization: code })
              connection.release()
            }
          )
        } else {
          respond(res, 401, { error: 'Wrong Password' })
          connection.release()
        }
      }
    )
  })
})

// get YOUR previous picks
router.get('/pastPicks', async (req, res) => {
  const { authorization } = req.headers
  let userId
  try {
    userId = await checkAuthentication(authorization, res)
  } catch (e) {
    return
  }
  try {
    const picks = await getUserPicks(userId)
    respond(res, 200, picks)
  } catch (e) {
    console.error(e)
    respond(res, 500, { error: 'Error fetching picks' })
  }
})

// get everyone's picks
router.get('/allPicks', async (req, res) => {
  const { authorization } = req.headers
  try {
    await checkAdminAuthentication(authorization, res)
  } catch (e) {
    return
  }

  const picks = await getAllPicks()
  respond(res, 200, picks)
})

// get everyone's past picks
router.get('/allPastPicks', async function(req, res) {
  const { authorization } = req.headers
  try {
    await checkAdminAuthentication(authorization, res)
  } catch (e) {
    return
  }

  try {
    const pastPicks = await getAllPastPicks()
    respond(res, 200, pastPicks)
  } catch (e) {
    console.error(e)
    respond(res, 500, { error: 'Error fetching past picks' })
  }
})

// get this week's pick
router
  .route('/pick')
  .get(async function(req, res) {
    const { authorization } = req.headers
    let userId
    try {
      userId = await checkAuthentication(authorization, res)
    } catch (e) {
      return
    }

    const week = getWeek()

    pool.query(
      'SELECT * FROM Picks WHERE userId = ? AND week = ?',
      [userId, week],
      function(err, rows, fields) {
        if (err) return respond(res, 500, { error: 'Error getting users' })
        if (rows.length < 1) return respond(res, 200, {})
        respond(res, 200, {
          week: rows[0].week,
          teamId: rows[0].teamId
        })
      }
    )
  })
  .post(async function(req, res) {
    const { authorization } = req.headers
    const { teamId } = req.body
    let userId
    try {
      userId = await checkAuthentication(authorization, res)
    } catch (e) {
      return
    }

    if (!teamId) return respond(res, 400, { error: 'teamId Required' })
    if (!TEAMS[teamId]) return respond(res, 400, { error: 'Invalid teamId' })
    const week = getWeek()

    // Check if user already picked this team
    pool.getConnection(function(err, connection) {
      connection.query(
        'SELECT * FROM Picks WHERE userId = ? AND week < ? AND teamId = ?',
        [userId, week, teamId],
        function(err, rows, fields) {
          if (err) {
            connection.release()
            return respond(res, 500, {
              error: 'Error checking for duplicate pick'
            })
          }
          if (rows.length > 0) {
            connection.release()
            return respond(res, 400, {
              error: 'Cannot pick same team twice'
            })
          }

          // Insert or update this week's pick
          console.log(`Inserting pick: week (${week}) team (${teamId})`)
          connection.query(
            'REPLACE INTO Picks (userId, week, teamId) VALUES (?, ?, ?)',
            [userId, week, teamId],
            function(err, rows, fields) {
              if (err) {
                connection.release()
                return respond(res, 500, {
                  error: 'Error making pick'
                })
              }
              respond(res, 200, {
                week: week,
                teamId: teamId
              })
              connection.release()
            }
          )
        }
      )
    })
  })

router.get('/picksCSV', async function(req, res) {
  const { authorization } = req.headers
  try {
    await checkAuthentication(authorization, res)
  } catch (e) {
    return
  }

  let csv
  try {
    csv = await getAllPicksCSV()
  } catch (e) {
    console.error(e)
    respond(res, 500, { error: 'Error creating csv' })
  }
  console.log('Response:', csv)
  res.status(200).send(csv)
})

router.get('/pastPicksCSV', async function(req, res) {
  const { authorization } = req.headers
  try {
    await checkAuthentication(authorization, res)
  } catch (e) {
    return
  }

  let csv
  try {
    csv = await getPastPicksCSV()
  } catch (e) {
    console.error(e)
    respond(res, 500, { error: 'Error creating csv' })
  }
  console.log('Response:', csv)
  res.status(200).send(csv)
})

router.get('/week', function(req, res) {
  respond(res, 200, { week: getWeek() })
})

// router.post('/week', async function(req, res) {
//   const { week} = req.body
//   const { authorization } = req.headers
//   try { await checkAuthentication(authorization, res) }
//   catch (e) { return }
//
//   WEEK = week
//   console.log('Response:', WEEK)
//   res.status(200).json({week: WEEK})
// })

app.use('/api', router)
app.listen(port)
console.log(`API running at localhost:${port}/api`)
