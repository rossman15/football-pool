const {
  respond,
  getWeek: getWeekUtil,
  checkAdminAuthentication
} = require('../utils/utils.js')
const _ = require('lodash')

const getWeekHandler = pool => async (req, res) => {
  const week = await getWeekUtil(pool)
  respond(res, 200, { week })
}

const postVisibleWeekHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  const { week, visible } = req.body
  if (!week || _.isUndefined(visible)) {
    return respond(res, 400, { error: 'Must provide week and visibility' })
  }
  try {
    await checkAdminAuthentication(pool, authorization, res)
  } catch (e) {
    return
  }

  console.log('Setting visible week:', week)
  pool.query(
    'UPDATE VisibleWeeks SET visible = ? WHERE week = ?',
    [visible ? 1 : 0, week],
    function(err, rows, fields) {
      if (err) return respond(res, 500, { error: 'Error setting visible week' })
      respond(res, 200, {
        week,
        visible
      })
    }
  )
}

module.exports = {
  getWeekHandler,
  postVisibleWeekHandler
}
