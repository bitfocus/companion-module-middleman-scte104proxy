const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		let self = this

		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: `This module controls Middleman Software's SCTE 104 Proxy. For more information, visit <a href="https://middleman.tv" target="_new">Middleman.tv</a>.`,
			},
			{
				type: 'static-text',
				id: 'hr',
				width: 12,
				label: '',
				value: '<hr />',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'IP Address',
				width: 4,
				regex: Regex.IP,
				default: '127.0.0.1',
			},
			{
				type: 'textinput',
				id: 'port',
				label: 'Port',
				width: 2,
				regex: Regex.Port,
				default: '5168',
			},
			{
				type: 'static-text',
				id: 'hr',
				width: 12,
				label: '',
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'enablePolling',
				label: 'Enable Polling',
				width: 3,
				default: true,
			},
			{
				type: 'static-text',
				id: 'info-polling',
				width: 9,
				label: 'Enable polling to automatically update system data.',
			},
			{
				type: 'number',
				id: 'pollingInterval',
				label: 'Polling Interval (ms)',
				width: 3,
				default: 1000,
				min: 100,
				max: 10000,
				required: true,
				isVisible: (config) => config.enablePolling,
			},
			{
				type: 'static-text',
				id: 'hr2',
				width: 12,
				label: '',
				value: '<hr />',
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Verbose Logging',
				width: 3,
				default: false,
			},
			{
				type: 'static-text',
				id: 'info-verbose',
				width: 9,
				label: 'Enable verbose logging for debugging purposes.',
			},
			{
				type: 'checkbox',
				id: 'verboseWebsocket',
				label: 'Verbose Logging - Show Websocket Data',
				width: 3,
				default: false,
			},
			{
				type: 'static-text',
				id: 'info-verbose',
				width: 9,
				label: 'Enable verbose logging of all Websocket Data for debugging purposes. It is sent every second, which can fill up the log rather quickly. It is recommended to only enable this when troubleshooting.',
			},
		]
	},
}
