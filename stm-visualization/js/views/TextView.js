// View for displaying scatter and text -- inherited from SingleView
var TextView = function(sets) {
	var self = this 
	defaults = {
		xVar:'Topic 1', 
		yVar:'Topic 2',
		radiusVar:'Topic 3', 
		colorVar:'Topic 4',
		minRadius:5, 
		colorRange:colorbrewer['RdYlBu'][11],
		maxRadius:20,
		defaultColor:'rgb(139, 139, 139)',
		idVariable:'id',
		hasControls:true,  
	}
	topicsObj = {}
	topics.map(function(d){
		topicsObj[d.name] = d.name + ' (' + d.list + ')'
	})
	var initSettings = $.extend(false, defaults, sets)
	self.init(initSettings)
}


TextView.prototype = Object.create(SingleView.prototype)


TextView.prototype.getVariableLabels = function(varName, labelVar) {
	var self = this
	if(Number(self.settings.data[0][self.settings[varName]]) != self.settings.data[0][self.settings[varName]]) {
		var names = []
		self.settings.data.map(function(d){
			if(names.indexOf(d[self.settings[varName]]) == -1) names.push(d[self.settings[varName]])
		})
		names.sort(function(a,b) {
			if(a < b) return -1;
		    if(a > b) return 1;
		    return 0;
		}).filter(function(d) {return typeof(d) != 'undefined'})
		.map(function(d,i){
			self.settings[labelVar][d] = labelVar == 'colorVar' ? d : i
		})
	}
}

TextView.prototype.getLabels = function() {
	var self = this
	self.settings.changedColorType = false
	var oldColorLabels = $.extend(false, {},self.settings.colorLabels)
	var oldColorLength = d3.keys(self.settings.colorLabels).length
	self.settings.xAxisLabels = {}
	self.settings.yAxisLabels = {}
	self.settings.colorLabels = {}
	self.getVariableLabels('xVar', 'xAxisLabels')
	self.getVariableLabels('yVar', 'yAxisLabels')
	self.getVariableLabels('colorVar', 'colorLabels')
	if(self.settings.colorVar == 'none' | (oldColorLength == 0 && d3.keys(self.settings.colorLabels).length > 0) | (d3.keys(oldColorLabels).length > 0 && d3.keys(self.settings.colorLabels).length == 0)) {
		self.settings.changedColorType = true
	}
}

TextView.prototype.isDate = function(varName) {
	var self = this
	var val = self.settings.data[0][varName]
	if(typeof val != "string") return false
	var re = /^\d{4}-\d{2}-\d{2}/
	return val.match(re) == null ? false : true
}

TextView.prototype.prepData = function(chart) {
	var self = this
	if(typeof self.settings.selected == 'undefined') self.settings.selected = self.settings.data[0].id
	switch(chart) {
		case 'scatterChart':
			self.update = function(control) {
				self.getLabels()
				var resetScale = ((self.settings.changedColorType == false && (control[0] == 'radiusVar' | control[0] == 'colorVar' |  control == 'click') | control == 'zoom')) ? false : true
				if(self.settings.colorVar == 'none' && control[0] == 'radiusVar' | control == 'click') resetScale = false
				self.charts.map(function(chart,i) {
					self.prepData(chart.settings.id)
					self.changeTitle()
					chart.update(settings[chart.settings.id], resetScale)
				})
			}
			settings[chart].data = self.settings.data.map(function(d, i) {
				var id = self.settings.idVariable == undefined ? i : d[self.settings.idVariable]
				if(self.isDate(self.settings.xVar)) var xVal = new Date(d[self.settings.xVar])
				else var xVal = Number(d[self.settings.xVar]) != d[self.settings.xVar] ? self.settings.xAxisLabels[d[self.settings.xVar]] : d[self.settings.xVar]
				
				if(self.isDate(self.settings.yVar)) var yVal = new Date(d[self.settings.yVar])
				else var yVal = Number(d[self.settings.yVar]) != d[self.settings.yVar]  ? self.settings.yAxisLabels[d[self.settings.yVar]] : d[self.settings.yVar]
				return {x:xVal, y:yVal, id:id, text:d.body, radiusValue:d[self.settings.radiusVar], colorValue:d[self.settings.colorVar]}
			})
			settings[chart].xLabel = self.settings.xVar
			settings[chart].xScaleType = self.isDate(self.settings.xVar) ? 'date' : 'linear'
			settings[chart].yScaleType = self.isDate(self.settings.yVar) ? 'date' : 'linear'
			settings[chart].xAxisLabels = self.settings.xAxisLabels
			settings[chart].yAxisLabels = self.settings.yAxisLabels
			settings[chart].colorLabels = self.settings.colorLabels
			settings[chart].colorVar = self.settings.colorVar
			settings[chart].yLabel = self.settings.yVar
			settings[chart].selected = self.settings.selected
			settings[chart].legendLabel = self.settings.colorVar
			self.setRadius()
			self.setColor()
			break
		case 'textChart':
			var tmp = 
			settings[chart].text = 'hello'
			settings[chart].text = self.settings.data.filter(function(d){
				return String(d.id) == String(self.settings.selected)})[0].body
			break

	}
	
}

TextView.prototype.setRadius = function() {
	var self = this
	if(self.settings.radiusVar == 'none') {
		settings['scatterChart'].getRadius = function(d) {return 10}
	}
	else {
		var min = d3.min(self.settings.data, function(d){return Number(d[self.settings.radiusVar])})
		var max = d3.max(self.settings.data, function(d){return Number(d[self.settings.radiusVar])})
		var radScale = d3.scale.linear().range([self.settings.minRadius, self.settings.maxRadius]).domain([min,max])
		settings['scatterChart'].getRadius = function(d) {return radScale(d.radiusValue)}	
	}
	settings['scatterChart'].getElementSize = function() {
		var size = self.settings.radiusVar == 'none' ? 10 : self.settings.maxRadius
		return {width:size, height:size}
	}
}

TextView.prototype.setColor = function() {
	var self = this
	settings['scatterChart'].colorRange = self.settings.colorRange
	if(self.settings.colorVar == 'none') {
		settings['scatterChart'].getColor = function(d) {
			return self.settings.defaultColor}
	}
	else {
		var min = d3.min(self.settings.data, function(d){return Number(d[self.settings.colorVar])})
		var max = d3.max(self.settings.data, function(d){return Number(d[self.settings.colorVar])})
		var colorDomain = d3.range(max,min, -(max - min)/11)
		var colorScale = Number(self.settings.data[0][self.settings.colorVar]) != self.settings.data[0][self.settings.colorVar] ? d3.scale.category10(): d3.scale.linear().range(self.settings.colorRange).domain(colorDomain)
		settings['scatterChart'].getColor = function(d) {return colorScale(d)}	
		settings['scatterChart'].legendScale = d3.scale.linear().domain([min,max])
	}
}

TextView.prototype.loadData = function(callback) {
	var self = this
	var args = []
	for(var i=1; i<arguments.length; i++) {
		if(arguments[i] == undefined) return
    	if(arguments[i].id != undefined) args.push(arguments[i].id)
    }
	if(self.charts == undefined) self.charts = []
	self.settings.data = data
	if(self.settings.loadedData != true) self.getLabels()
	self.settings.loadedData = true
	if(typeof callback == 'function') {
		callback(args)
	}
	
}

TextView.prototype.getControlValues = function() {
	var self = this
	self.yVarValues = self.xVarValues = d3.keys(self.settings.data[0]).filter(function(d) {
		return d!= 'body'
	})

	self.colorValues = d3.keys(self.settings.data[0]).filter(function(d) {
		return d!= 'body' && !self.isDate(d)
	})

	self.colorValues.unshift('none')
	self.radiusValues =  d3.keys(self.settings.data[0])
		.filter(function(d) {return isNaN(Number(self.settings.data[0][d])) == false})
	self.radiusValues.unshift('none')
}

TextView.prototype.buildControls = function() {
	var self = this
	self.getControlValues()
	self.controlSettings = {}
	
	self.filterControlSettings = {}
	self.rightControlSettings = {}
	
	// X variable
	self.controlSettings['xVar'] = {
		id: 'xVar', 
		text: 'X Axis:', 
		type: 'select',
		options:function() {
			return self.xVarValues.map(function(d){
				var text = topicsObj[d] == undefined ? d : topicsObj[d]
				return {id:d, text:text}
			})
		},
		default:self.settings.xVar
	}

	// Y variable
	self.controlSettings['yVar'] = {
		id: 'yVar', 
		text: 'Y Axis:', 
		type: 'select',
		options:function() {
			return self.yVarValues.map(function(d){
				var text = topicsObj[d] == undefined ? d : topicsObj[d]
				return {id:d, text:text}
			})
		},
		default:self.settings.yVar
	}
	

	// Radius
	self.controlSettings['radiusVar'] = {
		id: 'radiusVar', 
		text: 'Radius:', 
		type: 'select',
		options:function() {
			return self.radiusValues.map(function(d){
				var text = topicsObj[d] == undefined ? d : topicsObj[d]
				return {id:d, text:text}
			})
		},
		default:self.settings.radiusVar
	}

	// Color
	self.controlSettings['colorVar'] = {
		id: 'colorVar', 
		text: 'Color:', 
		type: 'select',
		options:function() {
			return self.colorValues.map(function(d){
				var text = topicsObj[d] == undefined ? d : topicsObj[d]
				return {id:d, text:text}
			})
		},
		default:self.settings.colorVar
	}

	// Bottom controls
	self.bottomControls = new Controls({
		controller:self, 
		container:'#bottom', 
		controls:self.controlSettings
	})

	// Zoom controls
	self.zoomControls = new Controls({
		controller:self, 
		container:'#container', 
		controls: {
			zoom:{
				id:'zoom', 
				type:'buttons', 
				options:[
					{id:'in', text:'+', change:function(d){view.charts[0].zoomIn();$('#control-button-in').blur()}},
					{id:'reset', text:'•',  change:function(d){self.update('reset');$('#control-button-reset').blur()}},
					{id:'out', text:'-',  change:function(d){view.charts[0].zoomOut();$('#control-button-out').blur()}}],
			}
		}
	})
}