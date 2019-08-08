const _ = require('lodash')
const Promise = require('promise')

const WEEKS = require('../config/weeks.json') // new weeks start at 5am Tuesdays (UTC)

const respond = (res, code, json) => {
  console.log('Response:', json)
  res.status(code).json(json)
}

const getRandomCode = () =>
  Math.random()
    .toString(36)
    .substr(2, 14)

const getWeek = () => {
  const today = new Date('2019-09-17T01:00:00.000Z')
  let week = 1
  for (const d in WEEKS) {
    const nextWeek = new Date(WEEKS[d])
    if (today > nextWeek) ++week
  }
  console.log('Week:', week)
  return week
}

const getUserIdFromAuth = (pool, auth) =>
  new Promise((resolve, reject) => {
    pool.query(
      'SELECT id FROM Users WHERE authorization = ?',
      [auth],
      (err, rows, fields) => {
        if (err || rows.length < 1) reject(err)
        else resolve(rows[0].id)
      }
    )
  })

const checkAuthentication = async (pool, auth, res) => {
  try {
    const userId = await getUserIdFromAuth(pool, auth)
    console.log('User Id:', userId)
    return userId
  } catch (e) {
    console.error(e)
    respond(res, 401, { error: 'Wrong Authorization' })
    throw e
  }
}

const checkAdminAuthentication = async (pool, auth, res) =>
  new Promise((resolve, reject) => {
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

const getAllPicks = (pool, pastPicksOnly, userId) =>
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
    console.log(sql)
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

const getUserPicks = (pool, userId) => getAllPicks(pool, true, userId)

const getAllPastPicks = pool => getAllPicks(pool, true)

const getPicksCSV = async (pool, isOnlyPastPicks) => {
  const week = getWeek()

  let csv = '"NAME"'
  for (let i = 1; i <= week; ++i) {
    csv += `,"WEEK ${i}"`
  }
  csv += '\n'

  let allPicks
  try {
    allPicks = Object.values(
      isOnlyPastPicks ? await getAllPastPicks(pool) : await getAllPicks(pool)
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

const userNameSorter = (a, b) => {
  if (a.name < b.name) return -1
  if (a.name > b.name) return 1
  return 0
}

module.exports = {
  respond,
  getWeek,
  checkAuthentication,
  checkAdminAuthentication,
  getUserPicks,
  getRandomCode,
  userNameSorter,
  getAllPicksCSV: pool => getPicksCSV(pool, false),
  getPastPicksCSV: pool => getPicksCSV(pool, true)
}
