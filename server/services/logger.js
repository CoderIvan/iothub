const pino = require('pino')

const envToLogger = {
	development: {
		level: 'info',
		transport: {
			target: 'pino-pretty',
			options: {
				translateTime: 'SYS:standard',
				ignore: 'pid,hostname',
				singleLine: true,
			},
		},
	},
	production: true,
}

module.exports = pino(envToLogger[process.env.LOGGER] || true)
