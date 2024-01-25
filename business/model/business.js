const EventEmitter = require('events')
const amqplib = require('amqplib')
const axios = require('axios')

const logger = require('../logger')
const { RABBIT_MQ, IOTHUB_API } = require('../config')

async function requestIotHub(uri, data) {
	const url = `${IOTHUB_API.ADDRESS}/api/${uri}`
	logger.info({
		url,
		data,
	}, 'emqx api request')
	const now = Date.now()
	const result = await axios.post(url, data)
	logger.info({
		status: result.status,
		statusText: result.statusText,
		data: result.data,
		useTime: `${Date.now() - now}ms`,
	}, 'emqx api response')

	return result.data
}

class Business extends EventEmitter {
	constructor(routingKey) {
		super()
		this.routingKey = routingKey
	}

	async getChannel() {
		if (!this.channel) {
			this.conn = await amqplib.connect(RABBIT_MQ.ADDRESS)
			this.channel = await this.conn.createChannel()
		}
		return this.channel
	}

	async consumeUploadData(queue, onMessage) {
		const channel = await this.getChannel()
		channel.assertExchange(RABBIT_MQ.UPLOAD_DATA_EXCHANGE, 'direct', { durable: true })
		await channel.assertQueue(queue, { durable: true })
		await channel.bindQueue(queue, RABBIT_MQ.UPLOAD_DATA_EXCHANGE, this.routingKey)
		channel.consume(queue, (msg) => {
			onMessage(JSON.parse(msg.content.toString()))
			channel.ack(msg)
		})
	}

	async consumeCMDResp(queue, onMessage) {
		const channel = await this.getChannel()
		channel.assertExchange(RABBIT_MQ.CMD_RESP_EXCHANGE, 'direct', { durable: true })
		await channel.assertQueue(queue, { durable: true })
		await channel.bindQueue(queue, RABBIT_MQ.CMD_RESP_EXCHANGE, this.routingKey)
		channel.consume(queue, (msg) => {
			onMessage(JSON.parse(msg.content.toString()))
			channel.ack(msg)
		})
	}

	// eslint-disable-next-line class-methods-use-this
	async sendCMD(product_name, device_name, command_name, payload, expires_at) {
		return requestIotHub(`${product_name}/${device_name}/cmd`, {
			command_name,
			payload,
			expires_at,
		})
	}

	// eslint-disable-next-line class-methods-use-this
	async sendRPC(product_name, device_name, command_name, payload) {
		return requestIotHub(`${product_name}/${device_name}/rpc`, {
			command_name,
			payload,
		})
	}
}

module.exports = Business
