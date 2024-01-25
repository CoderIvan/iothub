const amqplib = require('amqplib')
const logger = require('./logger')
const config = require('../config')

// 上行
const uploadDataExchange = 'iothub.upload.data'
const cmdRespExchange = 'iothub.cmd.resp'

// eslint-disable-next-line no-underscore-dangle
let __channel
const getChannel = async () => {
	if (!__channel) {
		const conn = await amqplib.connect(`amqp://${config.RABBITMQ_URL}`)
		__channel = await conn.createChannel()
		await __channel.assertExchange(uploadDataExchange, 'direct', { durable: true })
		await __channel.assertExchange(cmdRespExchange, 'direct', { durable: true })
		logger.info('amqp init finish')
	}
	return __channel
}

module.exports = {
	publishUploadData: async (routingKey, content) => {
		const channel = await getChannel()

		channel.publish(uploadDataExchange, routingKey, content)
	},

	publishCmd: async (routingKey, content) => {
		const channel = await getChannel()

		channel.publish(cmdRespExchange, routingKey, content)
	},
}
