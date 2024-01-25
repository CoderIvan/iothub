const { RABBIT_MQ } = require('../config')
const logger = require('../logger')
const Business = require('../model/business')

async function main() {
	const business = new Business('supertype')
	business.consumeUploadData(RABBIT_MQ.UPLOAD_DATA_QUEUE, (msg) => {
		logger.info(msg, 'msg')
	})
}

main()
