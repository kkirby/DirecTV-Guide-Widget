var GuideHelper = {
	constant: {
		channelListUri: 'http://www.directv.com/entertainment/data/guideChannelList.json.jsp',
		//programListUri: 'http://www.directv.com/entertainment/data/guideScheduleSegment.json.jsp'
		programListUri: 'http://optimalconnection.net/direcTvProgramInfo.php'
	},
	generateDate: function(){
		var pad = function(input){
			return ('0' + input).slice(-2);
		}
		
		var date = new Date();
		var dateData = {
			year: date.getFullYear(),
			month: pad(date.getMonth() + 1),
			day: pad(date.getDate()),
			hour: pad(date.getHours()),
			minute: pad(
				Math.floor(
					date.getMinutes() / 30
				) * 30
			)
		}
		
		with(dateData){
			return year + '-' + month + '-' + day + ' ' + hour + ':' + minute;
		}
	},
    convertStringToDate: function(theString){
        var parts = theString.split('T');
        var dayInfo = parts[0].split('-');
        var hourInfo = parts[1].split('.')[0].split(':');
        return new Date(
            dayInfo[0],
            parseInt(dayInfo[1])-1,
            dayInfo[2],
            hourInfo[0] - ((new Date()).getTimezoneOffset() / 60),
            hourInfo[1],
            hourInfo[2],
            0
        );
    },
	getChannelList: function(options,callback){
		if(typeof callback == 'undefined' && typeof options == 'function'){
			callback = options;
			options = {};
		}

		options = options || {};
		callback = callback || jQuery.noop;

		options = $.extend(
			{
				channelnumbers: '',
				hideDupes: true,
				logoTheme: 'dark',
				logoType: 'web_grid_dark',
				view: 'ALL'
			},
			options
		);

		$.ajax({
			url: GuideHelper.constant.channelListUri,
			data: options,
			dataType: 'json',
			success: callback
		});
	},
	getProgramList: function(options,callback){
		if(typeof callback == 'undefined' && typeof options == 'function'){
			callback = options;
			options = {};
		}
		if(options instanceof Array){
			options = {
				channelnumbers: options.join(',')
			};
		}

		options = options || {};
		callback = callback || jQuery.noop;

		options = $.extend(
			{
				blockduration: 3,
				channelnumbers: '',
				scheduleType: 'custom',
				startTime: this.generateDate()
			},
			options
		);
		
		if(options.blockduration % 3 != 0){
			options.blockduration += 3 - options.blockduration % 3;
		}

		$.ajax({
			url: GuideHelper.constant.programListUri,
			data: options,
			dataType: 'json',
			success: callback
		});
	}
}

var WidgetCore = {
	init: {
		init: function(){
			this.initSpinner();
			
			$(document).ajaxStart(function(){
				WidgetCore.spinner.start();
			});
			
			$(document).ajaxStop(function(){
				WidgetCore.spinner.stop();
			});
			
			guideInstance.loadChannels();
			
			this.initUi();
			
			if (window.widget) {
				var timeout = null;
			    widget.onhide = function(){
					timeout = setTimeout(function(){
						$('#search #search_field').val('');
						guideInstance.chosenChannel(null);
					},30000);
				}
				widget.onshow = function(){
					if(timeout){
						clearTimeout(timeout);
					}
				}
			}
		},
		initSpinner: function(){
			var opts = {
			  lines: 12, // The number of lines to draw
			  length: 7, // The length of each line
			  width: 4, // The line thickness
			  radius: 10, // The radius of the inner circle
			  color: '#FFF', // #rgb or #rrggbb
			  speed: 1, // Rounds per second
			  trail: 60, // Afterglow percentage
			  shadow: false, // Whether to render a shadow
			  hwaccel: false, // Whether to use hardware acceleration
			  className: 'spinner', // The CSS class to assign to the spinner
			  zIndex: 2e9, // The z-index (defaults to 2000000000)
			  top: 'auto', // Top position relative to parent in px
			  left: 'auto' // Left position relative to parent in px
			};
			WidgetCore.spinner = {
				instance: new Spinner(opts),
				start: function(){
					this.instance.spin($('#spinner').get(0));
				},
				stop: function(){
					this.instance.stop();
				}
			}
		},
		initUi: function(){
			this.initAutoComplete();
			
			new AppleInfoButton(
				$('#info_button').get(0),
				$('#front').get(0),
				"white",
				"white",
				WidgetCore.flipper.showBack
			);
			
			new AppleGlassButton(
				$('#done_button').get(0),
				'Done',
				WidgetCore.flipper.showFront
			);
			
			new AppleGlassButton(
				$('#back_button').get(0),
				'Back',
				function(){
					guideInstance.chosenChannel(null);
					$('#search #search_field').val('');
					$('#search #search_field').focus();
				}
			);
			
		},
		initAutoComplete: function(){
			$('#search input').autocomplete({
		        source: function(request, response){
		            var matcher = new RegExp(
		                $.ui.autocomplete.escapeRegex(request.term),
		                'i'
		            );

		            var result = [];

		            $($.grep(guideInstance.channels(),
		                function(value){
		                    return matcher.test(value.channelName()) || matcher.test(value.channelCall());
		                }
		            )).each(function(){
		                result.push({
		                    reference: this,
		                    value: this.channelName()
		                });
		            });
		            response(result.slice(0,6));
		        },
		        delay: 0,
		        minLength: 0,
		        position: {
		            my: 'left top',
		            at: 'left bottom',
		            offset: '0 5px'
		        },
		        appendTo: $('#search'),
		        // Events //
		        select: function(event, item){
		            guideInstance.chosenChannel(item.item.reference);
		        }
		    }).focus(function(){
		        $(this).autocomplete("search");
		    });
		}
	},
	flipper: {
		showFront: function(){
			if (window.widget){
		        widget.prepareForTransition("ToFront");
			}
			
			$('#front').show();
			$('#back').hide();

		    if (window.widget){
		        setTimeout('widget.performTransition();', 0);
			}
		},
		showBack: function(){
		    if (window.widget){
		        widget.prepareForTransition("ToBack");
			}
			
			$('#front').hide();
			$('#back').show();

		    if (window.widget){
		        setTimeout('widget.performTransition();', 0);
			}
		}
	}
}

$(function(){
	guideInstance = new Guide;
	ko.applyBindings(guideInstance);
	WidgetCore.init.init();
});
