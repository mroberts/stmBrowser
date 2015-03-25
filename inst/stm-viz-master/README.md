stmBrowser Visualization
============================

The stmBrowser Visualization provides an interactive environment for exploring STM model results in a web browser.  The visualizatoin pairs a configurable scatter plot with the full text of a selected document.  The interactive scatterplot allows specification of the x-position, y-position, color, and radius of each document.   Using the simple `stmBrowser()` command, all necessary files will be saved to a directory, and the index.html file will open in your default browser (optimized for Chrome).  The visualization is built to function without running a local server or needing internet connection. 


Usage
--------------
The visualization reads in data saved from the R command `stmBrower()`.  The tool will then automatically construct selection menu options based on the variables in your dataset for configuring the chart. The following data-types are currently supported:

* X-axis, Y-axis: Continuous, categorical, date.
* Color: Continuous, categorical
* Radius: Continuous


Code structure
--------------

The stmBrowser Visualization loosely follows and MV* architecture where a [View](https://github.com/mroberts/stmBrowser/blob/master/inst/stm-viz-master/js/charts/Chart.js) controls the actions of the charts (both the scatter plot and the text display are charts).  This allows the controls below to dictate the rendering of the scatterplot, and also enables click events on the scatter plot to set the text document presented.  

Leveraging prototypal inheretence, both charts inherent from the parent [Chart](https://github.com/mroberts/stmBrowser/blob/master/inst/stm-viz-master/js/charts/Chart.js)  object. 


Configuration
--------------
The charts have default configurations that handle layout such as how to format axes, label axes, etc.  These are set in the global [settings](https://github.com/mroberts/stmBrowser/blob/master/inst/stm-viz-master/js/settings.js) object.
```javascript
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
```

Libraries
--------------
 The visualization is built using the following libraries (it references downloaded versions, so will not reflect package updates):

 * [D3](http://d3js.org/)
 * [jquery](https://jquery.com/)
 * [jquery-ui](https://jqueryui.com/)
 * [poshytip](http://vadikom.com/demos/poshytip/)
 * [select2](https://select2.github.io/)

