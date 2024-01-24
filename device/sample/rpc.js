const logger = require('pino')({
	transport: {
		target: 'pino-pretty',
		options: {
			translateTime: 'SYS:standard',
			ignore: 'pid,hostname',
			singleLine: true,
		},
	},
})
const IotDevice = require('../model/device')

async function main() {
	const device = new IotDevice({
		productName: 'supertype',
		deviceName: 'ivan01',
		password: 'ivan01',
	}, {
		address: 'vm01',
	})

	device.on('rpc', async (commandName, reqBuffer, respondFunc) => {
		logger.info({ commandName, reqBuffer }, 'rpc request')
		if (commandName === 'HelthCheck') {
			const parseReqBuffer = reqBuffer.toString('utf8')
			if (parseReqBuffer === 'ping') {
				const parseResBuffer = 'pong'
				const resBuffer = Buffer.from(parseResBuffer, 'utf8')
				await respondFunc(resBuffer)
				logger.info({ resBuffer }, 'rpc response')
			}
		}
	})

	await device.connect()
	logger.info(`[${device.username}] device is online`)
}

main()
