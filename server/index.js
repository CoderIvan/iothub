require('dotenv').config()

const Fastify = require('fastify')

const logger = require('./services/logger')
const apiRouter = require('./routes/api')
const swaggerRouter = require('./routes/swagger')

async function main() {
	const fastify = Fastify({ logger })
	let routePrefix

	if (process.env.SWAGGER_UI === 'true') {
		routePrefix = '/swagger'
		await fastify.register(swaggerRouter, { prefix: '/swagger' })
	}
	await fastify.register(apiRouter, { prefix: '/api' })

	// Run the server!
	const address = await fastify.listen({ port: Number(process.env.PORT), host: process.env.HOST })
	if (routePrefix && routePrefix.length > 0) {
		fastify.log.info(`Server listening at ${address}${routePrefix}`)
	}
}

main()
