const knex = require('../../services/knex')
const emqx = require('../../services/emqx')
const waitKey = require('../../services/waitKey')

const emqxWebhookRouter = require('./emqx_webhook')
const devicesRouter = require('./devices')

module.exports = async (fastify) => {
	await fastify.register(emqxWebhookRouter, { prefix: '/emqx/webhook' })
	await fastify.register(devicesRouter, { prefix: '/devices' })
	/**
	 * 因为发送给终端的内容可以是二进制
	 *
	 * 为了可扩展性，调用时，传的payload为BASE64
	 */
	fastify.post('/:product_name/:device_name/rpc', async (request, reply) => {
		const { product_name, device_name } = request.params
		request.log.info({ product_name, device_name }, 'request.params')

		const { command_name, payload, expires_at } = request.body
		request.log.info({ command_name, payload, expires_at }, 'request.body')

		const device = await knex.select('id').from('user').where({
			product_name,
			device_name,
		}).first()

		if (device === null || device === undefined) {
			reply.code(404).send('设备不存在')
			return
		}

		let final_expires_at = Math.floor(Date.now() / 1000) + process.env.RPC_MAX_TIMEOUT
		if (Number.isInteger(expires_at)) {
			final_expires_at = Math.min(expires_at, final_expires_at)
		}

		const request_id = await emqx.rpc(product_name, device_name, command_name, payload, final_expires_at)
		const res = await waitKey([product_name, device_name, command_name, request_id].join(':'), final_expires_at)
		if (res === null || res === undefined) {
			reply.code(404).send('请求超时')
			return
		}
		reply.send({
			payload: res,
		})
	})
}
