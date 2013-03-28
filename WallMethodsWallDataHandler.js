WallMethods.wallDataHandler = {
	pExt: function(){
		var SA = this[1].x - this[0].x;
		return this.pConst*this.mass*this.g/SA;
	},
	pInt: function(){
		var SA = this.surfArea();
		for (var SAAdj in this.surfAreaAdj) {
			SA += this.surfAreaAdj[SAAdj].val;
		}
		var pInt = this.pConst*this.forceInternal/((turn-this.pLastRecord)*SA);
		this.forceInternal = 0;
		this.pLastRecord = turn;
		this.pIntList[this.pIntIdx] = pInt;
		this.pIntIdx++;
		if (this.pIntIdx==this.pIntLen) {
			this.pIntIdx=0;
		}
		return this.pIntList.average();
	},
	addSurfAreaAdjust: function(handle) {
		this.surfAreaAdj[handle] = {val: 0};
		return this.surfAreaAdj[handle];
	},
	removeSurfAreaAdjust: function(handle) {
		delete this.surfAreaAdj[handle];
	},
	getDataObj: function(type, args, suppressOutput) { //data will be list of DataObjs if it's like fractional conversion where there can be one for each species or tag.  Else is just DataObj
		if (this.data[type]) {
			if (this.data[type] instanceof Array) {
				for (var idx=0; idx<this.data[type].length; idx++) {
					if (this.data[type][idx].argsMatch(args)) return this.data[type][idx];
				}
			} else {
				return this.data[type]
			}
		} else if (!suppressOutput) {
			console.log('Tried to get bad data type "' + type + '" with args');
			console.log(args);
		}
		return false;
	},
	getDataSrc: function(type, args, suppressOutput) {
		if (this.data[type]) {
			if (this.data[type] instanceof Array) {
				for (var idx=0; idx<this.data[type].length; idx++) {
					if (this.data[type][idx].argsMatch(args)) return this.data[type][idx].srcVal;
				}
			} else {
				return this.data[type].srcVal
			}
		} else if (!suppressOutput) {
			console.log('Tried to get bad data type "' + type + '" with args');
			console.log(args);
		}
		return false;	
	},
	removeDataObj: function(type, args) { 
		if (this.data[type]) {
			if (this.data[type] instanceof Array) {
				for (var idx=0; idx<this.data[type].length; idx++) {
					if (this.data[type][idx].argsMatch(args)) return this.data[type].splice(idx, 1);
				}
				console.log("Couldn't find data " + type + " with args " + args);
			} else {
				return delete this.data[type]
			}
		}
	},
	createSingleValDataObj: function(dataObjName, valFunc, isArrayMember) {
		var dataObj = new WallMethods.DataObj();
		if (isArrayMember) {
			if (this.data[dataObjName]) {
				this.data[dataObjName].push(dataObj)
			} else {
				this.data[dataObjName] = [dataObj];
			}
		} else {
			this.data[dataObjName] = dataObj;
		}
		this.setupStdDataObj(dataObj, dataObjName);
		dataObj.recordStop(function(){});
		dataObj.srcVal = [valFunc()];
		return dataObj;
		
	},
	recordDefaults: function(){
		this.recordTime();
		this.recordTemp();
		this.recordPInt();
		this.recordVol();
	},
	recordTime: function() {
		this.data.time = new WallMethods.DataObj();
		var dataObj = this.data.time;
		this.setupStdDataObj(dataObj, 'time');
		var tInit = Date.now();
		var getTime = function() {
			return (Date.now() - tInit) / 1000;
		}
		recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), getTime, this, 'update');
	},
	
	recordTemp: function(tempFunc) {
		if (!this.data.temp || !this.data.temp.recording()) {
			this.data.temp = new WallMethods.DataObj();
			var dataObj = this.data.temp;
			this.setupStdDataObj(dataObj, 'temp');
			var dots = this.dotManager.get({tag: this.handle});
			if (!tempFunc) { 
				tempFunc = function () {
					var sumKE = 0;
					for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
						sumKE += dots[dotIdx].KE();
					}
					return dots.length ? tConst * sumKE / dots.length : 0;
				}
			}
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), tempFunc, this, 'update');
		}
		return this;
	},

	recordRMS: function() {
		if (!this.data.RMS || !this.data.RMS.recording()) {
			this.data.RMS = new WallMethods.DataObj();
			var dataObj = this.data.RMS;
			this.setupStdDataObj(dataObj, 'RMS');
			//HEY - I AM ASSUMING THAT IF YOU GET RMS, IT IS OF ONE TYPE OF MOLECULE
				
			var mass = this.getRMSMass(this.handle);
			var RMSFunc = function() {
				var temp = this.data.t[this.data.t.length-1];
				return Math.sqrt(3000*KB*temp*ACTUALN/mass)
			}
			//figure out RMS at some point
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), RMSFunc, this, 'update');
		}
		return this;
	},
	getRMSMass: function(tag) {
		if (tag) {
			for (var spc in spcs) {
				var dots = spcs[spc].dots;
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
					if (tag) {
						if (dots[dotIdx].tag == tag) {
							return dots[dotIdx].m;
						}
					} else {
						return dots[dotIdx].m;
					}
				}
			}
		}
	},
	recordPInt: function() {
		if (!this.data.pInt || !this.data.pInt.recording()) {
			this.data.pInt = new WallMethods.DataObj();
			var dataObj = this.data.pInt;
			this.setupStdDataObj(dataObj, 'pInt');
			this.pIntList = new Array();
			this.pIntIdx = 0;
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), this.pInt, this, 'update');
			
		}

		return dataObj;
	},
	recordPExt: function() {
		if (!this.data.pExt || !this.data.pExt.recording()) {
			this.data.pExt = new WallMethods.DataObj();
			var dataObj = this.data.pExt;
			this.setupStdDataObj(dataObj, 'pExt');
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), this.pExt, this, 'update');
		}
		return dataObj;
	},
	recordVol: function() {
		if (!this.data.vol || !this.data.vol.recording()) {
			this.data.vol = new WallMethods.DataObj();
			var dataObj = this.data.vol;
			this.setupStdDataObj(dataObj, 'vol');
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function() {return this.parent.wallVolume(this.handle)}, this, 'update');
		}
		return dataObj;
	},
	recordWork: function() {
		if (!this.data.work || !this.data.work.recording()) {
			this.data.work = new WallMethods.DataObj();
			var dataObj = this.data.work;
			this.setupStdDataObj(dataObj, 'work');
			
			this.work = 0;
			var LTOM3LOCAL = LtoM3;
			var PCONSTLOCAL = pConst;
			var PUNITTOPALOCAL = PUNITTOPA;
			var VCONSTLOCAL = vConst;
			var JTOKJLOCAL = JtoKJ;
			var trackPt = this[0];

			var heightLast = trackPt.y;
			//Attention - at some point, employ some trickyness to first add a listener for first turn that records zero, then add real listener that uses func below. 
			//this will work after first turn since volume is _always_ recorded before work (vol is added as default to wall, work is added later by objects)
			var self = this;
			//var pExtList = this.data.get
			var volSrc = this.getDataObj('vol').src();
			var calcWork = function() {
				var len = volSrc.length
				var dV = LTOM3LOCAL*(volSrc[len-1] - volSrc[len-2])
				if (!isNaN(dV)) {
					var p = self.pExt()*PUNITTOPALOCAL;
					self.work -= JTOKJLOCAL*p*dV;
					return self.work;
				} else {
					self.work = 0;
					return 0;
				}
			}

			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), calcWork, this, 'update');
		}
		return dataObj;
	},
	recordMass: function() {
		if (!this.data.mass || !this.data.mass.recording()) {
			this.data.mass = new WallMethods.DataObj();
			var dataObj = this.data.mass;
			this.setupStdDataObj(dataObj, 'mass');
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function(){return this.mass}, this, 'update');	
		}
		return dataObj;			
	},
	recordQ: function() {
		if (!this.data.q || !this.data.q.recording()) {
			this.data.q = new WallMethods.DataObj();
			var dataObj = this.data.q;
			this.setupStdDataObj(dataObj, 'q');
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function(){return this.q}, this, 'update');
		}
		return dataObj;
	},
	recordVDist: function(info) {
		var dots = this.dotManager.createIfNotExists(info);
		if (!this.data.vDist) this.data.vDist = [];
		
		if (!this.getDataObj('vDist', info)) {
			this.data.vDist.push(new WallMethods.DataObj());
			var dataObj = this.data.vDist[this.data.vDist.length-1];
			this.setupInfoDataObj(dataObj, 'vDist', info);
			var dataFunc = function() {
				var vs = [];
				for (var dotIdx=0; dotIdx<dots.length; dotIdx++) {
					vs.push(dots[dotIdx].speed());
				}
				return vs;
			}
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), dataFunc, this, 'update');
		
		}
	},
	recordMoles: function(info) {
		var dataObj;
		var dots = this.dotManager.createIfNotExists(info);
		if (!this.data.moles) this.data.moles = [];
		//list is okay.  Will use getDataObj func
		if (this.getDataObj('moles', info)) {
			dataObj = this.getDataObj('moles', info);
		} else {
			this.data.moles.push(new WallMethods.DataObj());
			dataObj = this.data.moles[this.data.moles.length-1];
			this.setupInfoDataObj(dataObj, 'moles', info);
			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function() {return dots.length / N}, this, 'update');
		}
		return dataObj;
	},
	recordFrac: function(info) {
		var dataObj;
		var countList = this.dotManager.createIfNotExists(info);
		var totalList = this.dotManager.createIfNotExists(info.tag ? {tag: info.tag} : undefined);
		if (!this.data.frac) this.data.frac = [];
		//list is okay.  Will use getDataObj func
		if (this.getDataObj('frac', info)) {
			dataObj = this.getDataObj('frac', info);
		} else {
			this.data.frac.push(new WallMethods.DataObj());
			dataObj = this.data.frac[this.data.frac.length-1];
			this.setupInfoDataObj(dataObj, 'frac', info);

			recordData(dataObj.id() + dataObj.wallHandle(), dataObj.src(), function() {return countList.length/totalList.length}, this, 'update');
		}
		return dataObj;		
	},
	setupStdDataObj: function(dataObj, id) {
		
		dataObj.recording(true);
		dataObj.recordStop(this.recordStop);
		dataObj.id(id);
		dataObj.type(id);
		dataObj.wallHandle(this.handle);
		if (inPrompt()) this.setupPromptRecordStop(dataObj, dataObj.id());
	},
	setupInfoDataObj: function(dataObj, type, info) {
		dataObj.recording(true);
		dataObj.recordStop(this.recordStopDestroy);
		dataObj.id(type + (info.spcName || '').toCapitalCamelCase() + (info.tag || '').toCapitalCamelCase());
		dataObj.wallHandle(this.handle);
		dataObj.type(type);
		dataObj.idArgs(info);
		if (inPrompt()) this.setupPromptRecordStop(dataObj);
	},
	//I add a listener to clean up recording with the prompt only because everything in the wall gets removed on leaving the section.
	setupPromptRecordStop: function(dataObj) {
		var listenerHandle = 'recordStop' + dataObj.id().toCapitalCamelCase();
		addListener(curLevel, currentSetupType + 'CleanUp', listenerHandle, function() {
			dataObj.recordStop();
			removeListener(curLevel, currentSetupType + 'CleanUp', listenerHandle);
		})
	},
	setupPromptDisplayStop: function(dataObj) {
		var listenerHandle = 'displayStop' + dataObj.id().toCapitalCamelCase();
		addListener(curLevel, currentSetupType + 'CleanUp', listenerHandle, function() {
			dataObj.displayStop();
			removeListener(curLevel, currentSetupType + 'CleanUp', listenerHandle)
		});
	},
	//to be called in context of DataObj
	recordStopDestroy: function() {
		this.recording(false);
		walls[this.wallHandle()].removeDataObj(this.type(), this.idArgs());
		recordDataStop(this.id() + this.wallHandle());	

	},
	recordStop: function() {
		this.recording(false);
		recordDataStop(this.id() + this.wallHandle());
	},
	recordAllStop: function(){
		for (var dataObjName in this.data) {
			var dataObj = this.data[dataObjName];
			if (dataObj instanceof Array) {
				for (var idx=0; idx<dataObj.length; idx++) {
					dataObj[idx].recordStop();
				}
			} else {
				dataObj.recordStop();
			}
		}
		return this;
	},	
	resetWork: function(){
		this.work = 0;
		return this;
	},
	resetQ: function(){
		this.q = 0;
		return this;
	},
	displayQArrowsRate: function(attrs){
		var threshold = attrs.threshold
		if (this.data.q.recording() && !(this.data.qArrowsRate && this.data.qArrowsRate.recording()) && !(this.data.qArrowsAmmt && this.data.qArrowsAmmt.recording())) {
			this.data.qArrowsRate = new WallMethods.DataObj();
			var dataObj = this.data.qArrowsRate;
			dataObj.displaying(true);
			dataObj.wallHandle(this.handle);
			dataObj.id('qArrowsRate');
			this.turnLastArrow = Math.max(0, this.data.q.length-1);
			this.qArrowThreshold = defaultTo(threshold, .3);
			var listenerStr = 'checkForDisplayArrows' + dataObj.wallHandle();
			var self = this;
			qSrc = this.data.q.src();
			addListener(curLevel, 'update', listenerStr, function() {self.checkDisplayArrows(qSrc)}, this);
			this.turnLastArrow = turn;
			addListener(this, 'cleanUp', 'qArrowsRate', function() {
				removeListener(curLevel, 'update', listenerStr);
				removeListenerByName(curLevel, 'update', 'ArrowFly');
			});

		} else {
			console.log('Tried to display q arrowsRate for wall ' + this.handle + ' while not recording or already displaying.  Will not display.');
			console.trace();
		}
	},
	displayQArrowsAmmt: function(attrs) {
		var qMax = attrs.qMax;
		if (this.data.q.recording() && !(this.data.qArrowsRate && this.data.qArrowsRate.recording()) && !(this.data.qArrowsAmmt && this.data.qArrowsAmmt.recording())) {
			this.data.qArrowsAmmt = new WallMethods.DataObj();
			var dataObj = this.data.qArrowsAmmt;
			dataObj.displaying(true);
			dataObj.wallHandle(this.handle);
			dataObj.id('qArrowsAmmt');
			var wall = this;
			addListener(this, 'cleanUp', 'qArrowsAmmt', function() {
				for (var arrowIdx=0; arrowIdx<wall.qArrowsAmmt.length; arrowIdx++) {
					wall.qArrowsAmmt[arrowIdx].remove();
				}
				removeListener(curLevel, 'update', wall.handle + 'updateQAmmtArrows');
				
			})
			// dataObj.displayStop(function() {
				// this.displaying(false);
				// for (var arrowIdx=0; arrowIdx<wall.qArrowsAmmt.length; arrowIdx++) {
					// wall.qArrowsAmmt[arrowIdx].remove();
				// }
				// removeListener(curLevel, 'update', this.wallHandle() + 'updateQAmmtArrows');
			// })
			this.qArrowsAmmtInit(defaultTo(3, qMax));
		} else {
			console.log('Tried to display q arrowsAmmt for wall ' + this.handle + ' while not recording or already displaying.  Will not display.');
			console.trace();	
			
		}
	},
	makeDataList: function() {
		var list = [];
		list.displaying = false;
		list.recording = false;
		return list;
	},
	resetQ: function() {
		this.q = 0;
		if (this.displayingQArrowsAmmt) {
			this.displayQArrowsAmmtStop();
			this.displayQArrowsAmmt(this.qArrowAmmtMax);
		}
	},
	resetWork: function() {
		this.work = 0;
	},
	qArrowsAmmtInit: function(qMax) {
		this.qArrowAmmtMax = qMax;
		var lengthMin = 15;
		var lengthMax = 80;
		var widthMin = 70
		var widthMax = 90;
		var col = Col(175, 0, 0);
		var width = 40;
		var fracFromEdge = .25;
		var startingDims = V(30, 10);
		var pos1 = this[3].copy().fracMoveTo(this[2], fracFromEdge);
		var pos2 = this[3].copy().fracMoveTo(this[2], 1-fracFromEdge);
		var UV = pos2.VTo(pos1).perp('cw').UV();
		pos1.movePt(UV.copy().mult(5));
		pos2.movePt(UV.copy().mult(5));
		var arrow1 = new ArrowStatic({pos:pos1, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV});
		var arrow2 = new ArrowStatic({pos:pos2, dims:startingDims, fill: Col(175,0,0), stroke: Col(0,0,0), label:'Q', UV:UV});

		var redrawThreshold = qMax/(lengthMax-lengthMin);
		this.qArrowsAmmt = [arrow1, arrow2];
		var dirLast = 'out';
		qLast = this.q;
		this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, this.q, qMax);
		if (this.q>=0) {
			dirLast = 'in';
			this.flipAmmtArrows(this.qArrowsAmmt);
		}
		addListener(curLevel, 'update', this.handle + 'updateQAmmtArrows', 
			function() {
				if (Math.abs(this.q - qLast) > redrawThreshold) {
					if (this.q<0) {
						dir = 'out';
					} else {
						dir = 'in';
					}
					this.setAmmtArrowDims(this.qArrowsAmmt, lengthMin, lengthMax, widthMin, widthMax, this.q, qMax);
					if (dirLast != dir) {
						this.flipAmmtArrows(this.qArrowsAmmt);
						dirLast = dir;
					}
					qLast = this.q;
				}
			},
		this);
	},
	flipAmmtArrows: function(arrows) {
		for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
			var arrow = arrows[arrowIdx];
			var UV = angleToUV(arrow.getAngle()).mult(1);
			arrow.move(UV.mult(arrow.getDims().dx));
			arrow.rotate(Math.PI);
		}
	},
	setAmmtArrowDims: function(arrows, lMin, lMax, wMin, wMax, q, qMax) {
		for (var arrowIdx=0; arrowIdx<arrows.length; arrowIdx++) {
			var arrow = arrows[arrowIdx];
			var dimso = arrow.getDims();
			var percent = Math.abs(this.q)/qMax;
			var l = lMin + (lMax-lMin)*percent;
			var w = wMin + (wMax-wMin)*percent;
			arrow.size(V(l, w));
			if (q>0) {
				arrow.move(V(0, l-dimso.dx));
			}
		}
	},
	checkDisplayArrows: function(q){
		var dQ = q[q.length-1] - q[this.turnLastArrow];
		if (Math.abs(dQ)>this.qArrowThreshold) {
			this.populateArrows(dQ);
			this.turnLastArrow = turn;
		}
	},
}