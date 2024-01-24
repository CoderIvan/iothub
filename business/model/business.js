require('dotenv').config()
const EventEmitter = require('events')
const amqplib = require('amqplib')
const axios = require('axios')

const logger = require('../logger')

class Business extends EventEmitter {
	constructor(routingKey) {
		super()
		this.routingKey = routingKey
	}

	async getChannel() {
		if (!this.channel) {
			this.conn = await amqplib.connect(process.env.URL)
			this.channel = await this.conn.createChannel()
		}
		return this.channel
	}

	async consumeUploadData(queue, onMessage) {
		const channel = await this.getChannel()
		channel.assertExchange(process.env.UPLOAD_DATA_EXCHANGE, 'direct', { durable: true })
		await channel.assertQueue(queue, { durable: true })
		await channel.bindQueue(queue, process.env.UPLOAD_DATA_EXCHANGE, this.routingKey)
		channel.consume(queue, (msg) => {
			onMessage(JSON.parse(msg.content.toString()))
			channel.ack(msg)
		})
	}

	async consumeCMDResp(queue, onMessage) {
		const channel = await this.getChannel()
		channel.assertExchange(process.env.CMD_RESP_EXCHANGE, 'direct', { durable: true })
		await channel.assertQueue(queue, { durable: true })
		await channel.bindQueue(queue, process.env.CMD_RESP_EXCHANGE, this.routingKey)
		channel.consume(queue, (msg) => {
			onMessage(JSON.parse(msg.content.toString()))
			channel.ack(msg)
		})
	}

	// eslint-disable-next-line class-methods-use-this
	async sendCMD(req) {
		const channel = await this.getChannel()
		await channel.sendToQueue(process.env.CMD_QUEQUE, Buffer.from(JSON.stringify(req)))
	}

	// eslint-disable-next-line class-methods-use-this
	async rpc(product_name, device_name, command_name, payload) {
		const url = `http://${process.env.IOTHUB_API_ADDRESS}/api/${product_name}/${device_name}/rpc`
		const data = {
			command_name,
			payload,
		}
		logger.info({
			url,
			data,
		}, 'emqx api request')
		const result = await axios.post(url, data)
		logger.info({
			status: result.status,
			statusText: result.statusText,
			data: result.data,
		}, 'emqx api response')

		return result.data
	}
}

module.exports = Business
