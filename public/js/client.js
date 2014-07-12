//   ██████╗  █████╗ ███╗   ███╗███████╗    ██╗  ██╗███████╗██╗  ██╗
//  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██║  ██║██╔════╝╚██╗██╔╝
//  ██║  ███╗███████║██╔████╔██║█████╗      ███████║█████╗   ╚███╔╝ 
//  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ██╔══██║██╔══╝   ██╔██╗ 
//  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗    ██║  ██║███████╗██╔╝ ██╗
//   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝    ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝
//   
var GameHex = function(state){
	var self = this;
	self.population = {
		good: {
			villager_content: 0,
			villager_scared: 0,
			villager_militia: 0,
			villager_hero: 0
		},
		evil: {
			villager_slave: 0,
			villager_cultist: 0,
			villager_minion: 0,
			necro_zombie: 0,
			necro_skeleton: 0,
			necro_wight: 0
		},
		resources: {
			corpse_recent: 0,
			corpse_old: 0,
			corpse_husk: 0
		}
	}
	var terrainTypes = [
		{type:'Village',
			color:function(){
				//Fear map
				var b = 0;
				var r = Math.min(Math.max(0,Math.floor(200 * self.fear)),255);
				var g = Math.min(Math.max(0,200 - r),255);

				return "rgb("+r+","+g+","+b+")";
			},
			name:LangUtils.createRandomPolishSoundingPlaceName,
			stealthRegainRate: -0.30,
			populationSize: Math.floor(Math.random()*200)
		},
		{type:'Moor',
			color:function(){return "#605030"},
			name:function(){return ""},
			stealthRegainRate: -0.1,
			populationSize: Math.floor(Math.random()*200)
		},
		{type:'Forest',
			color:function(){return "#105020"},
			name:function(){return ""},
			stealthRegainRate: 0.3,
			populationSize: Math.floor(Math.random()*200)
		},
		{type:'Mountain',
			color:function(){return "#405080"},
			name:function(){return ""},
			stealthRegainRate: 0.1,
			populationSize: Math.floor(Math.random()*200)
		}
	]
	var assignType = terrainTypes[Math.floor(Math.random() * terrainTypes.length)];
	if(assignType.named) self.siteName = LangUtils.createRandomPolishSoundingPlaceName();
	self.color = assignType.color;
	self.fear = Math.random();
	self.siteName = assignType.name();
	self.type = assignType.type;
	self.hexCoord = state.coord;
	self.terrainType = assignType.onTerrain?assignType.onTerrain:assignType.type
	self.populationSize = assignType.populationSize;
	self.stealthRegainRate = assignType.stealthRegainRate;
}
GameHex.prototype.simulate = function(hexes){
	var self = this;

	self.fear *= 0.9;
}
//Draw self at specified coord on canvas at a certain zoom scale
GameHex.prototype.render = function(ctx, coord, scale, offset, scaleSprite)
{
	if(!scaleSprite) scaleSprite = 1;
	var self = this;
	var coordScale = 200 * scale; //Actual pixel width between each hex coord
	var loc = HexMath.hexCoordToScreenCoord(coord, coordScale, offset);
	var xOff = loc.x;
	var yOff = loc.y;
	//Draw Hex
	var grd=ctx.createLinearGradient(xOff+coordScale/2, yOff-2*coordScale, xOff-coordScale/2, yOff+2*coordScale);
	grd.addColorStop(0, "white");
	grd.addColorStop(1, this.color());
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
	ctx.fillText("("+self.terrainType+")", xOff, yOff+(20*scale * scaleSprite)); //(Site type)
	if(self.type == 'Village')
	{
		fontSize = Math.ceil(30 * scale * scaleSprite);
		ctx.font = "bold "+fontSize+"px Arial";
		ctx.fillText(self.siteName,xOff,yOff); //Site name
		fontSize = Math.ceil(25 * scale * scaleSprite);
		ctx.font = "italic "+fontSize+"px Arial";
		ctx.fillText("Pop: "+self.populationSize, xOff, yOff + (50*scale * scaleSprite));//Population
		fontSize = Math.ceil(25 * scale * scaleSprite);
		ctx.font = "italic "+fontSize+"px Arial";
		ctx.fillText("Fear: "+Math.floor(self.fear * 100)+"%", xOff, yOff + (-45*scale * scaleSprite));//Fear
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
		hex.fear += .15;
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
//   ██████╗  █████╗ ███╗   ███╗███████╗
//  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝
//  ██║  ███╗███████║██╔████╔██║█████╗  
//  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝  
//  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗
//   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝
//    
var Game = function(canvas, mapParams){
	var self = this;
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
			self.hexes.push(new GameHex({coord:{x:j , y: i}}))
			console.log('x');
		}
	}
	self.canvas = canvas;
	self.render()
}
Game.prototype.simulate = function(){
	var self = this;
	//Simulate game elements
	_.each(self.hexes,function(hex){hex.simulate(self.hexes)});
	self.player.simulate(self.hexes);
}
Game.prototype.render = function(){	
	var self = this;
	//Setup view context
	var ctx = self.canvas.getContext("2d");
	var zoom = 0.4;
	var offset = {x:40, y:40};
	ctx.clearRect(0, 0, canvas.width, canvas.height);
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
	var target = {x:game.player.hexCoord.x + neighbors[dir].x, y:game.player.hexCoord.y + neighbors[dir].y};
	if(_.find(game.hexes,function(hex){return _.isEqual(hex.hexCoord, target)})) game.player.willMoveTo = target;
	//TODO: New turn on every user input for now: eventually will be based on 'Next Turn' button
	self.simulate();	
	self.render();
}
//  ██╗   ██╗████████╗██╗██╗     ███████╗
//  ██║   ██║╚══██╔══╝██║██║     ██╔════╝
//  ██║   ██║   ██║   ██║██║     ███████╗
//  ██║   ██║   ██║   ██║██║     ╚════██║
//  ╚██████╔╝   ██║   ██║███████╗███████║
//   ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝
// 
var LangUtils = {
	createRandomPolishSoundingPlaceName : function(){
		var adjectives = ["Nowy","Stara","Dolny","Górny","Wielke"];
		var prefixes = ["Staro","War","Kru","Chełn","Lewo","Prawo","Przy","Zielona","Ogro"];
		var roots = ["gród","wieś","ton","wnica","góra","szcz","mek","ki","szawa","mek"];

		var adjChance = 0.1
		var rndAdjectives = Math.floor(Math.random()*adjectives.length);
		var rndPrefixes = Math.floor(Math.random()*prefixes.length);
		var rndRoots = Math.floor(Math.random()*roots.length);

		var adj = Math.random()<adjChance?adjectives[rndAdjectives]+" ":"";
		var prefix = prefixes[rndPrefixes];
		var root = roots[rndRoots];

		return adj+prefix+root;	
	}
}
var HexMath = {
	screenCoordToHexCoord : function(point, scale, offset){
		var self = this;
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