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

	await device.connect()
	logger.info(`[${device.username}] device is online`)

	await device.publish(Buffer.from('Hello World'))
	logger.info(`[${device.username}] publish 'Hello World'`)

	await device.disconnect()
	logger.info(`[${device.username}] device is cmd`)
}

main()
