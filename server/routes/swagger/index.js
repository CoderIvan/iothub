const fs = require('fs/promises')
const path = require('path')

const [htmlPromise, yamlPromise] = ['swagger.html', 'swagger.yaml']
	.map((file) => fs.readFile(path.join(__dirname, `./${file}`)))

module.exports = async (fastify) => {
	fastify.get('/', async (request, reply) => {
		htmlPromise.then((html) => {
			reply.header('Content-Type', 'text/html;charset=UTF-8')
				.send(html)
		})
	})
	fastify.get('/swagger.yaml', async (request, reply) => {
		yamlPromise.then((yaml) => {
			reply.header('Content-Type', 'text/yaml;charset=UTF-8')
				.send(yaml)
		})
	})
}
