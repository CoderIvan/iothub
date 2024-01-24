const axios = require('axios')
const { v4: uuidv4 } = require('uuid')

const logger = require('./logger')

/**
 *
 * cmd/:ProductName/:DeviceName/:CommandName/:RequestID/:ExpiresAt
 *
 */
async function cmd(productName, deviceName, commandName, payload, requestID, expiresAt) {
	const topicArray = ['cmd', productName, deviceName, commandName, requestID]
	if (Number.isInteger(expiresAt)) {
		if (expiresAt <= Math.floor(Date.now() / 1000) - 8) {
			return null
		}
		topicArray.push(expiresAt)
	}
	const topic = topicArray.join('/')

	logger.info({ topic, payload }, 'emqx api request')

	const result = await axios.post(`http://${process.env.EMQX_API_ADDRESS}/api/v5/publish`, {
		payload_encoding: 'base64',
		qos: 1,
		topic,
		payload,
		// retain: true,
	}, {
		auth: {
			username: process.env.EMQX_API_USERNAME,
			password: process.env.EMQX_API_PASSWORD,
		},
	})

	logger.info({
		status: result.status,
		statusText: result.statusText,
		data: result.data,
	}, 'emqx api response')

	return requestID
}

/**
 *
 * rpc/:ProductName/:DeviceName/:CommandName/:RequestID/:ExpiresAt
 * payload 必须是BASE64编码
 */
async function rpc(productName, deviceName, commandName, payload, expiresAt) {
	const requestID = uuidv4().replace(/-/g, '')

	const topicArray = ['rpc', productName, deviceName, commandName, requestID]
	if (Number.isInteger(expiresAt)) {
		if (expiresAt <= Math.floor(Date.now() / 1000) - 8) {
			return null
		}
		topicArray.push(expiresAt)
	}
	const topic = topicArray.join('/')

	logger.info({ topic, payload }, 'emqx api request')

	const result = await axios.post(`http://${process.env.EMQX_API_ADDRESS}/api/v5/publish`, {
		payload_encoding: 'base64',
		qos: 1,
		topic,
		payload,
	}, {
		auth: {
			username: process.env.EMQX_API_USERNAME,
			password: process.env.EMQX_API_PASSWORD,
		},
	})

	logger.info({
		status: result.status,
		statusText: result.statusText,
		data: result.data,
	}, 'emqx api response')

	return requestID
}

module.exports = {
	cmd,
	rpc,
}
