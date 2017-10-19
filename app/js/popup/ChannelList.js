import List from "./List.js"

const NO_USERNAME_MESSAGE = '<p class="notice">Enter you Twitch.tv username to see your followed channels</p>'
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
				<h2>
					${channel.displayName}
					<span class="favorite" data-favorite="${channel.favorite}"></span>
				</h2>
				<p class="audience">
					<img class="icon" src="/img/audience.png">
					<span class="followers">
						${channel.formattedFollowers} follower${channel.followers === 1 ? '' : 's'}
					</span>
				</p>
			</li>
		`

		return acc + html
	}

	click(event) {
		let element = event.target
		let channel = this.getChannelName(element)

		if (element.classList.contains('favorite')) {
			this.toggleFavorite(element, channel)
		}
		else {
			this.openChannel(channel)
		}
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
