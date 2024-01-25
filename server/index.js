const Fastify = require('fastify')
const config = require('./config')

const logger = require('./services/logger')
const apiRouter = require('./routes/api')
const swaggerRouter = require('./routes/swagger')

async function main() {
	const fastify = Fastify({ logger })
	let routePrefix

	if (config.SWAGGER_UI) {
		routePrefix = '/swagger'
		await fastify.register(swaggerRouter, { prefix: '/swagger' })
	}
	await fastify.register(apiRouter, { prefix: '/api' })

	// Run the server!
	const address = await fastify.listen({ port: config.PORT, host: config.HOST })
	if (routePrefix && routePrefix.length > 0) {
		fastify.log.info(`Server listening at ${address}${routePrefix}`)
	}
}

main()
