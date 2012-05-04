var GuideChannelProgram 	= function(){
	var self = this;
	this.programTitle		= ko.observable();
	this.episodeTitle		= ko.observable();
	this.episodeNumber		= ko.observable();
	this.episodeSeason		= ko.observable();
	this.airDate			= ko.observable();
	this.airDateComputed	= ko.computed(
		function(){
			var date = self.airDate();
			if(date){
				return (date.getHours() % 12) + ':' + ('0' + date.getMinutes()).slice(-2) + (date.getHours() > 12 ? 'pm' : 'am');
			}
			else return '';
		}
	);
	this.programLength		= ko.observable();
	this.isRepeat			= ko.observable();
	this.subcategoryList	= ko.observableArray();
	this.videoFormat		= ko.observable();
	this.tinyUrl			= ko.observable();
	this.poster				= ko.observable();
}

GuideChannelProgram.prototype = {
	loadFromDataSource: function(dataSource){
		this.programTitle(dataSource.prTitle);
		this.episodeTitle(dataSource.episodeTitle);
		this.episodeNumber(dataSource.episodeNumber);
		this.episodeSeason(dataSource.episodeSeason);
		this.airDate(GuideHelper.convertStringToDate(dataSource.prAir));
		this.programLength(dataSource.prLen);
		this.isRepeat(dataSource.repeat);
		for(var index in dataSource.subcategoryList){
			this.subcategoryList.push(dataSource.subcategoryList[index]);
		}
		this.videoFormat(dataSource.videoFormat);
		this.tinyUrl(dataSource.tinyUrl);
		this.poster(dataSource.poster || 'http://directv.images.cust.footprint.net//db_photos/default/TV/tv_s.jpg');
	},
	openTinyUrl: function(){
		if(typeof widget !== 'undefined'){
			widget.openURL(this.tinyUrl());
		}
		else {
			window.open(this.tinyUrl());
		}
	}
}
