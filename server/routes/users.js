const {
  respond,
  checkAuthentication,
  getRandomCode,
  userNameSorter
} = require('../utils/utils.js')

const getUsersHandler = pool => (req, res) => {
  pool.query('SELECT id, name FROM Users', function(err, rows, fields) {
    if (err) return respond(res, 500, { error: 'Error getting users' })
    const users = rows
      .map(user => ({
        id: user.id,
        name: user.name
      }))
      .sort(userNameSorter)
    respond(res, 200, users)
  })
}

const loginUserHandler = pool => async (req, res) => {
  const { authorization } = req.headers
  const { passcode } = req.body
  const userId = parseInt(req.params.userId, 10)

  pool.getConnection(async (err, connection) => {
    // if we pass an authorization, check to see if it is valid
    if (authorization) {
      let userId
      try {
        console.log('Trying to login user with authorization token...')
        userId = await checkAuthentication(pool, authorization, res, true)

        connection.query(
          'SELECT id, name, email, isAdmin FROM Users WHERE id = ?',
          [userId],
          (err, rows, fields) => {
            // Error
            if (err) {
              connection.release()
              return respond(res, 500, { error: 'Error getting user' })
            }

            // Success
            if (rows.length > 0) {
              const user = {
                id: rows[0].id,
                name: rows[0].name,
                email: rows[0].email,
                authorization,
                isAdmin: rows[0].isAdmin
              }
              respond(res, 200, user)
              connection.release()
            }
          }
        )
        // We authenticated with the authorization token so
        // we do not need to go any further
        return
      } catch (e) {
        console.log('Failed to authenticate with authorization token.')
      }
    }

    // authenticating with auth token did not work, so let's try passcode
    if (!passcode) return respond(res, 400, { error: 'Must provide passcode' })

    connection.query(
      'SELECT passcode = ? as authorized, id, name, email, isAdmin FROM Users WHERE id = ?',
      [passcode, userId],
      (err, rows, fields) => {
        // Error
        if (err) respond(res, 500, { error: 'Error checking passcode' })

        // Success
        if (rows[0].authorized) {
          console.log('Authorization:', rows[0])
          // add userId to make them unique to this user
          const code = `${userId}.${getRandomCode()}`
          connection.query(
            'UPDATE Users SET authorization = ? WHERE id = ?',
            [code, userId],
            err => {
              if (err) {
                respond(res, 500, { error: 'Error setting authorization' })
              } else {
                respond(res, 200, {
                  authorization: code,
                  name: rows[0].name,
                  email: rows[0].email,
                  id: rows[0].id,
                  isAdmin: rows[0].isAdmin
                })
              }
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
