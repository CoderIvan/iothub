const logger = require('../logger')
const Business = require('../model/business')

async function main() {
	const business = new Business('supertype')

	const product_name = 'supertype'
	const device_name = 'ivan01'
	const cmd = 'HelthCheck'
	const payload = Buffer.from('ping').toString('base64')
	const now = Date.now()
	try {
		const res = await business.sendRPC(product_name, device_name, cmd, payload)
		logger.info({
			...res,
			useTime: `${Date.now() - now}ms`,
		}, 'res')
	} catch (err) {
		logger.error(err)
	}
}

main()
