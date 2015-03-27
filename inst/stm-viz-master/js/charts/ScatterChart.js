// ScatterChart object function -- inherits from Chart
var ScatterChart = function(sets) {
	var self = this 
	defaults = {
		hasAxes:true, 
		hasSvg:true,
		xTickFormat: function(d) {
			if(d3.keys(self.settings.xAxisLabels).length >0) {
				var limit = this.id == self.settings.id ? 100 : 11
				return self.shortenText(self.getKeyByValue(self.settings.xAxisLabels, Number(d)), limit)
			}			
			var formatter = Math.abs(d) < 1 ? d3.format('.2g') : d3.format('.2s')
			return formatter(d)
		},
		yTickFormat:function(d) {
			if(d3.keys(self.settings.yAxisLabels).length >0) {
				var limit = this.id == self.settings.id ? 100 : 11
				return self.shortenText(self.getKeyByValue(self.settings.yAxisLabels, Number(d)), limit)
			}				
			var formatter = Math.abs(d) < 1 ? d3.format('.2g') : d3.format('.2s')
			return formatter(d)
		},
		hoverFormat:d3.format('.2s'),
		yLine:0, 
		ordinalType:'overwrite',
		legendType:'continuous',
		getHeight:function(chart) {
			var bottom = d3.keys(chart.settings.colorLabels).length != 0 | chart.settings.colorVar == 'none' ? 40 : 90
			return $('#' + self.settings.container).innerHeight() - bottom - $('#bottom').height()
		},
		zoomAble:true,
		pointRadius:10,
		getRadius:function(d) {return 10},
		color:d3.scale.category10(),
		dash:function(d) {
			return "5,0"
		}, 
		showZero:false, 
		strokeWidth:function(d) {return '4px'},
		multiHover:true,
		hasLegend:false,
		hasRect:false,
		xScaleType:'linear',
		getLegend:function(chart){
			return {	
				height:12, 
				width:chart.settings.plotWidth,
				shift:chart.settings.margin.left,
				rectWidth:20,
				rectHeight:10, 
			}
		},
	}
	var initSettings = $.extend(false, defaults, sets)
	self.init(initSettings)
}

ScatterChart.prototype = Object.create(Chart.prototype)


// Get data limits
ScatterChart.prototype.getLimits = function() {
	var self = this
	var limits = {x:{}, y:{}}
	if(typeof self.settings.customGetLimits == 'function') {
		return self.settings.customGetLimits(self)
	}
	if(self.settings.xScaleType == 'ordinal') {
		var included = []
		self.settings.data.map(function(d) {
			if(included.indexOf(d.x) == -1) {
				included.push(d.x)
			}
		})
		limits.x.min = -1
		limits.x.max = included.length
	}
	else {
		limits.x.min = d3.min(self.settings.data, function(d) {return d.x}) 
		limits.x.max = d3.max(self.settings.data, function(d) {return d.x}) 
	}
	var values = []
	limits.y.min = self.settings.showZero == true ? 0 : d3.min(self.settings.data, function(d) {return d.y}) 
	limits.y.max = d3.max(self.settings.data, function(d) {return d.y}) 
	return limits
}

// Draw elements -- called on build and resize
ScatterChart.prototype.draw = function(resetScale, duration) {
	var self = this
	duration = duration == undefined ? 500 : duration
	if(self.settings.hasLegend == true) self.drawLegend()	
	if(resetScale == true) self.setScales()
	self.getSize()
	if(resetScale == true) self.setScales()
	
	// draw bubbles
	var circles = self.g.selectAll('.circle').data(self.settings.data, function(d) {return d.id})
	circles.exit().remove()
	circles.enter().append('circle').call(self.circlePositionFunction)
	self.g.selectAll('.circle').transition().duration(500).call(self.circlePositionFunction)
	
	if(self.settings.zoomAble == true && resetScale == true) {
		self.zoomer = d3.behavior.zoom().x(self.xScale).y(self.yScale).scaleExtent([1, 15]).on("zoom", self.zoom)
		self.g.call(self.zoomer)
	}
	self.drawLegend()
	var select = $('#circle-'+self.settings.selected)[0]
	if(typeof(select)!= 'undefined') select.parentNode.appendChild(select)

}

// Draw a legend
ScatterChart.prototype.drawLegend = function() {
	var self = this
	$('#' + self.settings.id + '-legend-wrapper').remove()
	if(self.settings.colorVar == 'none') return
	if(d3.keys(self.settings.colorLabels).length == 0) self.drawContinuousLegend()
	else self.drawCategoricalLegend()
}

// Legend for categorical variables
ScatterChart.prototype.drawCategoricalLegend = function() {
	var self = this
	var x =  self.xScale.range()[1] + self.settings.margin.left + 40
	var y = 10
	legendData = d3.keys(self.settings.colorLabels)
	if(legendData.length == 1) return
	var labelScale = d3.scale.linear().domain([legendData.length-1,0]).range([0,(self.settings.height - 50)]) 
		
	var legend = self.svg.append('g').attr('id', self.settings.id + '-legend-wrapper').attr('transform', 'translate(' + (x) + ',' +(y) + ')').style('cursor', 'pointer')
	var labels = legend.selectAll('g')
					.data(legendData, function(d) {return d})
					.enter().append('g')
					.attr('class', 'legend-g')
					.attr('transform', function(d,i) {return 'translate(0,' +((i*40) ) + ')' })
					
	var legRects = labels.append('rect').call(self.legendRectFunc)
		

	var text = labels.append('text').call(self.legendTextFunc)
}

// Legend for continous variables
ScatterChart.prototype.drawContinuousLegend = function() {
	var self = this
	self.legendWrapper = self.div.append('div').attr('id', self.settings.id + '-legend-wrapper').style('margin-top', '26px')
	self.legendDiv = self.legendWrapper.append('div').attr('id', self.settings.id + '-legend-div')
	self.legend = self.legendDiv
		.append("svg")		
		.attr('id', self.settings.id + '-legend-svg')

	self.gradient = self.legend
	.append("svg:defs")
		.append("svg:linearGradient")
		.attr("id", "map-gradient")
		.attr("x1", "0%")
		.attr("y1", "0%")
		.attr("x2", "100%")
		.attr("y2", "0%");
	$.extend([],self.settings.colorRange).reverse().forEach(function(d,i){
		self.gradient.append("svg:stop")
			.attr("offset",((i+1)/(12)))
			.attr("stop-color", d)
			.attr('id', 'stop-color-' + i)
	});

	self.legendBar = self.legend.append("g")
	self.legendRect = self.legendBar.append('rect').attr('id', self.settings.id + '-legendrect')

	self.legendLabels = self.legend.append('g')
		.attr('transform', 'translate(' + self.settings.legend.shift+ ',' + (self.settings.legend.height) + ')')
		.attr('class', 'axis')

	self.legendText = self.legend.append('g')
		.attr('transform', 'translate(' + (self.settings.legend.shift -50)+ ',' + (self.settings.legend.height/2 + 5) + ')')
		.attr('class', 'legend-text')
		.append('text')
		.style('font-size', '.8em')
		.style('cursor', 'pointer')

	self.legend
		.attr("height", self.settings.legend.height + 40)
		.attr("width", self.settings.legend.width + self.settings.legend.shift + 24)
	
	
	self.legendBar
		.attr('transform', 'translate(' + self.settings.legend.shift+',0)')	
	
	self.legendRect		
			.attr('y', '0px')
			.attr('x', '0px')
			.attr('height', self.settings.legend.height)
			.attr('width',  self.settings.legend.width)
			.attr('stroke', 'none')
			.attr('fill', 'url(#map-gradient)')

	self.settings.legendScale.range([0, self.settings.plotWidth])
	self.legendAxes = d3.svg.axis()
		.scale(self.settings.legendScale)
		.orient('bottom')
		.ticks(4)
	
	self.legendLabels
		.call(self.legendAxes);
		
	self.legendText.text(self.shortenText(self.settings.legendLabel, 9))
}

// Helper functions
ScatterChart.prototype.getKeyByValue = function( obj, value ) {
    for( var prop in obj ) {
        if( obj.hasOwnProperty( prop ) ) {
             if( obj[ prop ] === value )
                 return prop;
        }
    }
}

ScatterChart.prototype.shortenText = function(text,length) {
	if(text.length<=length+3) return text
	return text.substr(0, length) + '...'
}


ScatterChart.prototype.zoomIn = function() {
   var self = this
   if(self.zoomer.scale() > 8) return
   self.zoomer.scale(self.zoomer.scale()+.1);
   self.zoomer.event(self.g);
}

ScatterChart.prototype.zoomOut = function() {
   var self = this
   if(self.zoomer.scale() < .9) return
   self.zoomer.scale(self.zoomer.scale()-.1);
   self.zoomer.event(self.g);

}
