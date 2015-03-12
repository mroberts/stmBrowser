// TextChart object function -- inherits from Chart
var TextChart =  function(sets) {
	var self = this 
	defaults = {
		hasXAxis:false, 
		hasYAxis:false,
		hasXLabel:false, 
		hasYLabel:false,
		hasSvg:false,
		fadeIn:false,
		hasTitle:true,
		fontSize:14,
		getTitleText:function(){return 'Selected Document'},
		lock:true,
		text:'test', 
		getMargin:function() { 
			return {
				top:0, 
				bottom:0, 
				right:0, 
				left:0
			}
		}, 
		styles:{},
	}
	var initSettings = $.extend(false, defaults, sets)
	self.init(initSettings)
}

TextChart.prototype = Object.create(Chart.prototype)

// Draw elements -- called on build and resize
TextChart.prototype.draw = function() {
	var self = this
	if(self.textWrapper == undefined) {
		 self.textWrapper = self.div.append('div').attr('id', self.settings.id + '-wrapper').style('text-align', 'left')
	}
	self.textWrapper.style('width', self.settings.width + 'px')
		.style('height', self.settings.height + 'px')
	var textData = typeof self.settings.text == 'string' ? [self.settings.text] : self.settings.text
	var text = self.textWrapper.selectAll('.text').data(textData)

	text.exit().remove()
	text.text(function(d) {return d}).style('color', function(d,i) {
			return self.settings.colors == undefined ? 'black' : self.settings.colors[i]
		})	
		
	text.enter().append('text')
		.attr('class', 'text')
		.text(function(d,i) {return d})	
		.style('color', function(d,i) {
			return self.settings.colors == undefined ? 'black' : self.settings.colors[i]
		})	
		.style('font-size', self.settings.fontSize + 'px')
		
		if(self.settings.fadeIn == true) {
			d3.selectAll('.text.entering').transition().delay(function(d,i) {return i*50}).style('opacity', 1).each('end', function() {d3.select(this).attr('class', 'text')})
		}
		self.addStyle()
}

// Add styles defined in the settings
TextChart.prototype.addStyle = function() {
	var self = this
	if(self.settings.styles.div != undefined) {
		self.settings.styles.div.map(function(style) {
			self.textWrapper.style(style.key, style.value)
		})
	}
	if(self.settings.styles.text != undefined) {
		var text = self.textWrapper.selectAll('.text')
		self.settings.styles.text.map(function(style) {
			text.style(style.key, style.value)
		})
	}
	self.div.style('height', $('#' + self.settings.id + '-div').height() + 'px')
}