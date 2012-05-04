var Guide = function(){
	this.channels = ko.observableArray();
	this.chosenChannel = ko.observable();
	this.chosenChannel.subscribe(function(newChannel){
		if(newChannel != null){
			newChannel.loadPrograms();
		}
	});
}

Guide.prototype = {
	addChannel: function(){
		var newChannel = new GuideChannel;
		this.channels.push(newChannel);
		return newChannel;
	},
	loadChannels: function(){
		var self = this;
		GuideHelper.getChannelList(function(data){
			$(data.channels).each(function(){
				self.addChannel().loadFromDataSource(this);
			});
		});
	}
}