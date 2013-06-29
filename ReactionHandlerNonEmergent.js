
/*
The structure of the emergent and non-emergent reactions is slightly different.  In the emergent reactions, a reaction is a single pair of reacting 
species.  The possible reacting pairs go in the collide handler's list for that pair.
The non-emergent reaction handler's reaction escompasses all the collision pairs that could be involved in a 2->2, 1->2, 1->1 reaction.  There are potentially many
reacting pairs for a reaction.
The non-emergent reaction will add its pairs, not itself, to the collide handler's reaction list.  
*/

function ReactionHandlerNonEmergent(collide, dotManager, rxns, tConst, activeRxns, pausedRxns) {
	this.collide = collide;
	this.dotManager = dotManager;
	this.tConst = tConst
	this.rxns = rxns;
	this.spcs = undefined; //set in collide's setSpcs func
	this.activeRxns = activeRxns;
	this.pausedRxns = pausedRxns;
}

_.extend(ReactionHandlerNonEmergent.prototype, ReactionFuncs, {
	addReaction: function(attrs) {
		attrs.parent = this;
		var rxn = new ReactionHandlerNonEmergent.Reaction(attrs, this.rxns);
		rxn.init();
	},
	
})


ReactionHandlerNonEmergent.Reaction = function(attrs, allRxns) {
	/*
	to specify non-emergent reaction, you need...
	rcts: [{spcName: 'name', count: #},]
	prods: [{spcName: 'name', count: #},]
	both must be <=2
	preExpForward: val, L^n/(mol^m sec)
	activeEForward: val, j/(mol K)
	*/
	this.parent = attrs.parent;
	this.collide = this.parent.collide;
	this.handle = attrs.handle;
	this.enqueueListenerHandle = this.handle + 'Enqueue';
	this.checkRxnSideCount(attrs.rcts);
	this.checkRxnSideCount(attrs.prods);
	this.allRxns = allRxns;
	this.rctsNet = this.reformatSide(attrs.rcts, LevelData.spcDefs);
	this.prodsNet = this.reformatSide(attrs.prods, LevelData.spcDefs);
	this.sRxn298 = this.calcSRxn298(this.rctsNet, this.prodsNet);
	this.preExpForward = attrs.preExpForward;
	this.activeEForward = attrs.activeEForward;
	this.wallGroups = this.makeWallGroups(window.walls, [], this.rctsNet, this.prodsNet);
	this.updateQueue = this.wrapUpdateQueue();
	this.listenerHandle = this.handle + 'CheckQueueEmpty';
	//this.checkWallGroupListenerHandle = this.handle + 'CheckWallGroups';

}

ReactionHandlerNonEmergent.Reaction.prototype = {
	init: function() {
		var walls = window.walls;
		var rcts = this.rctsNet;
		var prods = this.prodsNet;
		
		addListener(curLevel, 'data', this.listenerHandle, function() {
			this.wallGroups = this.makeWallGroups(walls, this.wallGroups, rcts, prods);
			this.wallGroupsMap = {};
			for (var i=0; i<this.wallGroups.length; i++) {
				this.wallGroupsMap[this.wallGroups[i].wallHandle] = this.wallGroups[i];
			}
			for (var i=0; i<this.wallGroups.length; i++) {
				this.updateQueue(this.wallGroups[i]);
			}
		}, this);
		this.addCollisionPairs(this.collide, this.rctsNet, this.prodsNet, this.allRxns, window.dotManager, window.spcs); 
		
	},
	addCollisionPairs: function(collide, rctsNet, prodsNet, allRxns, dotMgr, spcs) {
		var numRcts = this.countRxnSide(rctsNet);
		var numProds = this.countRxnSide(prodsNet);
		if (numRcts == 2 && numProds == 2) {
			this.pushRxn(allRxns, new ReactionHandlerNonEmergent.ReactivePair(this, this.copyRxnSide(rctsNet), this.copyRxnSide(prodsNet), 'chanceForward', 'rctQueue');
			this.pushRxn(allRxns, new ReactionHandlerNonEmergent.ReactivePair(this, this.copyRxnSide(prodsNet), this.copyRxnSide(rctsNet), 'chanceBackward', 'prodQueue');
		} else if (numRcts == 1 && numProds == 1) {
			
		} else if (numRcts == 1 && numProds == 2) {
		
		} else if (numRcts == 2 && numProds == 1) {
			
		}
	},
	readyRxn: function(allRxns, idStr) {
		var pairs = allRxns[idStr];
		if (this.rxnTypesSame(pairs) && pairs[0].constructor == ) {
			if (pairs.length == 1)
		}
	},
	copyRxnSide: function(rxnSide) {
		var copy = [];
		for (var i=0; i<rxnSide.length; i++) {
			copy.push(rxnSide[i].copy());
		}
		return copy;
	},
	initSingleRxnPair: function(allRxns, reactivePair, collide) {
		var rctNames = this.flattenSpcNames(reactivePair.rcts);
		var idStr = collide.getIdStr(spcs[rctNames[0]], spcs[rctNames[1]]);
		var parent = this.parent;
		allRxns[idStr] = [reactivePair];
		collide.setHandler(rctNames[0], rctNames[1], new Listener(function(a, b, UVAB, perpAB, perpBA) {
			var wallGroup = this.wallGroups[a.tag];
			var queue = wallGroup[reactivePair.queueName];
			if (Math.random() < wallGroup[reactivePair.chanceName]) {
				if (queue.now > 0) {
					if (!parent.react(a, b, reactionPair.prods)) { //prods is list of ReactionComponents
						return collide.impactStd(a, b, UVAB, perpAB, perpBA);
					}
				}
				
				queue.now--;
				
			} else {
				return collide.impactStd(a, b, UVAB, perpAB, perpBA);
			}
		}, this));
	},
	initMultRxnPairs: function(allRxns, reactivePair, collide) {
		
	},
	wrapUpdateQueue: function() {
		var self = this;
		var preExpForward = this.preExpForward;
		var activeEForward = this.activeEForward;
		var sRxn298 = this.sRxn298;
		var rcts = this.rctsNet;
		var prods = this.prodsNet;
		var hRxn298 = this.calcHRxn298(this.rctsNet, this.prodsNet);
		var kEq298 = Math.exp(-(hRxn298 - 298.15 * sRxn298) / (8.314 * 298.15)); 
		return function(wallGroup) {
			var rctQueue = wallGroup.rctQueue;
			var prodQueue = wallGroup.prodQueue;
			//going to let this go below zero.  When it gets to zero, they won't react, but ones that roll right will decrement the counter
			var rctsInit = rctQueue.init;
			var rctsLeft = rctQueue.now;
			var prodsInit = prodQueue.init;
			var prodsLeft = prodQueue.now;
			wallGroup.chanceForward = self.moveAlongSigmoid(wallGroup.chanceForward, rctsLeft / rctsInit);//or some constant, find a good one
			wallGroup.chanceBackward = self.moveAlongSigmoid(wallGroup.chanceBackward, prodsLeft / prodsInit);

			if 
				(
					(1 - chanceReactForward < .99 && rctsLeft > 0 && rctsLeft / rctsInit > .1) || 
					(1 - chanceReactBackward < .99 && prodsLeft > 0 && prodsLeft / prodsInit > .1)
				) 
			{
				wallGroup.rateScalar = self.moveAlongSigmoid(wallGroup.rateScalar, -.3);
			} else if (wallGroup.rateScalar < .7) {
				wallGroup.rateScalar = self.moveAlongSigmoid(wallGroup.rateScalar, .3);
			}
			
			var temp = wallGroup.temp[wallGroup.temp.length - 1];
			var kEq = kEq298 * Math.exp(-hRxn298 / 8.314 * (1 / temp - 1 / 298.15));
			var rateConstForward = wallGroup.rateScalar * preExpForward * Math.exp(-activeEForward / (8.314 * temp));
			var rateConstBackward = rateConstForward / kEq;
			var numForward = Math.max(0, Math.round(self.getNumInDir(rateConstForward, self.rcts, wallGroup.moles, wallGroup.vol[wallGroup.vol.length - 1])) + Math.random() - .5);
			var numBackward = Math.max(0, Math.round(self.getNumInDir(rateConstBackward, self.prods, wallGroup.moles, wallGroup.vol[wallGroup.vol.length - 1])), + Math.random() - .5);
			
			rctQueue.init  = numForward;
			rctQueue.now   = numForward; 
			prodQueue.init = numBackward;
			prodQueue.now  = numBackward;
		}
	},
	moveAlongSigmoid: function(yo, dx) {
		var y = 1 / (1 + (1 / yo) * Math.exp(-dx)); //solve for y val corresponding to yo, xNew = xo + dx
		return 	y == 1 ? .999 :
				y == 0 ? .001 :
				y;
	},
	getNumInDir: function(rateConst, rxnSide, moleCounts, vol) {
		var num = N * rateConst;
		for (var i=0; i<rxnSide.length; i++) {
			num *= moleCounts[rxnSide[i].spcName] / vol;
			if (rxnSide[i].count == 2) num *= moleCounts[rxnSide[i].spcName] / vol;
		}
		return num;
	},
	checkRxnSideCount: function(rxnSide) {
		if (this.countRxnSide(rxnSide) > 2 || this.countRxnSide(rxnSide) <= 0) {
			console.log('Bad number of products or reactions for non-emergent reaction');
			console.log('Reaction will not work');
			console.log(rxnSide);
		}		
	},
	calcHRxn298: function(rcts, prods) {
		var hRxn = 0;
		for (var i=0; i<prods.length; i++) hRxn += prods[i].def.hF298;
		for (var i=0; i<rcts.length; i++) hRxn -= rcts[i].def.hF298;
		return hRxn * 1000; //to Joules from kJ
	},
	makeWallGroups: function(walls, wallGroups, rcts, prods) {
		var updatedGroups = [];
		for (var i=0; i<walls.length; i++) {
			var wall = walls[i];
			if (wall.data.temp) {
				var existingGroup = this.getWallGroup(wallGroups, wall.handle);
				if (existingGroup) {
					updatedGroups.push(existingGroup);
				} else {
					updatedGroups.push(new ReactionHandlerNonEmergent.WallGroup(wall, wall.handle, rcts, prods));
				}
			}
		}
		return updatedGroups;
	},
	getWallGroup: function(wallGroups, wallHandle) {
		for (var i=0; i<wallGroups.length; i++) if (wallGroups[i].wallHandle == wallHandle) return wallGroups[i];
		return undefined;
	},
	makeQueues: function(walls, lastQueues) {
		var queues = {};
		for (var i=0; i<walls.length; i++) {
			if (lastQueues[walls[i].handle]) {
				queues[walls[i].handle] = lastQueues[walls[i].handle];
			} else {
				queues[walls[i].handle] = new ReactionHandlerNonEmergent.Queue();
			}
		}
		return queues;
	},
	countRxnSide: function(side) {
		var x = 0;
		for (var i=0; i<side.length; i++) x += side[i].count;
		return x;
	},
	flattenSpcNames: function(side) {
		var names = [];
		for (var i=0; i<side.length; i++) {
			names = names.concat(side[i].flattenSpcNames());
		}
		return names;
		
	},
	reformatSide: function(side, spcDefs) {
		var typedSpcs = [];
	
		for (var i=0; i<side.length; i++) {
			var def = spcDefByName(spcName);
			typedSpcs.push(new ReactionHandlerNonEmergent.ReactionComponent(side[i].spcName, side[i].count, def));
		}
		return typedSpcs;
	},
	calcSRxn298: function(rcts, prods) {
		var sRxn = 0;
		for (var i=0; i<prods.length; i++) sRxn += prods[i].def.sF298 * prods[i].count;
		for (var i=0; i<rcts.length; i++) sRxn -= rcts[i].def.sF298 * rcts[i].count;
		return sRxn;
	},
}

ReactionHandlerNonEmergent.WallGroup = function(wall, tag, rcts, prods) {
	this.temp = wall.getDataSrc('temp');
	this.vol = wall.getDataSrc('vol');
	this.moles = {};
	this.wallHandle = wall.handle;
	this.chanceForward = .8; //can't do one or sigmoid shifting won't work
	this.chanceBackward = .8;
	this.rateScalar = .8;
	this.rctQueue = new ReactionHandlerNonEmergent.Queue();
	this.prodQueue = new ReactionHandlerNonEmergent.Queue();
	this.populateMoles(wall, tag, this.moles, rcts);
	this.populateMoles(wall, tag, this.moles, prods);
	
}

ReactionHandlerNonEmergent.WallGroup.prototype = {
	populateMoles: function(wall, tag, moles, rxnSide) {
		for (var i=0; i<rxnSide.length; i++) {
			var spcMoles = wall.recordMoles({tag: tag, spcName: rxnSide[i].spcName}).src();
			moles[rxnSide[i].spcName] = spcMoles;
		}
	},
}


ReactionHandlerNonEmergent.Queue = function() {
	this.timeEnqueue = undefined;
	this.init = 0;
	this.now = 0;
}

ReactionHandlerNonEmergent.ReactivePair = function(rxn, rcts, prods, chancePath, queuePath) {
	this.rxn = rxn;
	this.rcts = rcts; //rcts and prods are lists of ReactionComponents
	this.prods = prods;
	this.chancePath = chancePath;
	this.queuePath = queuePath;
}