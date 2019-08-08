const { respond, checkAdminAuthentication } = require('../utils/utils.js')

const getGamesHandler = pool => (req, res) => {
  const { week, teamId } = req.query

  // Construct the query
  let sql = 'SELECT * FROM Games'
  let data = []

  if (teamId || week) sql += ' WHERE '
  if (week) {
    sql += 'week = ?'
    data.push(week)
  }
  if (week && teamId) sql += ' AND '
  if (teamId) {
    sql += '(homeTeamId = ? OR awayTeamId = ?)'
    data.push(teamId, teamId)
  }
  sql += ' ORDER BY week, date, homeTeamId'

  console.log('Querying for games...\n', sql)
  // Query
  pool.query(sql, data, (err, rows, fields) => {
    if (err) return respond(res, 500, { error: 'Error getting games' })
    respond(res, 200, rows)
  })
}

const postGamesHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  const { week, teamId } = req.body
  try {
    await checkAdminAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }

  const sql = `UPDATE Games SET winner = ?
    WHERE week = ? AND (homeTeamId = ? OR awayTeamId = ?)`
  const data = [teamId, week, teamId, teamId]

  console.log(`Setting winner of week ${week} to ${teamId}...\n`, sql)
  // Query
  pool.query(sql, data, (err, rows, fields) => {
    if (err) return respond(res, 500, { error: 'Error updating game' })
    respond(res, 200, {
      teamId,
      week
    })
  })
}

module.exports = {
  getGamesHandler,
  postGamesHandler
}
