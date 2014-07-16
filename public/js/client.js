//   ██████╗  █████╗ ███╗   ███╗███████╗    ██╗  ██╗███████╗██╗  ██╗
//  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██║  ██║██╔════╝╚██╗██╔╝
//  ██║  ███╗███████║██╔████╔██║█████╗      ███████║█████╗   ╚███╔╝ 
//  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ██╔══██║██╔══╝   ██╔██╗ 
//  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ██║  ██║███████╗██╔╝ ██╗
//   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
//   
var GameHex = function(state){
	var self = this;
	//Traits Determined by state
	self.hexCoord = state.coord;
	self.fear = Math.random();
	self.population = state.population;

	//Traits determined by assign type
	_.each(_.keys(state.type),function(key){self[key] = state.type[key]})
	if(self.named && self.name) self.siteName = self.name();
}
GameHex.prototype.simulate = function(hexes){
	var self = this;
	_.each(self.population, function(seg,key){
		if(seg.props && seg.props.scared){
			var redux = Math.ceil(0.1 * seg.count);//Reduce percent scared by 10% each turn
			self.population.transfer(redux, key, 'villager_content');
		}
	})
	self.populationSize = _.reduce(_.pluck(_.where(self.population,{props : {good: true}}),'count'),function(sum,e){return sum + e});
	self.cowerSize = _.reduce(_.pluck(_.where(self.population,{props : {scared: true}}),'count'),function(sum,e){return sum + e});
	self.fear = (self.cowerSize+0.0)/(self.populationSize+0.0);
}
//Draw self at specified coord on canvas at a certain zoom scale
GameHex.prototype.render = function(ctx, coord, scale, offset, scaleSprite)
{
	if(!scaleSprite) scaleSprite = 1;
	var self = this;
	var populationSize = self.populationSize;
	var coordScale = 200 * scale; //Actual pixel width between each hex coord
	var loc = HexMath.hexCoordToScreenCoord(coord, coordScale, offset);
	var xOff = loc.x;
	var yOff = loc.y;
	//Draw Hex
	var grd=ctx.createLinearGradient(xOff+coordScale/2, yOff-2*coordScale, xOff-coordScale/2, yOff+2*coordScale);
	grd.addColorStop(0, "white");
	grd.addColorStop(1, self.color());
	ctx.fillStyle=grd;
	ctx.beginPath();
	for(var i = 0; i < 6; i++)
	{
		var angle = 2 * Math.PI / 6 * i;
		x_i = coordScale * scaleSprite * Math.cos(angle) + xOff;
		y_i = coordScale * scaleSprite * Math.sin(angle) + yOff;
		if(i == 0)
			ctx.moveTo(x_i, y_i);
		else
		{
			ctx.lineTo(x_i, y_i);
		}
	}
	ctx.closePath();
	ctx.lineWidth = 5 * scale * scaleSprite;
	ctx.strokeStyle = 'gray';
	ctx.fill();
	ctx.stroke();
	//Draw text on hex
	ctx.fillStyle='black'
	ctx.textAlign = "center";
	fontSize = Math.ceil(20 * scale * scaleSprite);
	ctx.font = ""+fontSize+"px Arial";
	ctx.fillText("("+self.type+")", xOff, yOff+(20*scale * scaleSprite)); //(Site type)
	if(self.type == 'Village')
	{
		fontSize = Math.ceil(30 * scale * scaleSprite);
		ctx.font = "bold "+fontSize+"px Arial";
		ctx.fillText(self.siteName,xOff,yOff); //Site name
		fontSize = Math.ceil(25 * scale * scaleSprite);
		ctx.font = "italic "+fontSize+"px Arial";
		ctx.fillText("Pop: "+self.cowerSize+"/"+self.populationSize, xOff, yOff + (50*scale * scaleSprite));//Population
		fontSize = Math.ceil(25 * scale * scaleSprite);
		ctx.font = "italic "+fontSize+"px Arial";
		ctx.fillText("Fear: "+Math.floor(100*self.fear)+"%", xOff, yOff + (-45*scale * scaleSprite));//Fear
	}
	fontSize = Math.ceil(50 * scale * scaleSprite);
	ctx.font = "bold italic "+fontSize+"px Arial";
	ctx.fillStyle = 'rgba(255,255,255,0.3)'
	ctx.fillText(JSON.stringify(_.values(self.hexCoord)),xOff, yOff + (150 * scale * scaleSprite));
}
//  ███╗   ██╗███████╗ ██████╗██████╗  ██████╗ ███╗   ███╗ █████╗ ███╗   ██╗ ██████╗███████╗██████╗ 
//  ████╗  ██║██╔════╝██╔════╝██╔══██╗██╔═══██╗████╗ ████║██╔══██╗████╗  ██║██╔════╝██╔════╝██╔══██╗
//  ██╔██╗ ██║█████╗  ██║     ██████╔╝██║   ██║██╔████╔██║███████║██╔██╗ ██║██║     █████╗  ██████╔╝
//  ██║╚██╗██║██╔══╝  ██║     ██╔══██╗██║   ██║██║╚██╔╝██║██╔══██║██║╚██╗██║██║     ██╔══╝  ██╔══██╗
//  ██║ ╚████║███████╗╚██████╗██║  ██║╚██████╔╝██║ ╚═╝ ██║██║  ██║██║ ╚████║╚██████╗███████╗██║  ██║
//  ╚═╝  ╚═══╝╚══════╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝╚══════╝╚═╝  ╚═╝
// 
var Necromancer = function(state){
	var self = this;
	self.stealth = 0.50;
	self.hexCoord = state.coord;
	self.color = function(){
		var k = Math.round(Math.max(Math.min(self.stealth*200,255),0));
		return "rgb("+0+","+k+","+k+")";
	}
	self.actions = ['move','hide']
}
Necromancer.prototype.simulate = function(hexes){
	var self = this;
	if( self.willMoveTo && //has place to move to
		_.find(hexes,function(hex){return _.isEqual(hex.hexCoord, self.willMoveTo)})) //place exists
		self.hexCoord = self.willMoveTo;
	var hex = _.find(hexes,function(hex){return _.isEqual(hex.hexCoord,self.hexCoord)})
	if(hex.type == 'Village')
	{	//Assume terrorizing
		self.stealth = Math.max(0, self.stealth-0.40);
		hex.population.transfer(15, 'villager_content', 'villager_scared');
	}
	else
	{	//Assume hiding
		self.stealth =Math.min(1,self.stealth+0.40*hex.stealthRegainRate);
	}
}
Necromancer.prototype.render = function(ctx, coord, scale, offset){
	var self = this;

	var coordScale = 200 * scale; //Actual pixel width between each hex coord
	var loc = HexMath.hexCoordToScreenCoord(coord, coordScale, offset);
	var xOff = loc.x;
	var yOff = loc.y + 50 * scale;

	ctx.beginPath();
	ctx.moveTo(xOff,yOff);
	ctx.lineTo(xOff-30*scale, yOff+50*scale);
	ctx.lineTo(xOff+30*scale, yOff+50*scale);
	ctx.closePath();
	ctx.lineWidth = 2*scale;
	ctx.strokeStyle='cyan';
	ctx.fillStyle = self.color();
	ctx.fill();
	ctx.stroke();
}
//  ███████╗████████╗ █████╗ ████████╗███████╗    ███████╗ █████╗  ██████╗████████╗ ██████╗ ██████╗ ██╗   ██╗
//  ██╔════╝╚══██╔══╝██╔══██╗╚══██╔══╝██╔════╝    ██╔════╝██╔══██╗██╔════╝╚══██╔══╝██╔═══██╗██╔══██╗╚██╗ ██╔╝
//  ███████╗   ██║   ███████║   ██║   █████╗      █████╗  ███████║██║        ██║   ██║   ██║██████╔╝ ╚████╔╝ 
//  ╚════██║   ██║   ██╔══██║   ██║   ██╔══╝      ██╔══╝  ██╔══██║██║        ██║   ██║   ██║██╔══██╗  ╚██╔╝  
//  ███████║   ██║   ██║  ██║   ██║   ███████╗    ██║     ██║  ██║╚██████╗   ██║   ╚██████╔╝██║  ██║   ██║   
//  ╚══════╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   ╚══════╝    ╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝    ╚═════╝ ╚═╝  ╚═╝   ╚═╝   
//   
var StateFactory = function(params)
{
	var self = this;
	self.terrainTypes = [
		{type:'Village',
			color:function(){
				//Fear map
				var b = 0;
				var r = Math.min(Math.max(0,Math.floor(200 * this.fear)),255);
				var g = Math.min(Math.max(0,200 - r),255);

				return "rgb("+r+","+g+","+b+")";
			},
			name:LangUtils.createRandomPolishSoundingPlaceName,
			named: true,
			stealthRegainRate: -0.30,
			actions: ['shop','infiltrate','terrorize','besiege']
		},
		{type:'Moor',
			color:function(){return "#605030"},
			name:function(){return ""},
			stealthRegainRate: -0.1,
			actions: []
		},
		{type:'Forest',
			color:function(){return "#105020"},
			name:function(){return ""},
			stealthRegainRate: 0.3,
			actions: []
		},
		{type:'Mountain',
			color:function(){return "#405080"},
			name:function(){return ""},
			stealthRegainRate: 0.1,
			actions: []
		}
	]
}
StateFactory.prototype.randomPopulation = function(hex_type){
	var population = new hexPopulation();
	var pop = Math.floor(Math.random() * 200)
	if(hex_type == 'Village') population.villager_content.count = pop;
	if(hex_type == 'Village') population.villager_scared.count = pop - Math.floor(Math.random() * pop);
	return population;
}
StateFactory.prototype.randomHex = function(coord){
	var self = this;
	var result =  new GameHex({
		coord:coord, 
		type: self.terrainTypes[Math.floor(Math.random() * self.terrainTypes.length)],
	})
	result.population = self.randomPopulation(result.type)
	return result;
}

var hexPopulation = function(state){
	return {
		villager_content : {props: {good: true}, count : 0, actors : []},
		villager_scared : {props: {good: true, scared:true}, count : 0, actors : []},
		villager_slave : {props: {good: true, scared:true}, count : 0, actors : []},
		villager_militia : {props: {good: true}, count : 0, actors : []},
		villager_hero : {props: {good: true}, count : 0, actors : []},
		villager_cultist : {props: {good: false}, count : 0, actors : []},
		corpse_recent : {count: 0},
		corpse_old : {count: 0},
		corpse_ancient : {count: 0},
		monster_zombie : {props: {good: false}, count : 0, actors : []},
		monster_skeleton : {props: {good: false}, count : 0, actors : []},
		monster_wight : {props: {good: false}, count : 0, actors : []},
		transfer : function(num, src, dest){
			if(num > this[src].count) num = this[src].count;
			if(!num) return;
			this[src].count -= num;
			this[dest].count += num;
		}
	}
}
//   ██████╗  █████╗ ███╗   ███╗███████╗    ██╗   ██╗██╗███████╗██╗    ██╗
//  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██║   ██║██║██╔════╝██║    ██║
//  ██║  ███╗███████║██╔████╔██║█████╗      ██║   ██║██║█████╗  ██║ █╗ ██║
//  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
//  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗     ╚████╔╝ ██║███████╗╚███╔███╔╝
//   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝      ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝ 
//  
var GameView = function(canvas, game){
	var self = this;
	//Target
	self.game = game;
	//Viewport
	self.canvas = canvas;
	self.ctx = self.canvas.getContext("2d");
	self.viewPortZoom = 1.0;
	self.viewPortOffset = {x:0,y:0};
	//Implements zooming viewport on game
	self.canvas.addEventListener('mousewheel', function(e){
		e.preventDefault();
		//Figure zoomfactor
		var origZoom = self.viewPortZoom;
		self.viewPortZoom += (e.wheelDeltaY?(e.wheelDeltaY<0?-1:1):undefined)/10
		if(self.viewPortZoom < 0.31) self.viewPortZoom = 0.3;
		if(self.viewPortZoom > 1.49) self.viewPortZoom = 1.5;
		if(!self.viewPortZoom) self.viewPortZoom = 0.4;
		//Figure zoom offset to stay centered
		var c_w = canvas.scrollWidth;
		var c_h = canvas.scrollHeight;
		self.viewPortOffset.x -= (c_w * self.viewPortZoom - c_w * origZoom)/2;
		self.viewPortOffset.y -= (c_h * self.viewPortZoom - c_h * origZoom)/2;
		self.render();
	}, false);
	//Implements dragging viewport over game
	self.clickDown = undefined;
	self.gameDragListener = null;
	var onGamePan = function(e){
		var dragDown = {x:e.x, y:e.y};
		self.viewPortOffset.x -= self.clickDown.x - dragDown.x;
		self.viewPortOffset.y -= self.clickDown.y - dragDown.y;
		self.clickDown = dragDown;
		self.render();
	}
	self.canvas.addEventListener('mousedown', function(e){
		self.clickDown = {x:e.x, y: e.y};
		self.gameDragListener = onGamePan;
		self.canvas.addEventListener('mousemove',self.gameDragListener, false);
	}, false);
	self.canvas.addEventListener('mouseup', function(e){
		self.canvas.removeEventListener('mousemove',self.gameDragListener, false);
		self.gameDragListener = null;
		self.clickDown = undefined;
	}, false);
	//Implements right-clicking a game object
	self.canvas.addEventListener('mouseup', function(e){
		if(e.which == 3)//right click
		{
			e.preventDefault();
			self.clickUp = {x: e.x, y: e.y};
			var hexcoord = HexMath.screenCoordToHexCoord(self.clickUp,self.viewPortZoom,self.viewPortOffset)
			console.log('actions at '+JSON.stringify(_.values(hexcoord))+':',self.game.getPlayerActionsForHex(hexcoord));
			return false;
		}
	}, false)

	//Initial render
	self.render();
}
GameView.prototype.render = function(){
	var self = this;

	//Clear
	self.ctx.clearRect(0, 0, canvas.width, canvas.height);
	//Tell game to render
	game.render(self.ctx, self.viewPortZoom, self.viewPortOffset);
	//TODO: Tell UI to render
}
GameView.prototype.acceptUserInput = function(input){
	game.acceptUserInput(input);
	this.render();
}
//   ██████╗  █████╗ ███╗   ███╗███████╗
//  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝
//  ██║  ███╗███████║██╔████╔██║█████╗  
//  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  
//  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
//   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
//    
var Game = function(mapParams){
	var self = this;
	self.genner = new StateFactory();
	self.player = new Necromancer({coord:{x:1,y:1}});
	self.hexes = [];
	self.mapParams = _.defaults(mapParams?mapParams:{},{
		min : {x: 0, y:0},
		max : {x: 7, y:4},
		rad : 200
	});
	for(var j = self.mapParams.min.x; j < self.mapParams.max.x; j ++)
	{
		for(var i = self.mapParams.min.y - Math.floor(j/2); i < self.mapParams.max.y- Math.round(j/2); i++)
		{
			self.hexes.push(self.genner.randomHex({x:j , y: i}))
		}
	}
}
Game.prototype.simulate = function(){
	var self = this;
	//Simulate game elements
	self.player.simulate(self.hexes);
	_.each(self.hexes,function(hex){hex.simulate(self.hexes)});
}
Game.prototype.render = function(ctx, zoom, offset){	
	var self = this;
	//Render game elements
	_.each(self.hexes,function(hex){hex.render(ctx, hex.hexCoord, zoom, offset)})
	self.player.render(ctx, self.player.hexCoord, zoom, offset);
}
Game.prototype.acceptUserInput = function(action){
	var self = this;
	//Input: Valid ways for player to move on the hex map relative to a coord
	var	neighbors = [
		   {x:-1,  y:0},{x:0,y:-1},{x:1, y:-1},
		   				{x:0, y:0},
		   {x:-1,  y:1},{x:0, y:1},{x:1, y:0}
		]
	var dir = action.playerAvatarDirection;
	var target = {x:self.player.hexCoord.x + neighbors[dir].x, y:self.player.hexCoord.y + neighbors[dir].y};
	if(_.find(self.hexes,function(hex){return _.isEqual(hex.hexCoord, target)})) self.player.willMoveTo = target;
	//TODO: New turn on every user input for now: eventually will be based on 'Next Turn' button
	self.simulate();
}
Game.prototype.getPlayerActionsForHex = function(hexCoord){
	var self = this;
	var actions = [];
	if(_.isEqual(hexCoord,self.player.hexCoord))
	{
		//Player actions
		actions = _.union(actions,self.player.actions);
		//Location actions
		var loc = _.find(self.hexes, function(hex){return _.isEqual(hex.hexCoord, hexCoord)});
		if(loc) actions = _.union(actions,loc.actions);
	}
	return actions;
}
//  ██╗   ██╗████████╗██╗██╗     ███████╗
//  ██║   ██║╚══██╔══╝██║██║     ██╔════╝
//  ██║   ██║   ██║   ██║██║     ███████╗
//  ██║   ██║   ██║   ██║██║     ╚════██║
//  ╚██████╔╝   ██║   ██║███████╗███████║
//   ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝
// 
var LangUtils = {
	POL_params : {
		adjChance : 0.1,
		pre : ["Staro","War","Kru","Chełn","Lewo","Prawo","Przy","Zielona","Ogro"],
		root : ["gród","wieś","ton","wnica","góra","szcz","mek","ki","szawa","mek"],
		adj : ["Nowy","Stara","Dolny","Górny","Wielke"],
		assemble : function(adj,prefix,root){return adj+prefix+root}
	},
	//Creates a random placename, assuming you can combinatorially combine 2-3 lists of morphemes into 1-2 words
	createRandomPlaceName : function(params){
		var adjChance = params.adjChance;
		var rndAdjectives = Math.floor(Math.random()*params.adj.length);
		var rndPrefixes = Math.floor(Math.random()*params.pre.length);
		var rndRoots = Math.floor(Math.random()*params.root.length);

		var adj = Math.random()<params.adjChance?params.adj[rndAdjectives]+" ":"";
		var prefix = params.pre[rndPrefixes];
		var root = params.root[rndRoots];

		return params.assemble(adj,prefix,root);	
	},
	createRandomPolishSoundingPlaceName : function(){
		return LangUtils.createRandomPlaceName(LangUtils.POL_params);
	}
}
var HexMath = {
	screenCoordToHexCoord : function(point, scale, offset){
		var self = this;
		if(!point || !offset) return undefined;
		//TODO: this is not wholly correct, but rough. Each hex has a square selecting area
		var pX = point.x - offset.x;
		var pY = point.y - offset.y;
		var coordScale = 200 * scale;
		var horiz = 1.5 * coordScale;
		var height = Math.sqrt(3) * coordScale;
		//Get a rough guess
		var near_x = (pX)/horiz;
		var near_y = (pY)/height - Math.round(near_x)/2;
		var near = {x:near_x, y:near_y};
		var round = {x:Math.round(near_x), y:Math.round(near_y)}
		if(round.x==-0)round.x=0;
		if(round.y==-0)round.y=0;
		return round;
	},
	hexCoordToScreenCoord : function(coord, scale, offset){
		//scale is the scaled radius
		var horiz = 1.5 * scale;
		var height = Math.sqrt(3) * scale;
		return {x: coord.x * horiz + offset.x, y: coord.y * height + coord.x * height/2 + offset.y}
	}
}