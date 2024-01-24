const jwt = require('jsonwebtoken')

const key = 'emqxsecret'

module.exports = (username = 'ivan_jwt') => {
	const now = Math.floor(Date.now() / 1000)
	const password = jwt.sign({
		username,
		exp: now + 10,
		iat: now - 10,
	}, key)
	return password
}
