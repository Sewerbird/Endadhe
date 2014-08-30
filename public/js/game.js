
/*
	function generateInitialState(params)

	Within the constraints of the specified parameters, generate a random valid GameState to
	begin the game with.

	@params 	- JSON object specifying the following values:
	@return		- GameState object, or undefined if a legal state could not be generated
 */
 function generateInitialState(params){
 	/*
		class GameState

		The GameState is the sole location for holding game data in Endadhe: everything else is a function
		operating on the game state. Every frame of simulation, game objects generate events/state changes
		by looking at their *current* frame's state (read-only) and other objects' states *last* frame.
		The game accepts an array of such events from each object each frame, applies them to the appropriate
		elements in the game state, and generates the next frame of simulation.
 	*/
 	var state = {
 		entities : {},
 		tiles : [],
 		uid : generateUUID()
 	};
 	//Add villagers
 	_.times(1000, function(){
 		state.entities[generateUUID()] = randomEntity({alignment:'good', entity_subclass:'Villager', entity_class:'Denizen'})
 	})
 	//Add houses
 	for(var i = 0; i < Math.ceil(worldExtent.x/tileSize); i ++)
 	{
 		for(var j = 0; j < Math.ceil(worldExtent.y/tileSize)+1; j ++)
 		{	
 			if(Math.random() < 0.05)
 			state.entities[generateUUID()] = newTile(
 				{x:i, y:j - (i%2==0?0.5:0),entity_subclass:'Structure',entity_class:'House', render_image: assets['house'], simulate:function(){}});
 		}
 	}

 	//Add tiles
 	for(var i = 0; i < Math.ceil(worldExtent.x/tileSize); i ++)
 	{
 		for(var j = 0; j < Math.ceil(worldExtent.y/tileSize)+1; j ++)
 		{
 			state.tiles.push(newTile({x:i, y:j - (i%2==0?0.5:0)}));
 		}
 	}
	console.log(state);
 	return state;
}
function randomEntity(params){
	return _.defaults(params,
		{
			position: {x:(Math.random()*0.6+0.2) * worldExtent.x, y:(Math.random()*0.6+0.2) * worldExtent.y},
			entity_class: 'Denizen',
			entity_subclass: 'Villager',
			render_image: assets['denizen'],
			render_z:0,
			render: function(ctx,locus){
				ctx.drawImage(
					this.render_image,
					locus.x-this.render_image.mW/2.0*locus.scale,
					locus.y-this.render_image.mH*locus.scale,
					this.render_image.mW*locus.scale,
					this.render_image.mH*locus.scale);
			},
			simulate: function(priorState, UT){
				var angle = Math.random() * 2 * Math.PI;
				this.position.x += Math.cos(angle)*4;
				this.position.y += Math.sin(angle)*4;
			}
		});
}
function newTile(params){
	return _.defaults(params,
		randomEntity(
			{
				position: {x:params.x * tileSize, y:params.y * tileSize},
				entity_class: 'Tile',
				entity_subclass: 'Moor',
				render_image: assets['bad_grass'],
				render_z:1,
				simulate: function(priorState, UT){}
			})
		);
}

 function simulateGameState(state, priorState, dt){
 	_.each(state.entities, function(entity){
 		entity.simulate(priorState, dt);
 	})
 }
 function renderGameState(state,ctx,viewZoom,viewOffset,viewExtent){
 	var wrz = function(entity){
 		//Perform transform from 0.0->1.0 normalized worldscape to camera-pixel space
 		var xOff = (entity.position.x + viewOffset.x)*viewZoom + viewExtent.x/2;
 		var yOff = (entity.position.y + viewOffset.y)*viewZoom + viewExtent.y/2;
 		var scale = viewZoom * assets.ppm;
 		entity.render(ctx,{x:xOff, y:yOff, scale:scale})
 	}
 	//TODO: Look into insertion sort, given that this sort is on generally-sorted entities (assuming entities to don't move far frame-to-frame)
 	state.entities = _.sortBy(state.entities,function(entity){return entity.position.y})//using 'further away is behind' metric
 	_.each(state.tiles, wrz);
 	_.each(state.entities, wrz);
 }


//   ██████╗  █████╗ ███╗   ███╗███████╗    ██╗   ██╗██╗███████╗██╗    ██╗
//  ██╔════╝ ██╔══██╗████╗ ████║██╔════╝    ██║   ██║██║██╔════╝██║    ██║
//  ██║  ███╗███████║██╔████╔██║█████╗      ██║   ██║██║█████╗  ██║ █╗ ██║
//  ██║   ██║██╔══██║██║╚██╔╝██║██╔══╝      ╚██╗ ██╔╝██║██╔══╝  ██║███╗██║
//  ╚██████╔╝██║  ██║██║ ╚═╝ ██║███████╗     ╚████╔╝ ██║███████╗╚███╔███╔╝
//   ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚══════╝      ╚═══╝  ╚═╝╚══════╝ ╚══╝╚══╝ 
//  
var CameraView = function(canvas, game){
	var self = this;
	//Target
	self.game = game;
	//Viewport
	self.canvas = canvas;
	self.ctx = self.canvas.getContext("2d");
	self.canvasExtent = {x:800, y:400}
	self.viewPortZoom = 1.0;
	self.viewPortOffset = {x:-400,y:-200};
	//Implements zooming viewport on game
	self.canvas.addEventListener('mousewheel', function(e){
		e.preventDefault();
		//Figure zoomfactor
		var origZoom = self.viewPortZoom;
		self.viewPortZoom += (e.wheelDeltaY?(e.wheelDeltaY<0?-1:1):undefined)/10
		//Bound the zoom
		if(self.viewPortZoom < 0.1) self.viewPortZoom = 0.1;
		if(self.viewPortZoom > 3.49) self.viewPortZoom = 3.5;
		if(!self.viewPortZoom) self.viewPortZoom = 0.4;
		self.render();
	}, false);
	//Implements dragging viewport over game
	self.clickDown = undefined;
	self.gameDragListener = null;
	var onGamePan = function(e){
		var dragDown = {x:e.x, y:e.y};
		self.viewPortOffset.x -= (self.clickDown.x - dragDown.x) / self.viewPortZoom;
		self.viewPortOffset.y -= (self.clickDown.y - dragDown.y) / self.viewPortZoom;
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

	//Initial render
	self.render();
}
CameraView.prototype.render = function(){
	var self = this;

	//Clear
	self.ctx.clearRect(0, 0, canvas.width, canvas.height);
	//Tell game to render
	renderGameState(self.game, self.ctx, self.viewPortZoom, self.viewPortOffset, self.canvasExtent);
	//Draw mid-screen reticule
	self.ctx.beginPath()
	self.ctx.strokeStyle = 'cyan';
	self.ctx.lineWidth = 2;
	self.ctx.lineTo(canvas.width/2 + 10, canvas.height/2);
	self.ctx.lineTo(canvas.width/2, canvas.height/2 +10);
	self.ctx.lineTo(canvas.width/2 -10, canvas.height/2);
	self.ctx.lineTo(canvas.width/2, canvas.height/2 - 10);
	self.ctx.lineTo(canvas.width/2 +10, canvas.height/2);
	self.ctx.closePath();
	self.ctx.stroke();
}

//   ██████╗ ██████╗ ███╗   ██╗███████╗██╗ ██████╗ 
//  ██╔════╝██╔═══██╗████╗  ██║██╔════╝██║██╔════╝ 
//  ██║     ██║   ██║██╔██╗ ██║█████╗  ██║██║  ███╗
//  ██║     ██║   ██║██║╚██╗██║██╔══╝  ██║██║   ██║
//  ╚██████╗╚██████╔╝██║ ╚████║██║     ██║╚██████╔╝
//   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝     ╚═╝ ╚═════╝ 
//  

var assets = {
	ppm : 15, //15 pixels per meter at 1x zoom in the camera view port
	'house' : loadAsset('img/house.png',65.5)(),
	'denizen' :  loadAsset('img/denizen.png',30)(), //The denizen.png (which happens to be 30 pixels tall) has 30 pixels per meter
	'bad_grass' : loadAsset('img/bad_grass_hex.png',24)()
}
var worldExtent = {x:800,y:400};
var tileSize = 60;

//  ██╗   ██╗████████╗██╗██╗     ███████╗
//  ██║   ██║╚══██╔══╝██║██║     ██╔════╝
//  ██║   ██║   ██║   ██║██║     ███████╗
//  ██║   ██║   ██║   ██║██║     ╚════██║
//  ╚██████╔╝   ██║   ██║███████╗███████║
//   ╚═════╝    ╚═╝   ╚═╝╚══════╝╚══════╝
// 

function loadAsset(source,pixelsPerMeterRatio){
	return function(){
	var img = new Image();
	img.src = source;
	img.onload = function(evt){
		this.pmScale = pixelsPerMeterRatio;
		this.mW = this.width/this.pmScale;
		this.mH = this.height/this.pmScale
		console.log(img.src,img.mW,img.mH,img.width,img.height);
	}
	return img}
}

function generateUUID(){
    var d = new Date().getTime();
    var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random()*16)%16 | 0;
        d = Math.floor(d/16);
        return (c=='x' ? r : (r&0x7|0x8)).toString(16);
    });
    return uuid;
};