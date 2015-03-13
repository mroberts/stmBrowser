// Parent view with single state
var SingleView = function() {

}

// Initialize view
SingleView.prototype.init = function(sets) {
	var self = this
	defaults = {
		charts:[],
		hasControls:false,
		hasTitle:false,
		fontFamily:'georgia', 
		fontSize:'20px',
		chartContainer:'container',
		keyEvents:function(self) {},
		resizeEvents:function() {
			var TO = false;
			$(window).resize(function() { 
				if(TO !== false) clearTimeout(TO);
				TO = setTimeout(function() {self.update('none')}, 200);
			})
		}
	}
	
	self.update = function(control) {
		self.charts.map(function(chart,i) {
			self.prepData(chart.settings.id)
			self.changeTitle()
			chart.update(settings[chart.settings.id], control)
		})
	}

	self.build = function(init) {
		var build = function() {
			self.addTitle()		
			if(self.settings.hasControls == true) self.buildControls()
			self.settings.charts.map(function(chart,i) {
				settings[chart].container = settings[chart].container == undefined ? self.settings.chartContainer  : settings[chart].container
				self.prepData(chart)
				self.settings.buildChart(self, chart, i)
			})		

		}
		if(typeof self.settings.preLoad == 'function') {
			self.settings.preLoad(self, self.settings.dataFile, build)
		}
		else {
			 build()
		}
		self.addClickEvents()
		self.addHoverEvents()
		self.addPoshyEvents()
		if(typeof self.settings.customBuild == 'function') self.settings.customBuild()

	}
	self.charts = []
	self.settings = $.extend(false, defaults, sets)
	if(typeof self.settings.keyEvents == 'function') self.settings.keyEvents(self)
	if(typeof self.settings.resizeEvents == 'function') self.settings.resizeEvents(self)	
	self.chartDiv = d3.select('#' + self.settings.container).append('div').attr('id', self.settings.chartContainer)
	self.loadData(self.build)
}

// Load Data
SingleView.prototype.loadData = function(callback) {
	var self = this
	var args = []
	for(var i=0; i<arguments.length; i++) {
    	args.push(arguments[i])
    }
	if(typeof callback == 'function') callback(args)
}

// Update Charts
SingleView.prototype.updateCharts = function(control,value) {
	var self = this
	self.loadData(self.update, control, value)
}

// Prep view data
SingleView.prototype.prepData = function(chart) {
	var self = this
	settings[chart].data = self.data
}

// Add title
SingleView.prototype.addTitle = function() {
	var self = this
	
	if(self.settings.hasTitle == true) {
		self.title = d3.select('#' + self.settings.chartContainer).append('div').attr('class', 'view-title').style('text-align', 'center')
		self.titleText = self.title.append('text').text('').style('font-family', self.settings.fontFamily)
		self.changeTitle()
	}
}

// Change title 
SingleView.prototype.changeTitle = function() {
	var self = this
	if(self.settings.hasTitle == true) self.titleText.text(self.settings.getTitleText(self))
}


// Add click events to view
SingleView.prototype.addClickEvents = function() {
	var self = this
	if(self.settings.clickEvents == undefined) return
	self.settings.clickEvents.map(function(click) {
		var listener = function(event) {
			var value = click.attribute == 'none' ? 'switch' : $(this).attr(click.attribute)
			if(self.settings[click.setting] == value) {
				self.settings[click.setting] = click.default == undefined ? value : click.default(self)
				self.update('click')
				return
			}
			event.stopPropagation()
			if(value == 'switch') {
				self.settings[click.setting] = self.settings[click.setting] == true ? false : true				
			}
			else {
				 self.settings[click.setting] = value
			}
			self.update('click')
		}
		$(document).off('click', '#' + click.wrapper + ' [class~=' + click.klass + ']')
		$(document).on('click', '#' + click.wrapper + ' [class~=' + click.klass + ']', listener)
	})	
}

// Add hover events to view
SingleView.prototype.addHoverEvents = function() {
	var self = this
	if(self.settings.hoverEvents == undefined) return
	self.settings.hoverEvents.map(function(hover) {
		var listener = function(event) {
			var type = $(event).attr('originalEvent').type
			var value 
			switch(true) {
				case (hover.attribute == 'none'):
					value = 'switch'
					break;
				case (type == 'mouseout'):
					value = 'none'
					break;
				default:
					value = $(this).attr(hover.attribute);
					break;
			}
			if(self.settings[hover.setting] == value) return
			event.stopPropagation()
			if(value == 'switch') {
				self.settings[hover.setting] = self.settings[hover.setting] == true ? false : true				
			}
			else {
				 self.settings[hover.setting] = value
			}
			self.update()
		}
		$(document).off('mouseover', '#' + hover.wrapper + ' [class~=' + hover.klass + ']')
		$(document).off('mouseout', '#' + hover.wrapper + ' [class~=' + hover.klass + ']')		
		$(document).on('mouseover touchstart', '#' + hover.wrapper + ' [class~=' + hover.klass + ']', listener)
		$(document).on('mouseout touchend', '#' + hover.wrapper + ' [class~=' + hover.klass + ']', listener)		
	})
}


// Add poshy events to view
SingleView.prototype.addPoshyEvents = function() {
	var self = this
	if(self.settings.poshyEvents == undefined) return
	self.settings.poshyEvents.map(function(poshy) {
		var args = {
			slide: false, 
			followCursor: true, 
			alignTo: 'cursor', 
			showTimeout: 0, 
			liveEvents:true,
			hideTimeout: 0, 
			alignX: 'center', 
			alignY: 'inner-bottom', 
			className: 'tip',
			offsetY: 10,
			content: poshy.content
		}
		
		if(poshy.customSelect != undefined) {
			$(poshy.customSelect).poshytip(args)
		}
		else $('#' + poshy.wrapper + ' [class~=' + poshy.klass + ']').poshytip(args)
	})
}

