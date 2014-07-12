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
	self.populationSize = Math.ceil(Math.random()* 200);
	self.fear = Math.floor(Math.random()*100)
	self.siteName = LangUtils.createRandomPolishSoundingPlaceName();
	self.type = 'Village'
	self.terrainType = 'Moor'
	self.hexCoord = state.coord;
	self.color = function(){
		//Fear map
		var b = "00";
		var r = Math.floor(self.fear);
		var g = 100 - r;

		if(r < 0) r = "00";
		else if(r < 10) r = "0"+r;
		else if(r >= 100) r = "A0";
		
		if(g < 0) g = "00";
		else if(g < 10) g = "0"+g;
		else if(g >= 100) g = "A0";

		return "#"+r+g+b;
	}
}
//Draw self at specified coord on canvas at a certain zoom scale
GameHex.prototype.render = function(canvas, coord, scale, offset)
{
	var self = this;
	var coordScale = 200 * scale; //Actual pixel width between each hex coord
	var loc = HexMath.hexCoordToScreenCoord(coord, coordScale, offset);
	var xOff = loc.x;
	var yOff = loc.y;
	var ctx = canvas.getContext("2d");
	//Draw Hex
	var grd=ctx.createLinearGradient(xOff+coordScale/2, yOff-2*coordScale, xOff-coordScale/2, yOff+2*coordScale);
	grd.addColorStop(0, "white");
	grd.addColorStop(1, this.color());
	ctx.fillStyle=grd;
	ctx.beginPath();
	for(var i = 0; i < 6; i++)
	{
		var angle = 2 * Math.PI / 6 * i;
		x_i = coordScale * Math.cos(angle) + xOff;
		y_i = coordScale * Math.sin(angle) + yOff;
		if(i == 0)
			ctx.moveTo(x_i, y_i);
		else
		{
			ctx.lineTo(x_i, y_i);
		}
	}
	ctx.closePath();
	ctx.lineWidth = 5 * scale;
	ctx.strokeStyle = 'gray';
	ctx.fill();
	ctx.stroke();
	//Draw text on hex
	ctx.fillStyle='black'
	ctx.textAlign = "center";
	fontSize = Math.ceil(30 * scale);
	ctx.font = "bold "+fontSize+"px Arial";
	ctx.fillText(self.siteName,xOff,yOff); //Site name
	fontSize = Math.ceil(20 * scale);
	ctx.font = ""+fontSize+"px Arial";
	ctx.fillText("("+self.type+")", xOff, yOff+(20*scale)); //(Site type)
	fontSize = Math.ceil(25 * scale);
	ctx.font = "italic "+fontSize+"px Arial";
	ctx.fillText("Pop: "+self.populationSize, xOff, yOff + (50*scale));//Population
	fontSize = Math.ceil(25 * scale);
	ctx.font = "italic "+fontSize+"px Arial";
	ctx.fillText("Fear: "+Math.floor(self.fear)+"%", xOff, yOff + (-45*scale));//Fear
}

var Necromancer = function(state){
	var self = this;

	self.hexCoord = state.coord;
}
Necromancer.prototype.render = function(canvas, coord, scale, offset){
	var self = this;

	var coordScale = 200 * scale; //Actual pixel width between each hex coord
	var loc = HexMath.hexCoordToScreenCoord(coord, coordScale, offset);
	var xOff = loc.x;
	var yOff = loc.y + 50 * scale;

	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.moveTo(xOff,yOff);
	ctx.lineTo(xOff-30*scale, yOff+50*scale);
	ctx.lineTo(xOff+30*scale, yOff+50*scale);
	ctx.closePath();
	ctx.lineWidth = 2*scale;
	ctx.strokeStyle='cyan';
	ctx.fillStyle = 'black';
	ctx.fill();
	ctx.stroke();
}

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
		var pX = point.x;
		var pY = point.y;
		var horiz = 1.5 * scale;
		var height = Math.sqrt(3) * scale;
		var x = (pX-offset.x)/horiz;
		var y = (pY-offset.y - x/(height/2))/height
		return {x : Math.round(x), y: Math.round(y)}
	},
	hexCoordToScreenCoord : function(coord, scale, offset){
		//scale is the scaled radius
		var offset_X = offset.x;
		var offset_Y = offset.y;
		var horiz = 1.5 * scale;
		var height = Math.sqrt(3) * scale;
		return {x: coord.x * horiz + offset_X, y: coord.y * height + coord.x * height/2 + offset_Y}
	}
}
var TerrainHex = function(state){
	var self = this;

	self.population = {
		good : {
			villager_content : 500,
			villager_scared : 0,
			villager_militia : 0,
			villager_hero : 0
		},
		evil : {
			necro_slave : 0,
			necro_cultist : 0,
			necro_minion : 0,
			necro_zombie : 0,
			necro_skeleton: 0,
			necro_wight : 0
		},
		resources : {
			corpse_recent: 1,
			corpse_old : 3,
			corpse_ancient: 40,
			corpse_husk : 0,
		}
	}
	self.sites = {
		village : true,
		graveyard : false,
		battlefield : false,
		cave : true,
		forest : true,

	}
}

var drawTiles = function(size, hexX, hexY){
	console.log("x");
	//Canvas
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	ctx.fillStyle = "#0099FF"
	//Voronoi
	var offset_X = 30;
	var offset_Y = 30;
	var viewX = hexX * 1.5 * size + offset_X - size/2;
	var viewY = hexY * Math.sqrt(3) * size + offset_Y;
	var sites = generateHexCenterGrid(size, hexX, hexY, offset_X, offset_Y);
	var bbox = {xl:0, xr:viewX, yt:0, yb:viewY};
	var voronoi = new Voronoi();
	var tiles = voronoi.compute(sites,bbox);
	//Draw
	for(var e in tiles.edges){
		var edge = tiles.edges[e];
		ctx.moveTo(edge.va.x, edge.va.y);
		ctx.lineTo(edge.vb.x, edge.vb.y);
		ctx.stroke();
	}
}
var generateHexCenterGrid = function(size, hex_extent_X, hex_extent_Y, offset_X, offset_Y){
	//Debug canvas
	var c = document.getElementById("canvas");
	var ctx = c.getContext("2d");
	ctx.fillStyle = "#0099FF"
	//End debug
	var height = Math.sqrt(3) * size;
	var horiz = 1.5 * size;
	var result = [];
	var TwoSixthsPi = 2 * Math.PI / 6;
	for(var j = 0; j < hex_extent_X; j++)
	{
		for(var i = 0; i < hex_extent_Y; i++)
		{
			var town = Math.random() < 0.10; //10% chance of a point being a town
			var even = j%2==0?true:false;
			var gen = {x: j * horiz + offset_X, y: i * height + (even?0:height/2) + offset_Y, isTown: town};
			result.push(gen);
			ctx.fillRect(gen.x-3.5, gen.y-3.5, 7, 7);
			if(town) //Towns morph into 7 sub-points: the center and 6 radial districts
			{
				ctx.fillStyle = "#FF00FF"
				//var disNum = Math.ceil(Math.random() * 6);
				var disNum = 6;
				var radOff = 0; //Math.random() * Math.PI;
				for(var v = 0; v < disNum; v++)
				{
					var rad = v * 2 * Math.PI / disNum + radOff;
					var district = {x: gen.x + size * Math.cos(rad) / 1.75, y: gen.y + size * Math.sin(rad) / 1.75};
					result.push(district);
					ctx.fillRect(district.x-1.5, district.y-1.5, 3, 3);
				}
				ctx.fillStyle = "#0099FF"
			}
		}
	}
	return result;
}