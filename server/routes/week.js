const { respond, getWeek: getWeekUtil } = require('../utils/utils.js')

const getWeekHandler = (req, res) => {
  respond(res, 200, { week: getWeekUtil() })
}

module.exports = { getWeekHandler }
