const redis = require('redis')

const getClientPromise = redis.createClient({
	url: 'redis://vm01:6379',
}).connect()

const getClient = () => getClientPromise

module.exports = {
	getClient,
}
