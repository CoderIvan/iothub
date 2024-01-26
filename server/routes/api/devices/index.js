const { v4: uuidv4 } = require('uuid')

const knex = require('../../../services/knex')

module.exports = async (fastify) => {
	fastify.post('/', async (request, reply) => {
		const { product_name, device_name, password } = request.body

		const device = await knex.select('id').from('user').where({
			product_name,
			device_name,
		}).first()

		if (device !== null && device !== undefined) {
			reply.code(404).send('设备已存在')
			return
		}

		const salt = uuidv4().replace(/-/g, '')
		const username = `${product_name}/${device_name}`
		await knex.transaction(async (trx) => {
			await trx('user').insert({
				product_name,
				device_name,
				username,
				password_hash: knex.raw(`SHA2(concat('${password}', '${salt}'), 256)`),
				salt,
				create_at: Math.floor(Date.now() / 1000),
			})

			await trx('acl').insert([{
				username,
				permission: 'allow',
				action: 'publish',
				// upload/data/:ProductName/:DeviceName/:DataVersion/:DataType/:MessageID
				topic: `upload/data/${product_name}/${device_name}/+/+/#`,
			}, {
				username,
				permission: 'allow',
				action: 'publish',
				// get/:ProductName/:DeviceName/:Resource/:MessageID
				topic: `get/${product_name}/${device_name}/+/#`,
			}, {
				username,
				permission: 'allow',
				action: 'subscribe',
				// cmd/:ProductName/:DeviceName/:CommandName/:RequestID/:ExpiresAt
				topic: `cmd/${product_name}/${device_name}/+/+/#`,
			}, {
				username,
				permission: 'allow',
				action: 'publish',
				// cmd/resp/:ProductName/:DeviceName/:CommandName/:RequestID
				topic: `cmd/resp/${product_name}/${device_name}/+/+`,
			}, {
				username,
				permission: 'allow',
				action: 'subscribe',
				// rpc/:ProductName/:DeviceName/:CommandName/:RequestID/:ExpiresAt
				topic: `rpc/${product_name}/${device_name}/+/+/#`,
			}, {
				username,
				permission: 'allow',
				action: 'publish',
				// rpc/resp/:ProductName/:DeviceName/:CommandName/:RequestID
				topic: `rpc/resp/${product_name}/${device_name}/+/+`,
			}])
		})
		reply.send()
	})

	fastify.delete('/', async (request, reply) => {
		const { product_name, device_name } = request.body
		const username = `${product_name}/${device_name}`
		await knex.transaction(async (trx) => {
			await trx('acl').where('username', username).del()
			await trx('user').where('username', username).del()
		})
		reply.send()
	})
}
