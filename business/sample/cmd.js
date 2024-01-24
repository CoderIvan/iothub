const { v4: uuidv4 } = require('uuid')

const logger = require('../logger')
const Business = require('../model/business')

async function main() {
	const business = new Business('supertype')

	business.consumeCMDResp(process.env.CMD_RESP_QUEUE, (res) => {
		logger.info(res, 'res')
	})

	const req = {
		product_name: 'supertype',
		device_name: 'ivan01',
		command_name: 'HelthCheck',
		payload: 'cGluZw==',
		request_id: uuidv4().replace(/-/g, ''),
	}
	await business.sendCMD(req)
	logger.info(req, 'req')
}

main()
