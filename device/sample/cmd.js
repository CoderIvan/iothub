const logger = require('../logger')
const IotDevice = require('../model/device')

async function main() {
	const device = new IotDevice({
		productName: 'supertype',
		deviceName: 'ivan01',
		password: 'ivan01',

		clean: false,
	}, {
		address: 'vm01',
	})

	device.on('cmd', async (commandName, reqBuffer, respondFunc) => {
		logger.info({ commandName, reqBuffer }, 'cmd request')
		if (commandName === 'HelthCheck') {
			const parseReqBuffer = reqBuffer.toString('utf8')
			if (parseReqBuffer === 'ping') {
				const parseResBuffer = 'pong'
				const resBuffer = Buffer.from(parseResBuffer, 'utf8')
				await respondFunc(resBuffer)
				logger.info({ resBuffer }, 'cmd response')
			}
		}
	})

	await device.connect()
	logger.info(`[${device.username}] device is online`)
}

main()
