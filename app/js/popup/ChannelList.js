import List from "./List.js"

const NO_USERNAME_MESSAGE = '<p class="notice">Enter your username to see your followed channels</p>'
const NO_FOLLOWS_MESSAGE = '<p class="notice">You are not following any channels</p>'
const CONTAINER_ID = 'channels_pane'

export default class ChannelList extends List {
	constructor(channels, app, getData) {
		super(channels, app, getData, CONTAINER_ID)
	}

	display(content) {
		this.container.innerHTML = content
	}

	getList() {
		return this.channels.reduceChannels(this.createListItem, '')
	}

	createListItem(channel, acc) {
		let html = `
			<li class="item channel" data-channel="${channel.name}">
				<h2 class="lead">
					<span class="displayName">${channel.displayName}</span>
					<span class="favorite" data-favorite="${channel.favorite}">
						<span class="favorite_icon"></span>
					</span>
				</h2>
				<div class="metadata">
					<p class="audience">
						<span class="audience_icon icon"></span>
						<span class="audience_count">
							${channel.formattedFollowers} follower${channel.followers === 1 ? '' : 's'}
						</span>
					</p>
				</div>
			</li>
		`

		return acc + html
	}

	click(event) {
		let element = event.target
		let channel = this.getChannelName(element)
		let button = event.button

		if (button !== 0 && button !== 1) {
			return
		}

		event.preventDefault()

		let active = button === 0

		while (! element.classList.contains('channel')) {
			if (element.classList.contains('favorite')) {
				this.toggleFavorite(element, channel)

				return
			}

			element = element.parentElement
		}

		this.openChannel(channel, active)
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
		else {
			content = this.getList()
		}

		this.display(content)
	}
}
