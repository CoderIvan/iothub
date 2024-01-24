const logger = require('../logger')
const Business = require('../model/business')

async function main() {
	const business = new Business('supertype')

	const product_name = 'supertype'
	const device_name = 'ivan01'
	const cmd = 'HelthCheck'
	const payload = Buffer.from('ping').toString('base64')
	const res = await business.rpc(product_name, device_name, cmd, payload)
	logger.info(res, 'res')
}

main()
