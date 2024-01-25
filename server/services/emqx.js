const axios = require('axios')
const config = require('../config')

const logger = require('./logger')

async function publish(topic, payload, qos = 1) {
	logger.info({
		qos,
		topic,
		payload,
	}, 'emqx api request')

	const now = Date.now()
	const result = await axios.post(`http://${config.EMQX_API_ADDRESS}/api/v5/publish`, {
		payload_encoding: 'base64',
		qos,
		topic,
		payload,
	}, {
		auth: {
			username: config.EMQX_API_USERNAME,
			password: config.EMQX_API_PASSWORD,
		},
	})

	logger.info({
		status: result.status,
		statusText: result.statusText,
		data: result.data,
		useTime: `${Math.floor(Date.now() - now)}ms`,
	}, 'emqx api response')

	return result
}

module.exports = {
	publish,
}
