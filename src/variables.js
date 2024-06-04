module.exports = {
	initVariables: function () {
		let self = this

		let variables = []

		variables.push({ variableId: 'active_input', name: 'Current Active Input' })

		for (let i = 0; i < self.DATA.inputs.length; i++) {
			let indexNum = self.DATA.inputs[i].asIndex
			variables.push({ variableId: `input_${indexNum}_active`, name: `Input ${i} Is Active` })
			variables.push({ variableId: `input_${indexNum}_priority`, name: `Input ${i} Priority` })
			variables.push({ variableId: `input_${indexNum}_client_connected`, name: `Input ${i} Client Connected` })
			variables.push({ variableId: `input_${indexNum}_client_ip_port`, name: `Input ${i} Client IP/Port` })
		}

		self.setVariableDefinitions(variables)
	},

	checkVariables: function () {
		let self = this

		try {
			let variableValues = {}

			if (self.DATA.activeInput !== undefined) {
				variableValues['active_input'] = self.DATA.activeInput
			} else {
				variableValues['active_input'] = ''
			}

			for (let i = 0; i < self.DATA.inputs.length; i++) {
				let indexNum = self.DATA.inputs[i].asIndex

				if (self.DATA.activeInput == indexNum) {
					variableValues[`input_${indexNum}_active`] = 'True'
				} else {
					variableValues[`input_${indexNum}_active`] = 'False'
				}

				variableValues[`input_${indexNum}_priority`] = self.DATA.inputs[i].priority

				variableValues[`input_${indexNum}_client_connected`] = self.DATA.inputs[i].clientConnected
					? 'True'
					: 'False'
				if (self.DATA.inputs[i].clientConnected) {
					variableValues[`input_${indexNum}_client_ip_port`] = self.DATA.inputs[i].clientIpPort
				} else {
					variableValues[`input_${indexNum}_client_ip_port`] = 'N/A'
				}

				variableValues[`input_${indexNum}_segmentation_active`] = self.DATA.inputs[i].segmentationActive
					? 'True'
					: 'False'
			}

			self.setVariableValues(variableValues)
		} catch (error) {
			self.log('error', 'Error setting Variables: ' + String(error))
			console.log(error)
		}
	},
}
