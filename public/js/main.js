
function Main(sizeX,sizeY,element){				
	this.renderer = PIXI.autoDetectRenderer(sizeX?sizeX:800,sizeY?sizeY:600,document.getElementById(element?element:"canvas"));
}
Main.prototype.draw = function(){
	this.stage.children.sort(this.camera.depthCompare);
	this.game.draw(this.camera);
	this.camera.linkPan(this.stage);
	this.renderer.render(this.stage);
	requestAnimFrame(this.draw.bind(this));
}
Main.prototype.start = function(){
	this.camera = new CameraView();
	this.stage = new PIXI.Stage(0x6677AA);
	this.stage.interactive = true;
	this.game = new GameState();
	setInterval(this.game.simulate.bind(this.game),10);
	requestAnimFrame(this.draw.bind(this));
}
function GameState(){
	this.populace = new Populace(),
	this.terrain = new Terrain();
}

GameState.prototype.draw = function(camera){

	this.terrain.draw(camera);
	this.populace.draw(camera);
}
GameState.prototype.simulate = function(priorState, timeDelta){
	if(!timeDelta)timeDelta = 100;
	var self = this;
	self.populace.simulate(this,timeDelta);
}

function Populace(){
	var self = this;
	self.entities = new Array();
	for(var i = 0; i < 100; i++){
		var x = Math.floor(Math.random()*16);
		var y = Math.floor(Math.random()*12);
		self.entities.push(new Villager(x,y));
	}
}
Populace.prototype.draw = function(camera){
	var self = this;
	for(var i = 0; i < self.entities.length; i ++)
	{
		self.entities[i].draw(camera);
	}
}
Populace.prototype.simulate = function(priorState, delta){
	var self = this;
	for(var i = 0; i <self.entities.length; i++)
	{
		self.entities[i].simulate(priorState,delta);
	}
}

function Terrain(){
	var self = this;
	self.tiles = new Array();
	self.params = {
		tileX : 16,
		tileY : 12
	}
	for(var i = 0; i < self.params.tileY; i++)
	{
		for(var j = 0; j < self.params.tileX; j++)
		{
			self.tiles.push(new Tile(j,i));
		}
	}
}
Terrain.prototype.draw = function(camera){
	var self = this;
	for(var i = 0; i < self.tiles.length; i ++)
	{
		self.tiles[i].draw(camera);
	}
}

function Tile(x,y){
	var r = Math.floor(Math.random() * 4)
	var tex;
	switch(r)
	{
		case 0:
			type = 'grass';
			tex = 'img/bad_grass_hex.png'; break;
		case 1:
			type = 'dead_grass';
			tex = 'img/bad_dead_grass_hex.png'; break;
		case 2:
			type = 'lake_water';
			tex = 'img/bad_lake_water_hex.png'; break;
		case 3:
			type = 'wood_floor';
			tex = 'img/bad_wood_floor_hex.png'; break;
	}
	this.texture = PIXI.Texture.fromImage(tex);
	this.sprite = new PIXI.Sprite(this.texture);
	this.sprite.anchor.x = 0.5;
	this.sprite.anchor.y = 0.5;
	this.tileSize = 100;
	this.sprite.position.x = x * this.tileSize;
	this.sprite.position.y = (y - (x%2==0?0.5:0)) * this.tileSize;
	this.sprite.position.z = 0;
	//World position in pixels
	this.position = {
		x : x * this.tileSize,
		y : (y - (x%2==0?0.5:0)) * this.tileSize
	};
	//World position in tiles
	this.coord = {
		x : x,
		y : y
	};
	this.sprite.setInteractive(true);
	this.sprite.mouseup = this.onClick;
	main.stage.addChild(this.sprite);
}
Tile.prototype.draw = function(camera){
	this.sprite.position.x = (camera.pan.x + this.position.x) * camera.zoom + camera.viewSize.x/2;
	this.sprite.position.y = (camera.pan.y + this.position.y) * camera.zoom + camera.viewSize.y/2;
	this.sprite.scale.x = camera.zoom;
	this.sprite.scale.y = camera.zoom;
}
Tile.prototype.onClick = function(mouseData){
	var self = this;
}

function Villager(x,y){
	this.texture = PIXI.Texture.fromImage("/img/denizen.png");
	this.sprite = new PIXI.Sprite(this.texture);
	this.sprite.anchor.x = 0.5;
	this.sprite.anchor.y = 0.5;
	this.tileSize = 100;
	this.sprite.position.x = x * this.tileSize;
	this.sprite.position.y = (y - (x%2==0?0.5:0)) * this.tileSize;
	this.sprite.position.z = 1;
	//World position in pixels
	this.position = {
		x : x * this.tileSize,
		y : (y - (x%2==0?0.5:0)) * this.tileSize
	};
	//World position in tiles
	this.coord = {
		x : x,
		y : y
	};
	this.sprite.setInteractive(true);
	this.sprite.mouseup = function(mouseData){
		var self = this;
		main.camera.selected = self;
		console.log("I WAS CLICKED",self);
	}.bind(this)
	main.stage.addChild(this.sprite);
}
Villager.prototype.draw = function(camera){
	this.sprite.position.x = (camera.pan.x + this.position.x) * camera.zoom + camera.viewSize.x/2;
	this.sprite.position.y = (camera.pan.y + this.position.y) * camera.zoom + camera.viewSize.y/2;
	this.sprite.scale.x = camera.zoom;
	this.sprite.scale.y = camera.zoom;
}
Villager.prototype.onClick = function(mouseData){
	var self = this;
	main.camera.selected = self;
	console.log("I WAS CLICKED",self);
}
Villager.prototype.actionOn = function(x,y){
	var self = this;
	self.goal = {verb:'move',x:x, y:y, speed: 100}
}
Villager.prototype.simulate = function(priorState, delta){
	var self = this;
	if(!self.goal)
	{
		return;
	}
	var c_x = self.position.x;
	var c_y = self.position.y;
	var d_x = self.goal.x;
	var d_y = self.goal.y;
	var distance = Math.sqrt(Math.pow(d_x - c_x,2) + Math.pow(d_y - c_y,2));
	var n_x = (d_x-c_x)/distance;
	var n_y = (d_y-c_y)/distance;
	var dX = n_x * delta/1000 * self.goal.speed
	var dY = n_y * delta/1000 * self.goal.speed
	self.position.x += dX
	self.position.y += dY
	if(Math.abs(dX) > distance || Math.abs(dY > distance)) self.goal = undefined;
}

var CameraView = function(){
	this.selected = undefined;
	this.viewSize = {
		x : 800,
		y : 600
	}
	this.pan = {
		x : 0,
		y : 0,
		minPanX : undefined,
		minPanY : undefined,
		maxPanX : undefined,
		maxPanY : undefined
	}
	this.isPanning = false;
	this.zoom = 1.0
	this.maxZoom = 3.0
	this.minZoom = 0.1
	this.onDown = {
		x:undefined,
		y:undefined
	}
	var self = this;
	//Implements zooming viewport on game for now
	document.getElementById("canvas").addEventListener('mousewheel', function(e){
		e.preventDefault();
		//Figure zoomfactor
		var diff = 0.1
		var dir= (e.wheelDeltaY?(e.wheelDeltaY<0?-diff:diff):undefined)
		self.doZoom(1 + dir);
	}, false);

}
CameraView.prototype.doPan = function(dX,dY){
	this.pan.x += dX / this.zoom;
	this.pan.y += dY / this.zoom;
}
CameraView.prototype.doZoom = function(dZ){
	this.zoom *= dZ;
}
CameraView.prototype.screenToWorld = function(x,y){
	var self = this;
	var t_x = (x - self.viewSize.x/2) / self.zoom - self.pan.x
	var t_y = (y - self.viewSize.y/2) / self.zoom - self.pan.y
	return {x:t_x, y:t_y}
}
CameraView.prototype.worldtoScreen = function(x,y){
	var self = this;
	t_x = (self.pan.x + x) * self.zoom + self.viewSize.x/2;
	t_y = (self.pan.y + y) * self.zoom + self.viewSize.y/2;
	return {x:t_x, y:t_y}
}
CameraView.prototype.linkPan = function(stage){
	var self = this;
	stage.mousedown = function(mouseData){
		if(!self.selected){
			self.onDown.x = mouseData.global.x
			self.onDown.y = mouseData.global.y
			self.isPanning = true;
		}
		else{
			var worldCoord = self.screenToWorld(mouseData.global.x, mouseData.global.y);
			self.selected.actionOn(worldCoord.x, worldCoord.y);
			self.selected = undefined;
		}
	}
	stage.mousemove = function(mouseData){
		if(self.isPanning)
		{
			self.doPan(mouseData.global.x - self.onDown.x, mouseData.global.y - self.onDown.y)
			self.onDown.x = mouseData.global.x
			self.onDown.y = mouseData.global.y
		}
	}
	stage.mouseup = function(mouseData){
		self.isPanning = false;
		self.onDown.x = undefined;
		self.onDown.y = undefined;
	}
	stage.mouseout = function(mouseData){
		stage.mouseup(mouseData);
	}
}
CameraView.prototype.depthCompare = function(a,b) {
	var self = this;
	if(a.position.z != b.position.z)
	{
		return CameraView.prototype.sign(a.position.z - b.position.z)
	}
	else
	{
		return CameraView.prototype.sign(a.position.y - b.position.y)
	}
}
CameraView.prototype.sign = function(x){
    if( +x === x ) { // check if a number was given
        return (x === 0) ? x : (x > 0) ? 1 : -1;
    }
    return NaN;
}