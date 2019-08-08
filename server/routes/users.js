const { respond, getRandomCode, userNameSorter } = require('../utils/utils.js')

const getUsersHandler = pool => (req, res) => {
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
}

const loginUserHandler = pool => (req, res) => {
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
}

module.exports = { loginUserHandler, getUsersHandler }
