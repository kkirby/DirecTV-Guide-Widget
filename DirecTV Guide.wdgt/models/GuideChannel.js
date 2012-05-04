var GuideChannel = function(){
	this.channelNumber	= ko.observable();
	this.channelCall	= ko.observable();
	this.channelName	= ko.observable();
	this.channelLogo	= ko.observable();
	this.programs		= ko.observableArray();
}

GuideChannel.prototype = {
	addProgram: function(){
		var newProgram = new GuideChannelProgram;
		this.programs.push(newProgram);
		return newProgram;
	},
	loadFromDataSource: function(dataSource){
		this.channelNumber(dataSource.chNum);
		this.channelCall(dataSource.chCall);
		this.channelName(dataSource.chName);
		if(dataSource.chLogoUrl){
			this.channelLogo('http://directv.images.cust.footprint.net/' + dataSource.chLogoUrl);
		}
		else {
			this.channelLogo('http://cdn.directv.com/images/channel_call_sign/EP/grid/grid_dark__GENERIC.png');
		}
	},
	loadPrograms: function(){
		var self = this;
        this.programs.removeAll();
		GuideHelper.getProgramList(
			{
				channelnumbers: this.channelNumber(),
				blockduration: 6
			},
			function(data){
				var currentTime = (new Date).getTime();
				var i = 0;
				$(data.channels.shift().schedules).each(function(){
					var endTime = GuideHelper.convertStringToDate(this.prAir).getTime() + this.prLen * 60000;
					if(currentTime >= endTime)return;
					if(i++ >= 3)return false;
					self.addProgram().loadFromDataSource(this);
				});
			}
		);
	}
}