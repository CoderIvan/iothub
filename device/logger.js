module.exports = require('pino')({
	transport: {
		target: 'pino-pretty',
		options: {
			translateTime: 'SYS:standard',
			ignore: 'pid,hostname',
			singleLine: true,
		},
	},
})
