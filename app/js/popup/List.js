export default class List {
	constructor(channels, app, getData, id) {
		this.channels = channels
		this.app = app
		this.getData = getData

		this.container = document.getElementById(id)
		this.container.addEventListener('mousedown', this.click.bind(this))
	}

	display(content) {
		this.container.innerHTML = content
	}

	toggleFavorite(element, channel) {
		var favorited = element.getAttribute('data-favorite') === 'true' ? true : false

		this.channels.favorite(channel, ! favorited)

		element.setAttribute('data-favorite', ! favorited)
	}

	getChannelName(element) {
		while (! element.classList.contains('item')) {
			element = element.parentNode
		}

		return element.getAttribute('data-channel')
	}

	openChannel(channel, active) {
		this.app.openChannel(channel, active)
	}

	openStream(channel, active) {
		this.app.openStream(channel, active)
	}

	openGame(game, active) {
		this.app.openGame(game, active)
	}

	isLeftClick(event) {
		return event.button === 0
	}

	isValidClick(event) {
		let button = event.button

		if (button !== 0 && button !== 1) {
			return false
		}

		return ! event.target.classList.contains('pane')
	}
}
