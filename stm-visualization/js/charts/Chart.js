// Parent chart function to draw any chart type
var Chart = function() {}

// Initialize -- passes defaults to chart
Chart.prototype.init = function(settings) {
	var self = this
	var defaults = {
		getHeight:function() {
			return $('#' + self.settings.container).innerHeight() - 40 - $('#bottom').height()
		},
		getWidth:function() {return $(window).width() - 20}, 
		hasXAxis:true,
		hasYAxis:true,
		hasSvg:true,
		hasLegend:false,
		hasXLabel:true,
		getXrangeBand:function() {return 1},
		xAxisPosition:'bottom',
		hasYLabel:true,
		bottomPadding:0, 
		opacity:function(d) {return 1},
		ordinalType:'bands',
		getXtickSize:function() {return 6},
		getYtickSize:function() {return -self.settings.plotWidth},
		getMargin:function() { 
			return {
				top:50, 
				bottom:30, 
				right:50, 
				left:150
			}
		}, 
		getPosition:function() {
			return {top: $('.view-title').height(), left:0}
		},
		fontFamily:'helvetica', 
		fontSize:'25px',
		getLegend:function() {},
		yTickFormat:d3.format('.2s'), 
		xTickFormat:d3.format('.2s'),
		pointRadius:10,
		getTitleText:function() {return 'This is a chart title'}, 
		yLabel:'Vertical axis text',
		xLabel:'Horizontal axis text',
		drawPoints:true,
		fadeInCircles:false,
		filterPoints:[], 
		filterLines:[], 
		filterLabels:[],
		fadeInText:true,
		drawLines:true,
		labelText:true,
		color:function() {
			return 'black'
		}, 
		yLineStroke:'1px', 
		yLineColor:'black', 
		yLineDash:'5,5', 
		xLineStroke:'1px', 
		xScaleType:'ordinal', 
		xLineColor:'black', 
		xLineDash:'5,5', 
		getElementSize:function() {
			return {width:self.settings.pointRadius, height:self.settings.pointRadius}
		}
	}
	self.settings = $.extend(false, defaults, settings)
	self.data = self.settings.data
	self.defineFunctions()
	self.build()
}

// Get size - calculates width, height, position
Chart.prototype.getSize = function() {
	var self = this
	self.settings.height = self.settings.getHeight(self) 
	self.settings.width = self.settings.getWidth(self)
	self.settings.margin = self.settings.getMargin(self)
	self.settings.svgHeight =  self.settings.height  - $('#' + self.settings.id + '-divtitle').outerHeight() - $('.view-title').outerHeight()  - self.settings.bottomPadding
	self.settings.plotHeight = self.settings.svgHeight - self.settings.margin.top - self.settings.margin.bottom
	self.settings.plotWidth = self.settings.width - self.settings.margin.left - self.settings.margin.right
	self.settings.legend = self.settings.getLegend(self)	
	self.settings.position = self.settings.getPosition(self)
	if(self.settings.type == 'map') {
		self.settings.mapHeight = self.settings.height - self.settings.legend.space - $('#' + self.settings.id + '-divtitle').outerHeight() - $('.view-title').outerHeight()
	}
}

// Set scales
Chart.prototype.setScales = function() {
	var self = this
	if(self.settings.hasScale == false) return
	var elementSize = self.settings.getElementSize()
	var limits = self.settings.lock == true ? self.settings.limits : self.getLimits()
	if(limits != undefined && limits.x != undefined) {

		if(self.settings.xScaleType == 'ordinal' && self.settings.ordinalType == 'bands') {
			self.xScale = d3.scale.ordinal().rangeRoundBands([elementSize.width, self.settings.plotWidth - elementSize.width], self.settings.getXrangeBand()).domain(limits.x)
		}
		else if (self.settings.xScaleType == 'ordinal' && self.settings.ordinalType == 'points') {
			self.xScale = d3.scale.ordinal().rangePoints([elementSize.width/2, self.settings.plotWidth - elementSize.width/2],  self.settings.getXrangeBand(self)).domain(limits.x)		
		}
		else if(self.settings.xScaleType == 'date') {
			var width = self.settings.bin == 'outliers' ? self.settings.legend.width : self.settings.plotWidth
			self.xScale = d3.time.scale().range([elementSize.width, width - elementSize.width]).domain([limits.x.min, limits.x.max])
		}
		else {
			var width = self.settings.bin == 'outliers' ? self.settings.legend.width : self.settings.plotWidth
			self.xScale = d3.scale.linear().range([elementSize.width, width - elementSize.width]).domain([limits.x.min, limits.x.max])
		}
		self.settings.xAxisTop = self.settings.xAxisPosition == 'bottom' ? self.settings.plotHeight : 0
		 self.xaxis = d3.svg.axis()
			.scale(self.xScale)
			.orient(self.settings.xAxisPosition)
			.ticks(5)
			.tickSize(self.settings.getXtickSize())
		if(self.settings.xScaleType != 'date') {
			self.xaxis 
			.tickFormat(self.settings.xTickFormat)
			.tickValues(d3.keys(self.settings.xAxisLabels).length >0 ? d3.values(self.settings.xAxisLabels) : null)
		}

	}
	if(limits != undefined && limits.y != undefined) {
		if(self.settings.yScaleType == 'date') {
			var width = self.settings.bin == 'outliers' ? self.settings.legend.width : self.settings.plotWidth
			self.yScale = d3.time.scale().range([self.settings.plotHeight - elementSize.height, elementSize.height]).domain([limits.y.min, limits.y.max])
		}
		else self.yScale= d3.scale.linear().range([self.settings.plotHeight - elementSize.height, elementSize.height]).domain([limits.y.min, limits.y.max])
		self.yaxis = d3.svg.axis()
					.scale(self.yScale)
					.orient("left")
					.tickSize(self.settings.getYtickSize())
					.ticks(5)

		if(self.settings.yScaleType != 'date') {
			self.yaxis 
				.tickFormat(self.settings.yTickFormat)
				.tickValues(d3.keys(self.settings.yAxisLabels).length >0 ? d3.values(self.settings.yAxisLabels) : null)
		}
					

	}

}

// Build chart elements
Chart.prototype.build = function() {
	var self = this
	self.getSize()
	self.div = d3.select('#' + self.settings.container).append("div").attr('id', self.settings.id + '-div').attr('class', 'chart').style('position', 'absolute').style('top', self.settings.position.top + 'px').style('left', self.settings.position.left + 'px')

	// Draw titles
	if(self.settings.hasTitle == true) {
		self.buildTitle()
		self.changeTitle()
	}

	self.getSize()
	self.setScales()

	// Draw SVG & G
	if(self.settings.hasSvg == true) {
		self.svgWrapper = d3.select('#' + self.settings.id + '-div').append("div").style('height', self.settings.svgHeight + 'px').style('width', self.settings.width + 'px').style("position", "relative")
		self.svg = self.svgWrapper.append("svg")
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('viewbox', '0,0,' + self.settings.width + ',' + self.settings.svgHeight)
			.attr('id', self.settings.id + '-svg')
		
		self.g = self.svg.append("g")
			.attr("id", self.settings.id + '-g')
			.attr('transform', 'translate(' + self.settings.margin.left + ',' + self.settings.margin.top + ')')

		if(self.settings.zoomAble == true) {
			self.zoomer = d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 15]).on("zoom", self.zoom)
			self.g.call(self.zoomer)
			self.g.append('rect')
				.attr("class", "overlay")
				.attr("id", "clip")
			    .attr("width", self.settings.plotWidth)
			    .attr("height", self.settings.plotHeight);
		}
	}
	
 	// Build axes
	self.buildAxes()
 
 	// Draw Axes
	self.drawAxes()

 	// Build axis labels
	self.buildAxisLabels()	
	
	// Draw chart
	self.draw(true)	
}

// Draw - intended to be overwritten by inherited objects
Chart.prototype.draw = function() {}	

// Build axes 
Chart.prototype.buildAxes = function() {
	var self = this
	self.setScales()
	if(self.settings.hasXAxis == true) {
		self.xaxisLabels = self.g.append("g")
			.attr("class", "axis xaxis")
			.attr("id", "xaxis")
			.attr('transform', 'translate(' + 0 + ',' + self.settings.xAxisTop + ')')
	}
	
	
	if(self.settings.hasYAxis == true) {
		self.yaxisLabels = self.g.append('g')
			.attr('class', 'axis yaxis')
			.attr('transform', function() {
				return 'translate(' + 0 + ',0)'
			 })
			.attr('id', 'yaxis')	
	}
}

// Build Titles
Chart.prototype.buildTitle = function() {
	var self = this
	self.title = d3.select('#' + self.settings.id +'-div').append('div')
		.attr('class', 'div-title')
		.attr('id', self.settings.id + '-divtitle')
		.style('width', self.settings.plotWidth + 'px')
		.style('margin-left', self.settings.margin.left + 'px')
	
	self.titleText = self.title.append('text').attr('id', self.settings.id + '-divtitle-text')
}

// Change Title Text
Chart.prototype.changeTitle = function(duration) {
	var self = this
	self.title.style('width', self.settings.plotWidth + 'px')
	self.titleText.text(self.settings.getTitleText(self))
}
// var test
// Draw axes 
Chart.prototype.drawAxes = function(duration) {
	var self = this
	var duration = duration || 500;
	self.setScales()
	if(self.settings.hasYAxis == true) self.yaxisLabels.transition().duration(duration).call(self.yaxis).selectAll('text').each(function(data) {
		d3.select(this).attr('dat', data)
	})

	if(self.settings.hasXAxis == true) self.xaxisLabels.transition().duration(duration).call(self.xaxis).selectAll('text').each(function(data) {
		d3.select(this).attr('dat', data)
	})
}

// Build axis labels
Chart.prototype.buildAxisLabels = function() {
	var self = this
	
	// y-label
	var width = self.settings.plotHeight
	var height = self.settings.plotHeight
	if(self.settings.hasYLabel == true) {
		self.ytitleDiv = self.div.append('div').attr('class', 'ytitle-div').style('width', self.settings.plotHeight+ 'px').style('left', (self.settings.margin.left -75) + 'px').style("height", '10px !important')
		self.ytitle = self.ytitleDiv.append('text')
			.text(self.settings.yLabel)
			.attr('transform', 'translate(0,0) rotate(-90)')
			.attr('id', self.settings.id + '-yaxis-label')
			.attr('class', 'axis-label')
	}
		

// x-label
if(self.settings.hasXLabel == true) {
		self.xtitleDiv = self.div.append('div').attr('class', 'xtitle-div').style('width', self.settings.plotWidth+ 'px').style('margin-left', self.settings.margin.left + 'px')
		self.xtitle = self.xtitleDiv.append('text')
			.text(self.settings.xLabel)
			.attr('id', self.settings.id + '-xaxis-label')
			.attr('class', 'axis-label')
	}
}

// Update
Chart.prototype.update = function(sets, resetScale) {
	var self = this
	var resetScale = resetScale == undefined ? true : resetScale
	self.settings = $.extend(false, self.settings, sets)
	self.data = self.settings.data
	if(typeof self.filterData == 'function') self.filterData()
	if(typeof self.settings.customUpdate == 'function') {
		self.settings.customUpdate(self)
		return
	}
	if(self.settings.hasYLabel == true) {
		self.ytitle 
			.text(self.settings.yLabel)
	}
	if(self.settings.hasXLabel == true) {
		self.xtitle 
			.text(self.settings.xLabel)
	}
	self.resize(resetScale)	
	self.draw(resetScale)
}

// Resize event - repositions elements
Chart.prototype.resize = function(resetScale) {
	var self = this
	if(self.settings.resize == false) return
	self.getSize()
	if(self.settings.hasTitle) self.changeTitle()		
	self.getSize()
	if(resetScale == true) self.setScales()
	var build = build || true;
	var transition = build == true? 0 : 1500
	self.div.transition().duration(transition).style('top', self.settings.position.top + 'px').style('left', self.settings.position.left + 'px')

	if(self.settings.hasSvg ==true) {
		self.svgWrapper.style('height', self.settings.svgHeight + 'px').style('width', self.settings.width + 'px')
		self.svg
			.attr("width", '100%')
			.attr("height", '100%')
			.attr('viewbox', '0,0,' + self.settings.width + ',' + self.settings.svgHeight)
	}
		
	if(self.settings.hasYLabel == true)self.ytitleDiv.style('width', self.settings.plotHeight+ 'px').style("height", '10px !important')
	
	if(self.settings.hasXLabel == true) {
		self.xtitleDiv.style('width', self.settings.plotWidth+ 'px').style('margin-left', self.settings.margin.left + 'px')		
	}
	
	if(self.settings.hasXAxis == true) {
		self.xaxisLabels.attr('transform', 'translate(' + 0 + ',' + self.settings.xAxisTop + ')')
	}
	
	if(resetScale == true)  self.drawAxes(transition)
	
	
	if(self.settings.hasMapLegend == true) {
		self.updateLegend()
	}
}

Chart.prototype.getElementByValue = function(arr, idVariable, idValue, valueVariable) {
	var ret = arr.filter(function(d) {
		return d[idVariable] == idValue
	})[0][valueVariable]
	return ret
}


// Define set of functions for positioning, interactivity, etc. 
Chart.prototype.defineFunctions = function() {
	var self = this

	self.zoomTransform = function(d) {
		return 'translate(' + self.xScale(d.x) + ',' + self.yScale(d.y) + ')'
	}
	// Zooming
	self.zoom = function() {
 		self.g.selectAll('.circle').call(self.circlePositionFunction)
		self.xaxisLabels.call(self.xaxis)
		self.yaxisLabels.call(self.yaxis)
	}

	self.legendRectFunc = function(leg) {
		leg.attr("width", self.settings.legend.rectWidth)
		   .attr("height", function(d) {
				return self.settings.legend.rectHeight
			})			
			.attr('fill', function(d) {
				return self.settings.getColor(d)
			})
			.attr('class', function(d) {
				return 'leg-rect'
			})
	}
	
	self.legendTextFunc = function(txt) {
		txt.text(function(d) {
			var limit = Math.floor((self.settings.margin.right -10)/10.5)
			var fullText =   d
			var text = fullText
			return text
		})
		.attr('fulltext', function(d) {  
			var fulltext =   d
			return fulltext
		})
		.attr('x', self.settings.legend.rectWidth + 5)
		.attr('y', self.settings.legend.rectHeight/2 + 5)
		.attr('fill', function(d) {
			var color =  'black'
			return color
		})
		.attr('class', function(d) {
			return 'leg-text'
		})
	}

	// Circle position function
	self.circlePositionFunction = function(circle) {
		circle
			.attr('transform', self.zoomTransform)
			.attr('r', function(d) {return self.settings.getRadius(d)})
			.style('fill', function(d) {
				return self.settings.getColor(d.colorValue)}
			)
			.attr('class', 'circle')
			.attr('id', function(d) {return 'circle-' + d.id})
			.attr('circle-id', function(d) {return d.id})
			.style('visibility', function(d) {
				if(self.xScale(d.x)<0 | self.xScale(d.x) > self.settings.plotWidth | self.yScale(d.y)<0 | self.yScale(d.y)>self.settings.plotHeight){
					return 'hidden'
				} 
				else return 'visible'
			})
			.style('stroke', 'black')
			.style('stroke-width', function(d) {return d.id == self.settings.selected ? '2px' : '0px'})
	}
	
}
