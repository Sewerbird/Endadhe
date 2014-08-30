var Eventer = function(fnMap){
	var self = this;
	_.each(fnMap, function(v,k){
		self.registerListener(k,v)
	});
}
Eventer.prototype.registerListener = function(event, callback){
	if(!this.events) this.events = {};
	if(!this.events[event]) this.events[event] = new Array();
	if(_.isFunction(callback)) this.events[event].push(callback);
}
Eventer.prototype.emitEvent = function(event, data){
	if(this.events && this.events[event])
		_.each(this.events[event], function(fn){fn(data)})
}