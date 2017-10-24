import List from "./List.js"

const CONTAINER_ID = 'streams_pane'
const NO_USERNAME_MESSAGE = '<p class="notice">Enter your username to see when your followed channels are live</p>'
const NO_FOLLOWS_MESSAGE = '<p class="notice">You are not following any channels</p>'
const NO_STREAMS_MESSAGE = '<p class="notice">None of your followed channels are live</p>'

export default class StreamList extends List {
	constructor(channels, app, getData) {
		super(channels, app, getData, CONTAINER_ID)
	}

	getList() {
		return this.channels.reduceStreams(this.createListItem, '')
	}

	createListItem(stream, acc) {
		let html = `
			<li class="item stream" data-channel="${stream.name}">
				<h2 class="lead">
					<span class="displayName">${stream.displayName}</span>
					<span class="favorite" data-favorite="${stream.favorite}">
						<span class="favorite_icon"></span>
					</span>
				</h2>
				<div class="preview">
					<img src="${stream.preview}">
				</div>
				<div class="metadata">`

				if (stream.game !== null) {
					html += `
					<p class="game">
						<span class="game_icon icon"></span>
						<span class="game_name" title="${stream.game}">${stream.game}</span>
					</p>
					`
				}

				html += `
					<p class="audience">
						<span class="audience_icon icon"></span>
						<span class="audience_count">
							${stream.formattedViewers} viewer${stream.viewers === 1 ? '' : 's'}
						</span>
					</p>
				</div>
				<div class="description">${stream.description}</div>
			</li>
		`

		return acc + html
	}

	click(event) {
		let element = event.target
		let channel = this.getChannelName(element)

		if (element.classList.contains('game')) {
			this.openGame(element.getAttribute('data-game'))
		}
		else if (element.classList.contains('favorite')) {
			this.toggleFavorite(element, channel)
		}
		else if (element.classList.contains('preview-button')) {
			this.togglePreview(element, channel)
		}
		else {
			this.openStream(channel)
		}

		event.stopPropagation()
	}

	generatePreview(channel) {
		let stream = this.channels.get(channel)

		return `
			<div class="preview" data-description="${stream.description}">
				<img src="${stream.preview}">
			</div>
		`
	}

	togglePreview(element, channel) {
		let container = element.parentElement

		if (! container.lastElementChild.classList.contains('preview')) {
			container.innerHTML += this.generatePreview(channel)
		}

		container.classList.toggle('show-preview')
	}

	update() {
		let data = this.getData()
		let content

		if (data.username === null || data.validUsername === false) {
			content = NO_USERNAME_MESSAGE
		}
		else if (this.channels.countChannels() === 0) {
			content = NO_FOLLOWS_MESSAGE
		}
		else if (this.channels.countStreams() === 0) {
			content = NO_STREAMS_MESSAGE
		}
		else {
			content = this.getList()
		}

		this.display(content)
	}
}
