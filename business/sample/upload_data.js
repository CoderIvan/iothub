const logger = require('../logger')
const Business = require('../model/business')

async function main() {
	const business = new Business('supertype')
	business.consumeUploadData(process.env.UPLOAD_DATA_QUEUE, (msg) => {
		logger.info(msg, 'msg')
	})
}

main()
