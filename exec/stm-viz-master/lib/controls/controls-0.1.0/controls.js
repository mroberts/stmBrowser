function Controls(settings){
	var self = this;
	self.defaults = {
		container: '#controls',
		gaCategory: 'Uncategorized settings',
	}
	
	self.settings = $.extend({}, self.defaults, settings);
	
	self.controls = {};
	self.init();
}

Controls.prototype.init = function(){
	var self = this;
	
	d3.values(self.settings.controls).forEach(function(ele){
		self.addControl(ele);
	});
}

Controls.prototype.addControl = function(control){
	var self = this;
	
	if(typeof self.controls[control.id] == 'undefined'){
		if(control.options && control.options.constructor === Array){
			control._options = $.extend([], control.options);
			control.options = function(){ return control._options };
		}
		
		if(typeof control.components != 'undefined'){
			d3.values(control.components).forEach(function(component){	
				component.settings = $.extend({}, self.getDefaults(component.type, component), component.settings);
				self.controls[component.id] = component;
			});
		}
		else if(control.type == 'buttons'){
			d3.values(control.options()).forEach(function(button){
				button.type = 'button';
				button.buttonsText = control.text;
				button.settings = $.extend({}, self.getDefaults(button.type, button), button.settings);
				self.controls[button.id] = button;
			});
		}
		else{
			control.settings = $.extend(true, {}, self.getDefaults(control.type, control), control.settings);
			self.controls[control.id] = control;
		}
		
		self.buildControl(control);
	}
}

Controls.prototype.buildControl = function(control){
	var self = this;
	switch(control.type){
		case 'header':
			self.buildHeaderWidget(control);
			break;
		case 'display':
			self.buildDisplayWidget(control);
			break;
		case 'select':
			self.buildSelectWidget(control);
			break;
		case 'multi-select':
			self.buildMultiSelectWidget(control);
			break;
		case 'tags':
			self.buildTagsWidget(control);
			break;
		case 'autocomplete':
			self.buildAutocompleteWidget(control);
			break;
		case 'button':
			self.buildButtonWidget(control);
			break;
		case 'buttons':
			self.buildButtonsWidget(control);
			break;
		case 'buttonset':
			self.buildButtonsetWidget(control);
			break;
		case 'slider':
			self.buildSliderWidget(control);
			break;
		case 'range-slider':
			self.buildRangeSliderWidget(control);
			break;
		case 'age':
			self.buildAgeWidget(control);
			break;
		case 'toggle':
			self.buildToggleWidget(control);
			break;
		case 'checkbox':
			self.buildCheckboxWidget(control);
			break;
		case 'input':
			self.buildInputWidget(control);
			break;
		case 'input-set':
			self.buildInputSetWidget(control);
			break;
		case 'wrapper':
			self.buildWrapper(control);
			break;
	}
}

Controls.prototype.getDefaults = function(type, ele){
	var self = this;
	var defaults = {};
	switch(type){
		case 'multi-select': 
			defaults = {
				width: '140px',
				minimumResultsForSearch: 10,
				formatSelection: function(state, container){
					return self.formatMultiSelection(state, container, ele);
				},
				formatResult: function(state, container){
					return self.formatMultiResult(state, container, ele);
				},
				matcher: self.matcher,
				dropdownCss: function(){
					return self.dropdownCss(ele);
				},
			}
			break;
		case 'select': 
			defaults = {
				width: '200px',
				height: '20px',
				minimumResultsForSearch: 10,
				formatSelection: self.formatSelection,
				formatResult: self.formatResult,
				matcher: self.matcher,
				dropdownCss: function(){
					return self.dropdownCss(ele);
				},
			}
			break;
		case 'tags':
			defaults = {
				width: '500px',
				tags: true,
				separator: '","',
				maximumSelectionSize: 0,
				formatSelection: function(object, container){
					return object.text;
				},
				formatResult: function(object, container, query){
					return self.formatResult(object, container);
				},
				initSelection : function (element, callback) {
					var data = [];
					var default_values = $.trim(element.val());
					
					default_values = default_values.split('","');
					$(default_values).each(function () {
						var part = this.split(':',2)
						data.push({id: this, text: part[1]});
					});
					element.val('');
					callback(data);
				},
			}
			break;
	}
	return defaults;
}

Controls.prototype.getHTMLid = function(control,part,option){
	var self = this;
	var c = self.settings.chart;
	
	var components = [];
	if(part) components.push(part);
	if(control.type) components.push(control.type);
	if(control.id) components.push(control.id);
	if(option) components.push(option);
	if(c) components.push(c);
	
	return components.join('-');
}

Controls.prototype.getHTMLclass = function(control,part){
	var self = this;
	var c = self.settings.chart;
	
	var components = [];
	if(part) components.push(part);
	if(control.type) components.push(components[components.length-1] + '-'+control.type);
	if(control.id) components.push(components[components.length-1] + '-'+control.id);
	
	return components.join(' ');
}

Controls.prototype.changeValue = function(cid,value){
	var self = this;
	var c = self.settings.chart;
	var settings = self.settings.controller.settings;
	var control = self.controls[cid];
	settings[control.id] = value;
	
	switch(control.type){
		case 'multi-select':
			break;
		case 'select':
			$("#" + self.getHTMLid(control,'control')).select2("val", value);
			break;
		case 'buttonset':
			if(control.settings.multiple && value && value.constructor === Array){
				value.forEach(function(v){
					$("#" + self.getHTMLid(control,'control') + ' [value="' + v + '"]').prop("checked", true).button("refresh");
				});
			}
			else if(value) $("#" + self.getHTMLid(control,'control') + ' [value="' + value + '"]').prop("checked", true).button("refresh");
			break;
		case 'slider':
			var val = (typeof control.options != 'undefined') ? control.options().map(function(o){ return o.id; }).indexOf(value) : value;
			$("#" + self.getHTMLid(control,'control')).slider('value', val);
			break;
		case 'range-slider':
			var val = (typeof control.options != 'undefined') ? value.map(function(v){ return control.options().map(function(o){ return o.id; }).indexOf(v); }) : value;
			$("#" + self.getHTMLid(control,'control')).slider('values', val);
			break;
		case 'tags':
			value = value.map(function(d) { return (typeof d == 'string') ? control.settings.data.filter(function(c){ return c.id == d })[0] :  d; });
			$("#" + self.getHTMLid(control,'control')).select2('data', value);
			if(settings) settings[control.id] = value.map(function(d) { return d.id; });;
			break;
		case 'autocomplete':
			if(value) { 
				$("#" + self.getHTMLid(control,'control')).val(control.options().filter(function(d){ return d.id == value })[0].text); 
				$("#" + self.getHTMLid(control,'control')).blur();
			}
			else $("#" + self.getHTMLid(control,'control')).val('');
			break;
		case 'checkbox':
			$("#" + self.getHTMLid(control,'control')).prop("checked", value);
			break;
	}
	self.trackEvent(control, value);
}

Controls.prototype.changeSetting = function(cid,value){
	var self = this;
	var c = self.settings.chart;
	var oc = ((c == 1) ? 2 : 1);
	var settings = self.settings.controller.settings;
	var control = self.controls[cid];
	
	settings[control.id] = value;
	self.changeValue(control.id,value);
	
	if(typeof control.change === 'function') control.change(control,value);
	else if(typeof self.settings.controller.updateCharts === 'function') self.settings.controller.updateCharts(control,value);
}

Controls.prototype.updateOptions = function(cid, options) {
	var self = this
	var control = self.controls[cid];
	if(control._options != undefined && typeof options!='undefined') {
		control._options = options
	}
	switch(control.type) {
		case 'select':
			$("#" + self.getHTMLid(control,'control')).empty()
			self.buildSelectOptions(control, $("#" + self.getHTMLid(control,'control')))
			break;
		case 'slider':
			$slider = $('#' + self.getHTMLid(control, "control"));
			self.buildSliderOptions(control);
			$slider.slider("option", "min", control.min);
			$slider.slider("option", "max", control.max);
			$slider.slider("value", $slider.slider("value"));
			break;
		case 'range-slider':
			$slider = $('#' + self.getHTMLid(control, "control"));
			self.buildSliderOptions(control);
			$slider.slider("option", "min", control.min);
			$slider.slider("option", "max", control.max);
			$slider.slider("values", $slider.slider("values"));
			break;
	}
}

Controls.prototype.trackEvent = function(control,value){
	var self = this;
	if(typeof self.controls[control.id] != 'undefined') {
		var name = (self.controls[control.id].text) ? self.controls[control.id].text : control.id;
		var category = self.settings.gaCategory;
		
		switch(control.type){
			case 'tags':
				break;
			case 'button':
				if(typeof control.buttonsText != 'undefined'){
					name = control.buttonsText;
					value	= control.text;
				}
				break;
			case 'slider':
				var val = (typeof control.options != 'undefined') ? control.options().map(function(o){ return o.id; }).indexOf(value) : value;
				value = control.value(val);
				break;
			case 'range-slider':
				var val = (typeof control.options != 'undefined') ? value.map(function(v){ return control.options().map(function(o){ return o.id; }).indexOf(v); }) : value;
				value = control.value(val);
				break;
			case 'checkbox':
			case 'toggle':
				value = (value) ? 'On' : 'Off';
				break;
			default:
				if(typeof self.controls[control.id].options == 'function'){
					var values = control.options().filter(function(d){ return d.id == value });
					if(values.length) value = control.options().filter(function(d){ return d.id == value })[0].text;
				}
				break;
		}
				
		if(typeof _gaq != 'undefined') _gaq.push(['_trackEvent', category, name, value]);
		if(typeof  ga  != 'undefined') ga('send', 'event', category, name, value);
	}
}

Controls.prototype.setLocks = function(lock, value){
	var self = this;
	var c = self.settings.chart;
	var oc = ((c == 1) ? 2 : 1);
	
	//self.settings.controller.settings[lock].sync = value;
	
	var locks = $("#control-lock-"+lock+"-"+c+", #control-lock-"+lock+"-"+oc)
	locks.prop('checked', value);
	locks.button('option', 'icons', { primary: ((value) ? "ui-icon-locked" : "ui-icon-unlocked")})
	locks.button('refresh');
}

Controls.prototype.changeLock = function(ele, lock){
	var self = this;
	var c = self.settings.chart;
	var oc = ((c == 1) ? 2 : 1);
	var settings = self.settings.controller.settings;
	var setting = settings[ele.id];
	setting.sync = lock.checked;
	
	$(lock).button('option', 'icons', { primary: ((lock.checked) ? "ui-icon-locked" : "ui-icon-unlocked")});
	
	if($("#control-lock-"+ele.id+"-"+oc).prop('checked') != lock.checked){
		self.setLocks(ele.id, lock.checked);
	}
	
	if(lock.checked){
		self.changeSetting(ele.id, setting.values[c]);
	}
}

Controls.prototype.buildWrapper = function(ele){
	var self = this;
	var container = $('<div>').appendTo(self.settings.container)
		.attr("id", self.getHTMLid(ele,"control-container"))
		.attr("class", self.getHTMLclass(ele, "control-container") + " clearfix");
	var wraper = $('<div>').appendTo(container)
		.attr("id", self.getHTMLid(ele,"control-wrapper"))
		.attr("class", self.getHTMLclass(ele, "control-wrapper") + " clearfix");
	if(typeof ele.visible == 'object'){
		container.attr('charts', ele.visible.join(' '));
	}
	return wraper;
}

Controls.prototype.buildLock = function(ele, wraper){
	var self = this;
	
	if(ele.lock){
		var lock = $('<input/>')
			.attr("id", self.getHTMLid(ele, "control-lock"))
			.attr('type', 'checkbox')
			.attr('value', ele.id)
			.attr("class", self.getHTMLclass(ele, "control-lock"));
		if(ele.sync){
			lock.attr('checked', 'checked');
		}
		wraper.append(lock);
		wraper.append($("<label>")
			.attr('for', self.getHTMLid(ele, "control-lock"))
			.attr("class", self.getHTMLclass(ele, "control-lock"))
		);
		lock.button({
			icons: {
				primary: ((ele.sync) ? "ui-icon-locked" : "ui-icon-unlocked")
			},
		});
		lock.click(function(){
			self.changeLock(ele,this);
		});
		return lock;
	}
}

Controls.prototype.buildCheckbox = function(ele, wraper){
	var self = this;
	
	var checkbox = $('<input/>')
		.attr("id", self.getHTMLid(ele, "control"))
		.attr('type', 'checkbox')
		.attr('value', ele.id)
		.attr("class", self.getHTMLclass(ele, "control"));
		
	if(ele.default){
		checkbox.attr('checked', 'checked');
	}
	
	wraper.append($("<label>")
		.attr('for', self.getHTMLid(ele, "control"))
		.attr("class", self.getHTMLclass(ele, "control-label"))
		.text(ele.text)
	);
	
	wraper.append(checkbox);
	
	checkbox.click(function(){
		self.changeSetting(ele.id, $('#' + self.getHTMLid(ele, "control")).is(':checked'));
	});
	return checkbox;
}

Controls.prototype.buildLabel = function(ele, wraper){
	var self = this;
	var label = $('<span>').appendTo(wraper)
		.attr("id", self.getHTMLid(ele, "control-label"))
		.attr("class", self.getHTMLclass(ele, "control-label"))
		.text(ele.text);
	return label;
}

Controls.prototype.buildValue = function(ele, wraper){
	var self = this;
	var value = $('<span>').appendTo(wraper)
		.attr("id", self.getHTMLid(ele, "control-value"))
		.attr("class", self.getHTMLclass(ele, "control-value"));
	return value;
}

Controls.prototype.buildSlider = function(ele, wraper){
	var self = this;
	var slider = $('<div>').appendTo(wraper)
		.attr("id", self.getHTMLid(ele, "control"))
		.attr("class", self.getHTMLclass(ele, "control"));
	return slider;
}

Controls.prototype.buildInput = function(ele, wraper){
	var self = this;
	var input = $('<input>').appendTo(wraper)
		.attr("id", self.getHTMLid(ele, "control") )
		.attr("class", self.getHTMLclass(ele, "control"));
	return input;
}

Controls.prototype.buildSelectOptions= function(ele, select){
	var self = this
	$(ele.options(self.settings.chart)).each(function() {
		var item = this;
		select.append($("<option>")
			.attr('value',this.id)
			.attr('id', self.getHTMLid(ele, "control", this.id))
			.attr('disabled', (this.enabled === 0) ? true : false)
			.attr('match-text', (this.match) ? this.match : this.text)
			.css({
				'font-weight': ((this.bold) ? 'bold' : ''),
				'padding-left': (this.distance*5)
			})
			.text(this.text));
	});
}

Controls.prototype.buildSelect = function(ele, wraper){
	var self = this;
	var select = $('<select>').appendTo(wraper)
		.attr("id", self.getHTMLid(ele, "control"))
		.attr("class", self.getHTMLclass(ele, "control"));
	if(typeof ele.settings.placeholder != 'undefined'){
		select.append($("<option>"));
	}
	self.buildSelectOptions(ele,select)
	return select;
}

Controls.prototype.buildButtonset = function(ele, wraper){
	var self = this;
	var buttonset = $('<div>').appendTo(wraper)
		.attr("id", self.getHTMLid(ele, "control"))
		.attr("class", self.getHTMLclass(ele, "control"));
	$(ele.options()).each(function() {
		var button = $("<input/>")
			.attr('type', ((ele.settings.multiple) ? 'checkbox' : 'radio'))
			.attr('name', self.getHTMLid(ele, "control"))
			.attr('value',this.id)
			.attr('id', self.getHTMLid(ele, "control-option", this.id))
		if((ele.settings.multiple && ele.default.indexOf(this.id) != -1) || ele.default == this.id){
			button.attr('checked', 'checked');
		}
		button.click(function(){
			var value;
			if(ele.settings.multiple){
				value = [];
				$('input:checkbox[name='+self.getHTMLid(ele, "control")+']:checked').each(function(){ 
					value.push($(this).val()); 
				});
			}
			else value = $(this).val();
			
			self.changeSetting(ele.id, value);
		});
		buttonset.append(button);
		buttonset.append($("<label>")
			.attr('for', self.getHTMLid(ele, "control-option", this.id))
			.text(this.text));
	});
	return buttonset;
}

Controls.prototype.buildButton = function(ele, wraper){
	var self = this;
	
	var button = $("<button>")
		.attr("id", self.getHTMLid(ele, "control"))
		.attr("class", self.getHTMLclass(ele, "control"))
		.text(ele.text);
	
	button.button();
	button.click(function(){
		self.changeSetting(ele.id, '');
	});
	
	wraper.append(button);

	return button;
}

Controls.prototype.buildAgeWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	var select = self.buildSelect(ele.components.age, wraper);
	var slider = self.buildSlider(ele.components.age_slider, wraper);
	var value = self.buildValue(ele.components.age_slider, wraper);
	slider.slider({
		value: ele.slider_default,
		min: ele.components.age_slider.min,
		max: ele.components.age_slider.max,
		slide: function(event, ui){
			value.text(ele.components.age_slider.value(ui.value));
			self.changeSetting(ele.components.age_slider.id, ui.value);
		},
		change: function(event, ui){
			value.text(ele.components.age_slider.value(ui.value));
		}
	});
	value.text(ele.components.age_slider.value(slider.slider("value")));
	select.val(ele.default);
	select.select2(ele.settings);
	select.change(function(){
		self.changeSetting(ele.components.age.id, this.value);
	});
}

Controls.prototype.buildSliderOptions = function(ele){
	var self = this;
	if(typeof ele.options != 'undefined'){
		ele.min = 0;
		ele.max = ele.options().length-1;
		
		if(ele.type == 'range-slider'){
			ele.default = ele.default.map(function(d){ return ele.options().map(function(o){ return o.id; }).indexOf(d); });
			if(typeof ele.value != 'function'){
				ele.value = function(i){
					return i.map(function(d){ return ele.options()[d].text; }).join(' - '); 
				}
			}
		}
		else{
			ele.default = ele.options().map(function(o){ return o.id; }).indexOf(ele.default);
			if(typeof ele.value != 'function'){
				ele.value = function(i){
					return ele.options()[i].text;
				}
			}
		}
	}
}

Controls.prototype.buildSliderWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	var value = self.buildValue(ele, wraper);
	var slider = self.buildSlider(ele, wraper);
	
	self.buildSliderOptions(ele);
	
	if(typeof ele.value != 'function'){
		ele.value = function(id){ return id; }
	}
	
	slider.slider({
		value: ele.default,
		min: ele.min,
		max: ele.max,
		step: (ele.step) ? ele.step : 1,
		slide: function(event, ui){
			var val = (typeof ele.options != 'undefined') ? ele.options()[ui.value].id : ui.value;
			value.text(ele.value(ui.value));
			self.changeSetting(ele.id, val);
		},
		change: function(event, ui){
			value.text(ele.value(ui.value));
		},
	});
	value.text(ele.value(slider.slider("value")));
}

Controls.prototype.buildRangeSliderWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	var value = self.buildValue(ele, wraper);
	var slider = self.buildSlider(ele, wraper);
	
	self.buildSliderOptions(ele);
	
	if(typeof ele.value != 'function'){
		ele.value = function(id){ 
			return id[0] + ' - ' + id[1]; 
		}
	}
	slider.slider({
		range: true,
		values: ele.default,
		min: ele.min,
		max: ele.max,
		step: (ele.step) ? ele.step : 1,
		slide: function(event, ui){
			if(ui.values[0] == ui.values[1]){  return false; }
			var val = (typeof ele.options != 'undefined') ? ui.values.map(function(v){ return ele.options()[v].id; }) : ui.values;
			value.text(ele.value(ui.values));
			self.changeSetting(ele.id, val);
		},
		change: function(event, ui){
			value.text(ele.value(ui.values));
		},
	});
	value.text(ele.value(slider.slider("values")));
}

Controls.prototype.buildButtonsetWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	var buttonset = self.buildButtonset(ele, wraper);
	buttonset.buttonset();
}

Controls.prototype.buildButtonWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	//var label = self.buildLabel(ele, wraper);
	var button= self.buildButton(ele, wraper);
}

Controls.prototype.buildToggleWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	//var lock = self.buildLock(ele, wraper);
	//var label = self.buildLabel(ele, wraper);
	var toggle = self.buildCheckbox(ele, wraper).button();
}

Controls.prototype.buildCheckboxWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	//var lock = self.buildLock(ele, wraper);
	//var label = self.buildLabel(ele, wraper);
	var checkbox = self.buildCheckbox(ele, wraper);
}

Controls.prototype.buildButtonsWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var label = self.buildLabel(ele, wraper);
	$(ele.options()).each(function() {
		var opt = this;
		var button = self.buildButton(opt, wraper);
	});
}

Controls.prototype.buildDisplayWidget = function(ele){
	var self = this;
	var mainWraper = self.buildWrapper(ele);
	d3.values(ele.components).forEach(function(component){	
		var wraper = $('<div>').appendTo(mainWraper);
		wraper.attr('class', self.getHTMLclass(ele, "control-component") + ' clearfix')
			.attr('id', self.getHTMLid(ele, 'control-component'))
		if(typeof component.visible == 'object'){
			wraper.attr('charts', component.visible.join(' '));
		}
		var lock = self.buildLock(component, wraper);
		var label = self.buildLabel(component, wraper);
		var select = self.buildSelect(component, wraper);
		select.val(self.settings.controller.settings[component.id].values[self.settings.chart]);
		select.select2(ele.settings);
		select.change(function(){
			self.changeSetting(component.id, this.value);
		});
	});
}

Controls.prototype.buildSelectWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	var select = self.buildSelect(ele, wraper);
	select.val(ele.default);
	select.select2(ele.settings);
	select.change(function(){
		self.changeSetting(ele.id, this.value);
	});
}

Controls.prototype.buildMultiSelectWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	var select = self.buildSelect(ele, wraper);
	//select.attr('multiple', true);
	//select.val(ele.default);
	select.select2(ele.settings);
	select.change(function(){
		var values = self.settings.controller.settings[ele.id];
		values = (typeof values == 'object') ? values : [];
	
		var val = $(this).select2('val');
		$(this).select2('val', '');
		if(values.indexOf(val) != -1) {
			values = values.filter(function(i) { return i != val; });
		}
		else{
			values.push(val);
		}
		self.changeSetting(ele.id, values);
	});
}

Controls.prototype.buildTagsWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	var input = self.buildInput(ele, wraper);
	input.val(ele.default);
	input.select2(ele.settings);
	input.change(function(){
		var ids = [];
		var values = this.value.split('","');
		values.forEach(function(d){
			d = d.split(":");
			if(d[0]) ids.push(d[0].toString());
		});
		self.changeSetting(ele.id, ids);
	});
}

Controls.prototype.buildAutocompleteWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	var input = self.buildInput(ele, wraper);
	$(input).autocomplete({
		source: ele.options().map(function(d){ return {id: d.id, value: d.text}; }),
		select: function(event, ui) {
			self.changeSetting(ele.id, ui['item']['id']);
		}
	});
	
	$(input).focus(function(){
		self.changeSetting(ele.id, '');
	});

	$(input).click(function(){
		self.changeSetting(ele.id, '');
	});
}

Controls.prototype.buildInputSetWidget = function(ele){
	var self = this;
	var wraper = self.buildWrapper(ele);
	var lock = self.buildLock(ele, wraper);
	var label = self.buildLabel(ele, wraper);
	ele.options().forEach(function(opt,i){
		var label = self.buildLabel($.extend({},ele,opt), wraper);
		var input = self.buildInput($.extend({},ele,opt), wraper);
		if(ele.default && ele.default.constructor === Array && ele.default[i]) input.val(ele.default[i]);
		$(input).change(function(){
			var values = [];
			$('#'+self.getHTMLid(ele,"control-wrapper")+' input').each(function(){ values.push($(this).val()); });
			self.changeSetting(ele.id, values);
		})
	});
}

Controls.prototype.buildHeaderWidget = function(ele){
	var self = this;
	var wraper = $('<div>').prependTo($(self.settings.container).parent())
		.attr("id", "control-header-"+self.settings.chart)
		.attr("class", "control-header clearfix");
	var label = self.buildLabel({
		type: 'select',
		val: ele.id,
		text: ((self.settings.chart == 1) ? 'Top' : 'Bottom') + ' Chart',
	}, wraper);
	var select = self.buildSelect(ele, wraper);
	select.val(ele.default);
	select.select2(ele.settings);
	select.change(function(){
		self.changeSetting(ele.id, this.value);
	});
}

Controls.prototype.markMatch = function(text, term, markup) {
	var match=text.toUpperCase().indexOf(term.toUpperCase()),
		tl=term.length;
	
	if (match < 0) {
		markup.push(text);
		return;
	}
	
	markup.push(text.substring(0, match));
	markup.push("<span class='select2-match'>");
	markup.push(text.substring(match, match + tl));
	markup.push("</span>");
	markup.push(text.substring(match + tl, text.length));
}

Controls.prototype.entries = function(map) {
	var entries = [];
	for (var key in map) entries.push({id: key, text: map[key]});
	return entries;
};

Controls.prototype.formatSelection = function(state, container) {	
	var self = this;
	$(container).parent().parent().attr('title', state.text);
	
	return state.text;
}

Controls.prototype.formatResult = function(state, container) {
	var self = this;
	
	if(typeof state.element != 'undefined') {
		$(container).attr('style', state.element[0].style.cssText);
	}
		
	return state.text;
}

Controls.prototype.inArray = function(needle, haystack, argStrict) {
  var key = '',
    strict = !! argStrict;

  if (strict) {
    for (key in haystack) {
      if (haystack[key] === needle) {
        return true;
      }
    }
  } 
	else {
    for (key in haystack) {
      if (haystack[key] == needle) {
        return true;
      }
    }
  }

  return false;
}

Controls.prototype.matcher = function(term, text, option){
	var self = this;
	text = $(option).attr('match-text');
	if(typeof text != 'undefined') return text.toUpperCase().indexOf(term.toUpperCase())>=0;
}

Controls.prototype.formatMultiSelection = function(state, container, ele) {	
	var self = this;
	$(container).addClass('select2-default');
	return ele.settings.placeholder
}

Controls.prototype.formatMultiResult = function(state, container, ele) {
	var self = this;
	var values = self.settings.controller.settings[ele.id];
	
	if(typeof state.element != 'undefined') {
		$(container).attr('style', state.element[0].style.cssText);
	}
	
	if(state.element[0].disabled){
		$(container).addClass('disabled');
		$(container).parent('li').removeClass('select2-result-selectable');
	}
	
	if(values != undefined && self.inArray(state.id, values, false)) {
		return ('✓ ' + state.element[0].text)
	}
	else{
		return state.text;
	}
}

Controls.prototype.dropdownCss = function(ele){
	var self = this;
	var select = $('#s2id_'+self.getHTMLid(ele,"control"));
	
	if(ele.settings.dropWidth) return {
		'border-radius': (select.hasClass('select2-drop-above')) ? '4px 4px 0 4px' : '4px 0 4px 4px', 
		'border-top': '1px solid #aaa', 
		'left': (select.offset().left - (ele.settings.dropWidth - select.outerWidth())), 
		'width': ele.settings.dropWidth + 'px'
	};
}