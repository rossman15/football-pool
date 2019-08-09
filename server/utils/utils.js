const _ = require('lodash')
const Promise = require('promise')

const WEEKS = require('../config/weeks.json') // new weeks start at 5am Tuesdays (UTC)

const respond = (res, code, json) => {
  console.log(`Response [${code}]:`, json)
  res.status(code).json(json)
}

const getRandomCode = () =>
  Math.random()
    .toString(36)
    .substr(2, 14)

const getWeek = pool =>
  new Promise((resolve, reject) => {
    pool.query(
      'SELECT max(week) as week FROM VisibleWeeks WHERE visible = 1',
      (err, rows, fields) => {
        if (err) return reject(err || 'Error fetching week')
        console.log('Week: ', rows[0].week + 1)
        resolve((rows[0].week || 0) + 1)
      }
    )
  })

const getUserIdFromAuth = (pool, auth) =>
  new Promise((resolve, reject) => {
    pool.query(
      'SELECT id FROM Users WHERE authorization = ?',
      [auth],
      (err, rows, fields) => {
        if (err || rows.length < 1)
          reject(err || 'No authorization token match')
        else resolve(rows[0].id)
      }
    )
  })

const checkAuthentication = async (pool, auth, res, skipResponse) => {
  try {
    const userId = await getUserIdFromAuth(pool, auth)
    console.log('User Id:', userId)
    return userId
  } catch (e) {
    console.error('Error with Authentication:', e)
    if (!skipResponse) respond(res, 401, { error: 'Wrong Authentication' })
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
          respond(res, 401, { error: 'Wrong Admin Authentication' })
        } else {
          console.log('Admin User Id:', rows[0].id)
          resolve()
        }
      }
    )
  })

const getAllPicks = (pool, visiblePicksOnly, userId) =>
  new Promise(async (res, rej) => {
    console.log('Fetching All Picks...:')
    const week = await getWeek(pool)

    // construct sql
    let sql = `SELECT id, name, email, p.week, teamId FROM Picks p
      ${visiblePicksOnly ? ' JOIN VisibleWeeks v ON(p.week = v.week) ' : ''}
      JOIN Users u ON(u.id = p.userId) `
    let whereClause = ''
    const data = []
    if (visiblePicksOnly) {
      whereClause += 'WHERE v.visible = 1'
    } else {
      whereClause += 'WHERE p.week <= ?'
      data.push(week)
    }

    if (userId) {
      whereClause += ' AND u.id = ?'
      data.push(userId)
    }

    const orderByClause = ' ORDER BY id ASC, p.week ASC'
    console.log(sql + whereClause + orderByClause)
    return pool.query(
      sql + whereClause + orderByClause,
      data,
      (err, rows, fields) => {
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
      }
    )
  })

const getUserPicks = (pool, userId) => getAllPicks(pool, true, userId)

const getAllVisiblePicks = pool => getAllPicks(pool, true)

const picksSorter = (a, b) => {
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
}

const getPicksCSV = async (pool, isOnlyPastPicks) => {
  const week = await getWeek(pool)

  let csv = '"NAME"'
  for (let i = 1; i <= week; ++i) {
    csv += `,"WEEK ${i}"`
  }
  csv += '\n'

  let allPicks
  try {
    allPicks = Object.values(
      isOnlyPastPicks ? await getAllVisiblePicks(pool) : await getAllPicks(pool)
    )
  } catch (e) {
    console.error(e)
    console.error('Error fetching picks')
    throw e
  }

  // allPicks is an array of arrays (of picks, one for each user)
  const sortedUsers = allPicks.sort(picksSorter)

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
  getAllPicks,
  getAllVisiblePicks,
  getAllPicksCSV: pool => getPicksCSV(pool, false),
  getVisiblePicksCSV: pool => getPicksCSV(pool, true)
}
