const { combineRgb } = require('@companion-module/base')

module.exports = {
	initFeedbacks() {
		let self = this
		const feedbacks = {}

		const foregroundColor = combineRgb(255, 255, 255) // White
		const backgroundColorRed = combineRgb(255, 0, 0) // Red

		feedbacks.inputActive = {
			type: 'boolean',
			name: 'Input is Active',
			description: 'If the Input is Active, change the color of the button.',
			defaultStyle: {
				color: foregroundColor,
				bgcolor: backgroundColorRed,
			},
			options: [
				{
					type: 'dropdown',
					label: 'Input',
					id: 'asIndex',
					default: self.DATA.inputs[0].asIndex,
					choices: self.DATA.inputs.map((input, index) => {
						return { id: input.asIndex, label: `Input ${index}` }
					}),
				},
			],
			callback: async function (feedback) {
				let asIndex = feedback.options.asIndex
				let activeInput = self.DATA.activeInput

				if (asIndex == activeInput) {
					return true
				}

				return false
			},
		}

		self.setFeedbackDefinitions(feedbacks)
	},
}
