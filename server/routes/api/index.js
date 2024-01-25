const knex = require('../../services/knex')
const emqx = require('../../services/emqx')
const waitKey = require('../../services/waitKey')
const getRequestID = require('../../services/request_id')
const emqxWebhookRouter = require('./emqx_webhook')
const devicesRouter = require('./devices')
const config = require('../../config')

module.exports = async (fastify) => {
	await fastify.register(emqxWebhookRouter, { prefix: '/emqx/webhook' })
	await fastify.register(devicesRouter, { prefix: '/devices' })

	fastify.post('/:product_name/:device_name/cmd', async (request, reply) => {
		const { product_name, device_name } = request.params
		const { command_name, payload, expires_at } = request.body
		const device = await knex
			.select('id')
			.from('user')
			.where({
				product_name,
				device_name,
			})
			.first()

		if (device === null || device === undefined) {
			reply.code(404).send('设备不存在')
			return
		}

		const request_id = getRequestID()
		const topics = ['cmd', product_name, device_name, command_name, request_id]
		if (Number.isInteger(expires_at)) {
			topics.push(expires_at)
		}
		const topic = topics.join('/')
		await emqx.publish(topic, payload)

		reply.send({
			request_id,
		})
	})

	fastify.post('/:product_name/:device_name/rpc', async (request, reply) => {
		const { product_name, device_name } = request.params
		const { command_name, payload } = request.body
		const device = await knex
			.select('id')
			.from('user')
			.where({
				product_name,
				device_name,
			})
			.first()

		if (device === null || device === undefined) {
			reply.code(404).send('设备不存在')
			return
		}

		const expires_at = Math.floor(Date.now() / 1000) + config.RPC.TIMEOUT
		const request_id = getRequestID()
		const topic = ['rpc', product_name, device_name, command_name, request_id, expires_at].join('/')

		await emqx.publish(topic, payload)
		const res = await waitKey([product_name, device_name, command_name, request_id].join(':'), expires_at)
		if (res === null || res === undefined) {
			reply.code(404).send('请求超时')
			return
		}
		reply.send({
			payload: res,
		})
	})
}
