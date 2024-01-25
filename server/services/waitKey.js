const { getClient } = require('./redis')
const config = require('../config')

async function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, ms * 1000)
	})
}

async function waitKey(key, expireAt) {
	const expireAtMS = expireAt * 1000
	const redis = await getClient()
	while (Date.now() < expireAtMS) {
		// eslint-disable-next-line no-await-in-loop
		const value = await redis.get(key)
		if (value !== null && value !== undefined) {
			return value
		}
		sleep(config.RPC.DELAY)
	}
	return null
}

module.exports = waitKey
