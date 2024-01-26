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

	device.on('ntp_set', async (serverTime) => {
		logger.info({
			serverTime,
		}, `[${device.username}] ntp_set`)
	})

	await device.connect()
	logger.info(`[${device.username}] device is online`)
	await device.ntpRequest()
	logger.info(`[${device.username}] ntpRequest`)
}

main()
