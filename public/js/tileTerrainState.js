var tileTerrainState = function(worldExtent, tileFactoryFunction){
	this.worldExtent = worldExtent
	this.coordExtent = {x: Math.ceil(worldExtent.x / tileSize), y: Math.ceil(worldExtent.y / tileSize)}
	this.tiles = new Array();
	this.generate(tileFactoryFunction);
}

tileTerrainState.prototype.generate = function(tileFactoryFunction){
	var self = this;
	for(var i = 0; i < self.coordExtent.y; i++)
	{
		for(var j = 0; j < self.coordExtent.x; j++)
		{
			self.tiles.push(tileFactoryFunction(j,i));
		}
	}
}

tileTerrainState.prototype.queryTile = function(x,y){
	var self = this;
	return _.find(self.tiles,function(tile){return tile.coords.x == x && tile.coords.y == y})
}

var Tile = 	function(params){
	return _.defaults(params,
		{
			position: {x: params.x * tileSize, y: (params.y - (params.x%2==0?0.5:0)) * tileSize},
			coords: {x: params.x, y: params.y},
			entity_class: params.entity_class,
			entity_subclass: params.entity_subclass,
			render_image: params.render_image,
			render_z:1,
			tileSize:60,
			simulate: function(priorState, UT){},
			render: function(ctx,locus){
				var x = locus.x-this.render_image.mW/2.0*locus.scale
				var y = locus.y-this.render_image.mH/2.0*locus.scale
				ctx.save();
				ctx.drawImage(
					this.render_image,
					x,
					y,
					this.render_image.mW*locus.scale,
					this.render_image.mH*locus.scale);
			}
		}
	);
}

function trulyRandomTileFactory(x,y){
	var randomType = Tile_Types[_.sample(_.keys(Tile_Types))]
	return new Tile({x:x, y:y, render_image: assets[randomType.image], entity_class: randomType.class, entity_subclass: randomType.subclass});
}

function placeOnNearestTile(object,x,y){
	var tileSize = 60;//TODO
	var c_x = Math.floor(x / tileSize)
	var c_y = Math.floor(y / tileSize)
	object.position = {x: c_x * tileSize, y: (c_y - (c_x%2==0?0.5:0)) * tileSize}
	return object;
}