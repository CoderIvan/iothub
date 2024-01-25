const redis = require('redis')
const { REDIS } = require('../config')

let client

const getClient = async () => {
	if (!client) {
		client = await redis.createClient({
			url: `redis://${REDIS.HOST}:${REDIS.PORT}`,
		}).connect()
	}
	return client
}

getClient()

module.exports = {
	getClient,
}
