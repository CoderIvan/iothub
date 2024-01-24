const amqplib = require('amqplib')
const logger = require('./logger')
const emqx = require('./emqx')
const knex = require('./knex')

// 上行
const uploadDataExchange = 'iothub.upload.data'
const cmdRespExchange = 'iothub.cmd.resp'
// 下行
const cmdQueue = 'iothub.cmd'

// eslint-disable-next-line no-underscore-dangle
let __channel
const getChannel = async () => {
	if (!__channel) {
		const conn = await amqplib.connect(`amqp://${process.env.RABBITMQ_URL}`)
		__channel = await conn.createChannel()
		await __channel.assertExchange(uploadDataExchange, 'direct', { durable: true })
		await __channel.assertExchange(cmdRespExchange, 'direct', { durable: true })
		await __channel.assertQueue(cmdQueue, { durable: true })
		logger.info('amqp init finish')
	}
	return __channel
}

;(async function consume() {
	const channel = await getChannel()
	channel.consume(cmdQueue, async (msg) => {
		const {
			product_name,
			device_name,
			command_name,
			payload,
			request_id,
			expires_at,
		} = JSON.parse(msg.content.toString())

		logger.info({
			product_name,
			device_name,
			command_name,
			payload,
			request_id,
			expires_at,
		}, 'cmd')

		if (!product_name) {
			logger.warn({ msg: 'product name is nil' }, 'cmd')
			channel.ack(msg)
			return
		}

		if (!device_name) {
			logger.warn({ msg: 'device name is nil' }, 'cmd')
			channel.ack(msg)
			return
		}

		if (!command_name) {
			logger.warn({ msg: 'command name is nil' }, 'cmd')
			channel.ack(msg)
			return
		}

		if (!request_id) {
			logger.warn({ msg: 'request id is nil' }, 'cmd')
			channel.ack(msg)
			return
		}

		const device = await knex.select('id').from('user').where({
			product_name,
			device_name,
		}).first()

		if (device === null || device === undefined) {
			logger.warn({ msg: 'device not found' }, 'cmd')
			channel.ack(msg)
			return
		}

		await emqx.cmd(product_name, device_name, command_name, payload, request_id, expires_at)
		channel.ack(msg)
	})
}())

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
