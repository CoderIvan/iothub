const { getClient } = require('./redis')

async function sleep(ms) {
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve()
		}, ms * 1000)
	})
}

const RPC_DELAY = Number(process.env.RPC_DELAY || '10')

async function waitKey(key, expireAt) {
	const redis = await getClient()
	while (Math.floor(Date.now() / 1000) < expireAt) {
		// eslint-disable-next-line no-await-in-loop
		const value = await redis.get(key)
		if (value !== null && value !== undefined) {
			return value
		}
		sleep(RPC_DELAY)
	}
	return null
}

module.exports = waitKey
