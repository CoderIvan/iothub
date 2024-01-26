const mqtt = require('mqtt')
const EventEmitter = require('events')

function isNil(value) {
	return value === null || value === undefined
}

class IotDevice extends EventEmitter {
	constructor({
		productName,
		deviceName,
		password,
		clientId,
		clean,
	}, {
		address = '127.0.0.1',
		port = 8883,
	}) {
		super()
		this.serverAddress = `mqtts://${address}:${port}`
		this.productName = productName
		this.deviceName = deviceName
		this.username = `${productName}/${deviceName}`
		if (clientId && clientId.length > 0) {
			this.clientId = `${this.username}/${this.clientId}`
		} else {
			this.clientId = this.username
		}
		this.password = password
		this.clean = isNil(clean)

		this.requestIDCacheMap = {}
	}

	async isDup(requestID) {
		const value = this.requestIDCacheMap[requestID]
		if (isNil(value)) {
			this.requestIDCacheMap[requestID] = true
			return Promise.resolve(false)
		}
		return Promise.resolve(true)
	}

	async connect() {
		this.client = await mqtt.connectAsync(this.serverAddress, {
			username: this.username,
			password: this.password,
			clientId: this.clientId,

			clean: this.clean,
			rejectUnauthorized: false,
		})

		this.client.on(
			'message',
			/**
			 *
			 * @param {*} topic
			 * @param {Buffer} reqBuffer
			 * @returns
			 */
			async (topic, reqBuffer) => {
				const [type, productName, deviceName, commandName, requestID, expiresAt] = topic.split('/')
				if (!(type === 'cmd' || type === 'rpc')) {
					return
				}
				if (!(productName === this.productName && deviceName === this.deviceName)) {
					return
				}
				if (await this.isDup(requestID)) {
					return
				}
				if (!isNil(expiresAt) && expiresAt <= Math.floor(Date.now() / 1000)) {
					return
				}
				if (commandName === '$set_ntp') {
					const { device_send, iothub_recv, iothub_send } = JSON.parse(reqBuffer.toString('utf8'))
					const time = ((iothub_recv - device_send) - (Date.now() - iothub_send)) / 2
					this.emit('ntp_set', time)
					return
				}
				/**
				 *
				 * @param {Buffer} respData
				 * @returns
				 */
				const respondFunc = async (resBuffer) => {
					if (!(resBuffer && resBuffer.length > 0)) {
						return
					}
					// cmd/resp/:ProductName/:DeviceName/:CommandName/:RequestID/:ExpiresAt
					// rpc/resp/:ProductName/:DeviceName/:CommandName/:RequestID/:ExpiresAt
					await this.client.publishAsync(
						`${type}/resp/${this.productName}/${this.deviceName}/${commandName}/${requestID}`,
						resBuffer,
						{ qos: 1 },
					)
				}
				this.emit(type, commandName, reqBuffer, respondFunc)
			},
		)

		if (!this.client.connackPacket.sessionPresent) {
			// cmd/:ProductName/:DeviceName/:CommandName/:RequestID/:ExpiresAt
			// rpc/:ProductName/:DeviceName/:CommandName/:RequestID/:ExpiresAt
			await this.client.subscribeAsync([
				`cmd/${this.productName}/${this.deviceName}/+/+/#`,
				`rpc/${this.productName}/${this.deviceName}/+/+/#`,
			])
		}
	}

	async disconnect() {
		if (isNil(this.client)) {
			return
		}
		await this.client.endAsync()
		delete this.client
	}

	async publish(data, version = 0, type = 'default') {
		if (isNil(this.client)) {
			return
		}

		const topic = ['upload', 'data', this.productName, this.deviceName, version, type].join('/')

		await this.client.publishAsync(topic, data, { qos: 1 })
	}

	async ntpRequest() {
		if (isNil(this.client)) {
			return
		}

		const topic = ['get', this.productName, this.deviceName, '$ntp'].join('/')

		await this.client.publishAsync(topic, Buffer.from(JSON.stringify({ device_send: Date.now() })), { qos: 1 })
	}
}

module.exports = IotDevice
