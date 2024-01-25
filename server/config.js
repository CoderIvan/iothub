module.exports = {
	PORT: 80,
	HOST: 'vm00',

	LOGGER: 'development',
	SWAGGER_UI: true,

	MYSQL: {
		HOST: 'vm01',
		PORT: 3306,
		USER: 'root',
		PASSWORD: 'root',
		DATABASE: 'iothub',
	},

	REDIS: {
		HOST: 'vm01',
		PORT: 6379,
	},

	RABBITMQ_URL: 'vm01',

	EMQX_API_ADDRESS: 'vm01:18083',
	EMQX_API_USERNAME: 'ee26b0dd4af7e749',
	EMQX_API_PASSWORD: 'ZGBWzXVemexRiSvCJey49C9Ai0UglQFlOpY0kKGmRF60M',

	RPC: {
		DELAY: 10, // ms
		TIMEOUT: 8, // s
	},
}
