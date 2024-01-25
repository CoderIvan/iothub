const knexFactory = require('knex')

const config = require('../config')

const knex = knexFactory({
	client: 'mysql',
	connection: {
		host: config.MYSQL.HOST,
		port: Number(config.MYSQL.PORT),
		user: config.MYSQL.USER,
		password: config.MYSQL.PASSWORD,
		database: config.MYSQL.DATABASE,
	},
})

module.exports = knex
