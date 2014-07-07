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

TerrainHex.prototype.terrorize = function(){
	var self = this;

	var affected = Math.random() * 100;
	self.population.good.villager_content -= affected;
	self.population.good.villager_scared += affected / 2;
	self.population.good.villager_militia += affected / 4;
	self.population.evil.necro_cultist += affected / 8;
	self.population.resources.corpse_recent += affected / 8;
}