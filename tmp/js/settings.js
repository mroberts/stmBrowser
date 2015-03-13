var settings = {
	textView:{
		id:'textView',
		filePath:'data/output.csv', 
		customBuild:function() {
			$('#control-container-buttons-zoom')[0].parentNode.appendChild($('#control-container-buttons-zoom')[0])
		},
		charts:['scatterChart', 'textChart'], 
		buildChart:function(view, chart, index) {
			switch(chart) {
				case 'scatterChart':
					view.charts[index] = new ScatterChart(settings.scatterChart)
					break
				case 'textChart':
					view.charts[index] = new TextChart(settings.textChart)
					break
				default:
					break;
			}
		}, 
		poshyEvents:[
			{wrapper:'scatterChart-div', klass:'circle', content:function(d){
				var dat = this.__data__
				if(view.charts[0].settings.xScaleType == 'date') {
					var formatter = d3.time.format("%d-%b-%Y");
					var xVal = formatter(dat.x)
				}
				else var xVal =  view.charts[0].settings.xTickFormat(Number(dat.x))
				var yVal = 'YVAL HERE'
				
				if(view.charts[0].settings.yScaleType == 'date') {
					var formatter = d3.time.format("%d-%b-%Y");
					var yVal = formatter(dat.y)
				}
				else var yVal = view.charts[0].settings.yTickFormat(Number(dat.y))
				var text = '<b>' + view.settings.xVar + '</b>: ' + xVal + '</br>'
				text += '<b>' + view.settings.yVar + '</b>: ' + yVal + '</br>'
				text += dat.text.substr(0, 100) 
				if(dat.text.length>100) text += '...'
				return text
			}},
			// {wrapper:'scatterChart-div', klass:'axis', content:function(d){
			{wrapper:'scatterChart-div', customSelect:'#scatterChart-div [class~="yaxis"] text', content:function(d){
				test = this
				var dat = $(this).attr('dat')
				return d3.keys(view.charts[0].settings.yAxisLabels).length == 0 ? false :view.charts[0].settings.yTickFormat(dat)
			}},
			{wrapper:'scatterChart-div', customSelect:'#scatterChart-div [class~="xaxis"] text', content:function(d){
				test = this
				var dat = $(this).attr('dat')
				return d3.keys(view.charts[0].settings.xAxisLabels).length == 0 ? false : view.charts[0].settings.xTickFormat(dat)
			}},
			{wrapper:'scatterChart-div', klass:'legend-text', content:function(d){
				return view.charts[0].settings.legendLabel
			}},
		], 
		clickEvents: [
			{wrapper:'scatterChart-div', klass:'circle', attribute:'circle-id', setting:'selected'},
		], 
	},
	scatterChart:{
		id:'scatterChart',
		getWidth:function(chart) {return $('#'+chart.settings.container).width()*2/3 - 10}, 
		getMargin:function(chart) { 
			var right = d3.keys(chart.settings.colorLabels).length == 0 | chart.settings.colorVar == 'none' ? 50 : 150
			var bottom = 20
			return {
				top:50, 
				bottom:bottom, 
				right:right, 
				left:80
			}
		}, 
		hasTitle:true, 
		getTitleText:function(chart) {
			return chart.settings.xLabel +  ' v.s. ' + chart.settings.yLabel
		}
	},
	textChart: {
		id:'textChart', 
		getWidth:function(chart) {
			var width  = $('#'+chart.settings.container).width()/3 - 10
			return width
		},
		getPosition:function(chart){return {
			top:0, 
			left:$('#'+chart.settings.container).width()*2/3
		}}, 
		getHeight:function(chart) {
			return $('#' + chart.settings.container).innerHeight() - 70 - $('#bottom').height()
		},

	},
}


