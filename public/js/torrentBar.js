var TorrentBar = function(options, levelUpCallback, xpUpCallback){
	//Defaults and overloading
	if(_.isFunction(options))
	{
		xpUpCallback = options
		levelUpCallback = xpUpCallback
		options = {}
	}
	//State
	_.defaults(this, _.defaults(options,
		{length:10, level:0, id:Math.floor(Math.random()*1000000)}
		));
	this.chain = options.chain?options.chain:_.times(this.length,function(){return 0});
	//Events
	this.eventer = new Eventer({
		xpUp : xpUpCallback,
		lvlUp : levelUpCallback
	});
}
TorrentBar.prototype.checkLevelUp = function(){
	if(_.find(this.chain, function(val){return val <= 0}) !== 0){
		this.chain = _.map(this.chain, function(v){return v-1});
		this.level++;
		this.eventer.emitEvent('lvlUp',this);
	}
}
TorrentBar.prototype.addAt = function(idx){
	if(idx < this.length && idx >= 0){
		if(this.chain[idx]) this.chain[idx]+1
		else{
			this.chain[idx] = 1;
			this.eventer.emitEvent('xpUp',idx);
			this.checkLevelUp()
		}
	} else console.error("Error: idx more than length. ",idx,">",this.length)
}
TorrentBar.prototype.addRandom = function(idx){
	this.addAt(Math.floor(Math.random()*this.length))
}
TorrentBar.prototype.getIndexState = function(value){
	// 1 is surplus, 0 is satisfied, -1 is deficient
	return value > 0 ? (value > 1 ? 1 : 0) : -1
}
TorrentBar.prototype.getSupply = function(supplyState){
	var self = this;
	return _.without(_.map(self.chain,function(v,k){return self.getIndexState(v)===supplyState?k:undefined}),undefined)
}
TorrentBar.prototype.getExcess = _.partial(TorrentBar.prototype.getSupply,1)
TorrentBar.prototype.getNeeded = _.partial(TorrentBar.prototype.getSupply,-1)
TorrentBar.prototype.getSatisfied = _.partial(TorrentBar.prototype.getSupply,0)
TorrentBar.prototype.findATrade = function(other){
	if(!other) return undefined;
	var theyWantIHave = _.intersection(other.getNeeded(), this.getExcess())
	var theyHaveIWant = _.intersection(other.getExcess(), this.getNeeded())
	if(_.size(theyWantIHave) && _.size(theyHaveIWant))
		return {
			give:_.sample(theyWantIHave), 
			get:_.sample(theyHaveIWant), 
			initiator:this, other:other};
	else return false;
}