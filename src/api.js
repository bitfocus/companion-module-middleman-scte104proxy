const { InstanceStatus } = require('@companion-module/base')
const WebSocket = require('ws')

module.exports = {
	initConnection: async function () {
		//initialize the websocket connection
		let self = this

		if (self.WS) {
			self.closeWSConnection() //close any existing connections
		}

		if (self.config.host && self.config.host !== '' && self.config.port && self.config.port !== '') {
			self.log('info', `Connecting to Websocket at ws://${self.config.host}:${self.config.port}/api/ws`)
			self.WS = new WebSocket(`ws://${self.config.host}:${self.config.port}/api/ws`)

			self.WS.on('error', (error) => {
				self.log('error', `Websocket Error [${error.code}]: ${error.message}`)
				//self.updateStatus(InstanceStatus.ConnectionFailure, `Websocket Error [${error.code}]: ${error.message}`)
				/*self.log('debug', 'Reconnecting in 10 seconds.')

				//clear polling interval if it exists
				if (self.POLLING_INTERVAL) {
					clearInterval(self.POLLING_INTERVAL)
				}
				
				self.RECONNECT_INTERVAL = setTimeout(() => {
					self.initConnection()
				}, 10000)*/
			})

			self.WS.on('open', () => {
				self.log('info', 'Websocket Connected.')
				self.updateStatus(InstanceStatus.Ok)

				clearInterval(self.RECONNECT_INTERVAL) //clear the reconnect interval if it exists

				self.getData() //gets data from REST API

				//clear polling interval if it exists
				if (self.POLLING_INTERVAL) {
					clearInterval(self.POLLING_INTERVAL)
				}

				if (self.config.enablePolling) {
					self.POLLING_INTERVAL = setInterval(() => {
						self.getData()
					}, self.config.pollingInterval)
				}
			})

			self.WS.on('message', (data) => {
				self.processWSData(data)
			})

			self.WS.on('close', (code, reason) => {
				if (code == undefined) {
					code = 'Unknown'
				}
				if (reason == undefined) {
					reason = 'Unknown'
				}

				self.log('info', `Websocket Closed. Code: ${code}, Reason: ${reason || 'No reason provided.'}`)
				self.updateStatus(InstanceStatus.ConnectionFailure, `Websocket Closed. Code: ${code}`)

				self.WS = undefined // Ensure WS is set to null when closed
				delete self.WS

				//clear polling interval if it exists
				if (self.POLLING_INTERVAL) {
					clearInterval(self.POLLING_INTERVAL)
				}

				self.log('debug', 'Reconnecting in 10 seconds.')
				self.RECONNECT_INTERVAL = setTimeout(() => {
					self.initConnection()
				}, 10000)
			})			
		}
	},

	getData: async function () {
		let self = this

		if (self.config.verbose) {
			self.log('debug', 'Requesting List of Inputs from REST API.')
		}
		
		let data = await self.sendREST('/api/inputs', 'GET')
		self.processInputsData(data)
	},

	processWSData: function (msg) {
		//process data from the websocket
		let self = this

		if (self.config.verboseWebsocket) {
			self.log('debug', `Received WS Data: ${msg}`)
		}

		let data = {}

		try {
			data = JSON.parse(msg)
		} catch (error) {
			self.log('error', `Error parsing JSON from Websocket: ${error}`)
			return
		}

		try {
			if (data.AsIndex !== undefined) {
				self.DATA.activeInput = data.AsIndex

				//find the input object in self.DATA.inputs and update its priority
				let inputIndex = self.DATA.inputs.findIndex((input) => input.asIndex === data.AsIndex)
				if (inputIndex !== -1 && data.Priority !== undefined) {
					self.DATA.inputs[inputIndex].priority = data.Priority
				}
			}
		} catch (error) {
			self.log('error', `Error processing WS Data: ${error}`)
		}

		self.checkFeedbacks()
		self.checkVariables()
	},

	closeWSConnection: function () {
		//close the websocket connection
		let self = this

		//close out the websocket
		if (self.WS) {
			self.log('info', 'Closing Websocket Connection.')
			self.WS.close(1000, 'Connection closed by Companion.')
			self.WS = undefined
			delete self.WS
		}
	},

	sendWSCommand: function (command) {
		//send a command to the websocket
		let self = this

		try {
			if (self.WS) {
				if (self.config.verbose) {
					self.log('debug', `Sending Command: ${command}`)
				}
				try {
					self.WS.send(command)
					self.lastCommand = command
				} catch (error) {
					self.log('error', 'Error sending WS command: ' + String(error))
				}
			} else {
				self.log('warn', 'Websocket not connected. Command not sent.')
			}
		} catch (error) {
			self.log('error', `WS Error: ${error}`)
		}
	},

	sendREST: async function (path, method = 'GET', body = undefined) {
		//send a REST command to the server
		let self = this

		try {
			let url = `http://${self.config.host}:${self.config.port}${path}`

			let options = {
				method: method,
				headers: {
					'Content-Type': 'application/json',
				},
			}

			if (body) {
				options.body = new URLSearchParams(Object.entries(body)).toString()
			}

			if (self.config.verbose) {
				self.log('debug', `Sending REST Command: ${method} ${url} ${body ? JSON.stringify(body) : ''}`)
			}

			let response = await fetch(url, options)
			let data = undefined
			if (!response.ok) {
				self.log('error', `HTTP Error: ${response.status} ${response.statusText}`)
				self.updateStatus(
					InstanceStatus.ConnectionFailure,
					`HTTP Error: ${response.status} ${response.statusText}`,
				)
			} else {
				data = await response.json()
				self.updateStatus(InstanceStatus.Ok) //clear any previous connection errors
			}

			return data
		} catch (error) {
			self.log('error', `REST Send Error: ${error}`)
			self.updateStatus(InstanceStatus.ConnectionFailure, `REST Send Error: ${String(error)}`)
		}
	},

	processInputsData: function (data) {
		//process data from the inputs
		let self = this

		if (self.config.verbose) {
			self.log('debug', `Received Inputs Data: ${JSON.stringify(data)}`)
		}

		//if data is not already json object, parse it
		if (typeof data === 'string') {
			try {
				data = JSON.parse(data)
			} catch (error) {
				self.log('error', `Error parsing JSON from Inputs: ${error}`)
				return
			}
		}

		if (data) {
			//store the data
			self.DATA.inputs = data

			//update feedbacks and variables
			self.initFeedbacks()
			self.initVariables()

			self.checkFeedbacks()
			self.checkVariables()
		}
	},
}
