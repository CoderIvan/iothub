const { RABBIT_MQ } = require('../config')
const logger = require('../logger')
const Business = require('../model/business')

async function main() {
	const business = new Business('supertype')
	const product_name = 'supertype'
	const device_name = 'ivan01'
	const cmd = 'HelthCheck'
	const payload = Buffer.from('ping').toString('base64')

	const now = Date.now()

	business.consumeCMDResp(RABBIT_MQ.CMD_RESP_QUEUE, (res) => {
		logger.info({
			...res,
			useTime: `${Date.now() - now}ms`,
		}, 'res')
	})

	await Promise.all([
		business.sendCMD(product_name, device_name, cmd, payload),
		business.sendCMD(product_name, device_name, cmd, payload, Math.floor(Date.now() / 1000) + 10),
	])
}

main()
