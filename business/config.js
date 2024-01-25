module.exports = {
	RABBIT_MQ: {
		ADDRESS: 'amqp://vm01',

		UPLOAD_DATA_EXCHANGE: 'iothub.upload.data',
		UPLOAD_DATA_QUEUE: 'iothub.upload.data.supertype',
		CMD_RESP_EXCHANGE: 'iothub.cmd.resp',
		CMD_RESP_QUEUE: 'iothub.cmd.resp.supertype',
	},

	IOTHUB_API: {
		ADDRESS: 'http://vm00',
	},
}
