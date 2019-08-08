const {
  respond,
  getWeek,
  checkAuthentication,
  checkAdminAuthentication,
  getAllPicksCSV,
  getVisiblePicksCSV
} = require('../utils/utils.js')

const getPicksCSVHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  try {
    await checkAdminAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }

  let csv
  try {
    csv = await getAllPicksCSV(pool)
  } catch (e) {
    console.error(e)
    respond(res, 500, { error: 'Error creating csv' })
  }
  console.log('Response:', csv)

  res
    .set('Content-Type', 'text/csv')
    .set('Content-Disposition', `attachment; filename="Current Picks.csv"`)
    .set('Cache-Control', 'no-cache')
    .set('Pragma', 'no-cache')
    .status(200)
    .send(csv)
}

const getVisiblePicksCSVhandler = pool => async (req, res) => {
  const { authorization } = req.headers
  const week = await getWeek(pool)
  try {
    await checkAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }

  let csv
  try {
    csv = await getVisiblePicksCSV(pool)
  } catch (e) {
    console.error(e)
    respond(res, 500, { error: 'Error creating csv' })
  }
  console.log('Response:', csv)
  res
    .set('Content-Type', 'text/csv')
    .set(
      'Content-Disposition',
      `attachment; filename="Week ${week - 1} Results.csv"`
    )
    .set('Cache-Control', 'no-cache')
    .set('Pragma', 'no-cache')
    .status(200)
    .send(csv)
}

module.exports = { getVisiblePicksCSVhandler, getPicksCSVHandler }
