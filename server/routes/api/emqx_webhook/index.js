const rabbitmq = require('../../../services/rabbitmq')
const { getClient } = require('../../../services/redis')

module.exports = async (fastify) => {
	/**
	{
		"reqId":"req-1",
		"username":"ivan01",
		"sockname":"192.168.137.128:8883",
		"receive_maximum":32,
		"proto_ver":4,
		"proto_name":"MQTT",
		"peername":"192.168.137.1:61071",
		"node":"emqx@192.168.137.128",
		"mountpoint":"undefined",
		"metadata":{"rule_id":"connect_WH_D"},
		"keepalive":60,
		"is_bridge":false,
		"expiry_interval":0,
		"event":"client.connected",
		"connected_at":1705549067732,
		"conn_props":{"User-Property":{}},
		"clientid":"mqttjs_2660f4f8",
		"clean_start":true
	}
	*/
	fastify.post('/event/connected', (request, reply) => {
		request.log.info(request.body, 'event connected')
		reply.send()
	})

	/**
	{
		"reqId":"req-2",
		"username":"ivan01",
		"sockname":"192.168.137.128:8883",
		"reason":"ssl_closed",
		"proto_ver":4,
		"proto_name":"MQTT",
		"peername":"192.168.137.1:61071",
		"node":"emqx@192.168.137.128",
		"metadata":{"rule_id":"disconnect_WH_D"},
		"event":"client.disconnected",
		"disconnected_at":1705549077077,
		"disconn_props":{"User-Property":{}},
		"clientid":"mqttjs_2660f4f8"
	}
	*/
	fastify.post('/event/disconnected', (request, reply) => {
		request.log.info(request.body, 'event disconnected')
		reply.send()
	})

	/**
		{
			"reqId":"req-2",
			"username":"supertype/ivan01",
			"topic":"upload/data/supertype/ivan01/default",
			"qos":1,
			"publish_received_at":1705577965756,
			"pub_props":{"User-Property":{}},
			"peerhost":"192.168.137.1",
			"payload":"SGVsbG8gV29ybGQ=",
			"node":"emqx@192.168.137.128",
			"metadata":{"rule_id":"publish_WH_D"},
			"id":"00060F36D0C92162F0990000530D0002",
			"flags":{"retain":false,"dup":false},
			"event":"message.publish",
			"clientid":"supertype/ivan01"
		}
	 */
	fastify.post('/message/publish', async (request, reply) => {
		request.log.info(request.body, 'publish')
		const {
			topic,
			publish_received_at,
			payload,
		} = request.body
		if (topic.startsWith('upload/data/')) {
			// upload/data/:ProductName/:DeviceName/:DataVersion/:DataType/:MessageID
			const [productName, deviceName, dataVersion, dataType] = topic.slice('upload/data/'.length).split('/')

			const routingKey = productName
			const content = {
				deviceName,
				dataVersion,
				dataType,

				payload,

				publish_received_at,
			}

			request.log.info({
				routingKey,
				content,
			}, 'publish')
			await rabbitmq.publishUploadData(routingKey, Buffer.from(JSON.stringify(content)))
		} else if (topic.startsWith('cmd/resp/')) {
			// cmd/resp/:ProductName/:DeviceName/:CommandName/:RequestID
			const [productName, deviceName, commandName, requestID] = topic.slice('cmd/resp/'.length).split('/')

			const routingKey = productName
			const content = {
				deviceName,
				commandName,
				requestID,

				payload,

				publish_received_at,
			}

			request.log.info({
				routingKey,
				content,
			}, 'cmd')
			await rabbitmq.publishCmd(routingKey, Buffer.from(JSON.stringify(content)))
		} else if (topic.startsWith('rpc/resp/')) {
			const redis = await getClient()
			// rpc/resp/:ProductName/:DeviceName/:CommandName/:RequestID
			const [productName, deviceName, commandName, requestID] = topic.slice('rpc/resp/'.length).split('/')
			const key = [productName, deviceName, commandName, requestID].join(':')
			/**
			 * NX -- Only set the key if it does not already exist.
			 * XX -- Only set the key if it already exists.
			 *
			 * EX seconds -- Set the specified expire time, in seconds (a positive integer).
			 * PX milliseconds -- Set the specified expire time, in milliseconds (a positive integer).
			 */
			await redis.set(key, payload, 'NX', 'EX', process.env.RPC_MAX_TIMEOUT)
		}
		reply.send()
	})
}
