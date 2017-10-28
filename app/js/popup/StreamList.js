import List from "./List.js"

const CONTAINER_ID = 'streams_pane'
const NO_USERNAME_MESSAGE = '<div class="notice">Enter your username to see when your followed channels are live</div>'
const NO_FOLLOWS_MESSAGE = '<div class="notice">You are not following any channels</div>'
const NO_STREAMS_MESSAGE = '<div class="notice">None of your followed channels are live</div>'

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
					<div class="game">
						<span class="game_icon icon"></span>
						<span class="game_name" title="${stream.game}">${stream.game}</span>
					</div>
					`
				}

				html += `
					<div class="audience">
						<span class="audience_icon icon"></span>
						<span class="audience_count">
							${stream.formattedViewers} viewer${stream.viewers === 1 ? '' : 's'}
						</span>
					</div>
				</div>
				<div class="description">${stream.description}</div>
			</li>
		`

		return acc + html
	}

	click(event) {
		if (! this.isValidClick(event)) {
			return
		}

		event.preventDefault()

		let active = this.isLeftClick(event)
		let element = event.target
		let channel = this.getChannelName(element)

		while (! element.classList.contains('stream')) {
			if (element.classList.contains('game_name')) {
				this.openGame(element.title, active)

				return
			}

			if (element.classList.contains('favorite')) {
				this.toggleFavorite(element, channel)

				return
			}

			if (element.classList.contains('preview')) {
				this.resizePreview(element)

				return
			}

			element = element.parentElement
		}

		this.openStream(channel, active)
	}

	resizePreview(element) {
		element.classList.toggle('enlarged')
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
