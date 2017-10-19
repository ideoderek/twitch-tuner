export default class List {
	constructor(channels, app, getData, id) {
		this.channels = channels
		this.app = app
		this.getData = getData

		this.container = document.getElementById(id)
		this.container.addEventListener('click', this.click.bind(this), false)
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

	openChannel(channel) {
		this.app.openChannel(channel)
	}

	openStream(channel) {
		this.app.openStream(channel)
	}

	openGame(game) {
		this.app.openGame(game)
	}
}
