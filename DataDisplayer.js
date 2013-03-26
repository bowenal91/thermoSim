function DataDisplayer () {
	this.entries = {};
}
DataDisplayer.prototype = {
	setReadouts: function(readouts) {
		this.readouts = readouts;
	},
	addEntry: function(attrs) {
		var self = this;
		var label = attrs.label;
		var sigFigs = attrs.sigFigs;
		var handle = attrs.handle;
		var expr = attrs.expr;
		var units = attrs.units;
		var cleanUpWith = defaultTo(currentSetupType, attrs.cleanUpWith);
		var readout = this.readouts[attrs.readout];
		if (!readout) console.log('Bad readout name ' + attrs.readout);
		var listenerStr = 'display' + label + this.entries.length;
		var readoutEntry = readout.addEntry(label + handle);
		var dataEntry = new this.Entry(handle, label, sigFigs, expr, units, listenerStr, this, readoutEntry);
		this.entries[dataEntry.handle] = dataEntry;
		this.addCleanUp(cleanUpWith, dataEntry);
		with (this.dataGetFuncs) {
			addListener(curLevel, 'update', listenerStr, function() {
				var displayStr = label;
				var valStr;
				var val = eval(expr);
				if (isNaN(val) || val === undefined) 
					valStr = ''
				else
					valStr = self.setSigFigs(val, sigFigs);
					
				displayStr += valStr + ' ';
				displayStr += units;
				readoutEntry.setText(displayStr);
			})
		
		}
	},
	dataGetFuncs: {
		temp: function(wallHandle) {
			var src = walls[wallHandle].getDataObj('temp').src();
			return src[src.length - 1];
		},
		pInt: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('pInt').src();
			return src[src.length - 1];
		},
		pExt: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('pExt').src();
			return src[src.length - 1];
		},
		vol: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('vol').src();
			return src[src.length - 1];
		},
		q: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('q').src();
			return src[src.length - 1];
		},
		mass: function(wallHandle) {
			var src = wall[wallHandle].getDataObj('mass').src();
			return src[src.length - 1];
		},
		moles: function(wallHandle, args) {
			var src = wall[wallHandle].getDataObj('mass', args).src();
			return src[src.length - 1];
		},
		frac: function(wallHandle, args) {
			var src = wall[wallHandle].getDataObj('frac', args).src();
			return src[src.length - 1];
		},
		time: function(wallHandle, args) {
			var src = wall[wallHandle].getDataObj('time', args).src();
			return src[src.length - 1];
		},
		work: function(wallHandle, args) {
			var src = wall[wallHandle].getDataObj('work', args).src();
			return src[src.length - 1];
		}
	},
	setSigFigs: function(val, sigFigs) {
		//should add rounding and adding zeros to decimal place instead of the digits it has
		var src = String(val);
		var toReturn = '';
		var hitSig = false;
		var sigsHit = 0;
		var decHit = false;
		var idx = 0;
		while ((sigsHit < sigFigs || !decHit) && idx < src.length) {
			var token = src[idx];
			if (token == '.') {
				decHit = true;
			} else if (hitSig) {
				sigsHit ++;
			} else if (token != '0') {
				sigsHit ++;
				hitSig = true;
			}	
			toReturn += token;
			idx ++;
		}
		if (sigsHit == sigFigs) {
			if (!decHit) toReturn += '.';
			return toReturn;
		} else {
			if (!decHit) toReturn += '.';
			var toAdd = sigFigs - sigsHit;
			for (var sigAdd=0; sigAdd<toAdd; sigAdd++) {
				toReturn += '0';
			}
			return toReturn;
		}
	},
	addCleanUp: function(cleanUpWith, dataEntry) {
		var self = this;
		addListener(curLevel, cleanUpWith + 'CleanUp', 'entry' + dataEntry.handle, function() {
			dataEntry.remove();
			// entry.remove();
			// removeListener(curLevel, 'update', dataEntry.listenerStr);
			// for (var entryIdx=0; entryIdx<self.entries.length; entryIdx++) {
				// if (self.entries[entryIdx] == dataEntry) {
					// self.entries.splice(entryIdx, 1);
					// break;
				// }
			// }
		})
	},
	removeEntry: function(handle) {
		if (this.entries[handle]) {
			this.entries[handle].remove();
		}
	},
	Entry: function(handle, label, sigFigs, expr, units, listenerStr, dataDisplayer, readoutEntry) {
		this.handle = handle;
		this.label = label;
		this.sigFigs = sigFigs;
		this.expr = expr;
		this.units = units;
		this.listenerStr = listenerStr;
		this.dataDisplayer = dataDisplayer;
		this.readoutEntry = readoutEntry;
		this.removed = false;
	},
}
DataDisplayer.prototype.Entry.prototype = {
	remove: function() {
		if (!this.removed) {
			delete this.dataDisplayer.entries[this.handle];
			this.readoutEntry.remove();
			removeListener(curLevel, 'update', this.listenerStr);
			this.removed = true;
		}
	}	
}
