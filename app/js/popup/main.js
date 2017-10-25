import ChannelList from "./ChannelList.js"
import StreamList from "./StreamList.js"
import ModeToggle from "./ModeToggle.js"
import UserBar from "./UserBar.js"
import TabBar from "./TabBar.js"
import Timer from "./Timer.js"

const DEFAULT_TAB = 'streams'

let app = chrome.extension.getBackgroundPage().TwitchTuner
let channels = app.getChannelContainer()
let storage = app.getStorage()

let modeToggler = new ModeToggle(storage)
let userBar = new UserBar(setUsername)
let timer = new Timer(reload)
let channelList = new ChannelList(channels, app, getData)
let streamList = new StreamList(channels, app, getData)
let tabBar = new TabBar({
	channels: [channels.countChannels.bind(channels), channelList.update.bind(channelList)],
	streams: [channels.countStreams.bind(channels), streamList.update.bind(streamList)]
})

tabBar.select(DEFAULT_TAB)

function setUsername(username) {
	app.setUsername(username)
}

function reload() {
	app.update()
}

function getData() {
	return app.getData()
}

function processUpdate(data) {
	if ('streams' in data) {
		tabBar.update('streams')
	}
	if ('channels' in data) {
		tabBar.update('channels')
	}
	if ('username' in data || 'validUsername' in data) {
		userBar.update(data)
	}
	if ('updating' in data || 'updatedAt' in data) {
		timer.update(data)
	}
}

processUpdate(getData())

chrome.runtime.onMessage.addListener((message) => {
	processUpdate(message)
})

document.getElementById('options_button').addEventListener('click', function() {
	app.openOptions()
}, false)
