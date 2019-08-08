const {
  respond,
  getWeek,
  checkAuthentication,
  checkAdminAuthentication,
  getAllPicks,
  getUserPicks,
  getAllVisiblePicks
} = require('../utils/utils.js')

const TEAMS = require('../config/teams.json')

const getPickHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  let userId
  try {
    userId = await checkAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }
  const week = await getWeek(pool)
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
}

const postPickHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  const { teamId } = req.body
  let userId
  try {
    userId = await checkAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }

  if (!teamId) return respond(res, 400, { error: 'teamId Required' })
  if (!TEAMS[teamId]) return respond(res, 400, { error: 'Invalid teamId' })
  const week = await getWeek(pool)

  // Check if user already picked this team
  pool.getConnection((err, connection) => {
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
}

const getAllVisiblePicksHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  try {
    await checkAdminAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }

  try {
    const visiblePicks = await getAllVisiblePicks(pool)
    respond(res, 200, visiblePicks)
  } catch (e) {
    console.error(e)
    respond(res, 500, { error: 'Error fetching visible picks' })
  }
}

const getAllPicksHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  try {
    await checkAdminAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }

  const picks = await getAllPicks(pool)
  respond(res, 200, picks)
}

const getUsersVisiblePicksHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  let userId
  try {
    userId = await checkAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }
  try {
    const picks = await getUserPicks(pool, userId)
    respond(res, 200, picks)
  } catch (e) {
    console.error(e)
    respond(res, 500, { error: 'Error fetching picks' })
  }
}

module.exports = {
  getPickHandler,
  postPickHandler,
  getAllVisiblePicksHandler,
  getAllPicksHandler,
  getUsersVisiblePicksHandler
}
