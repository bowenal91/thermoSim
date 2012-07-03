function WorkTracker(vol, mass, g, SA, readoutData, obj){
	this.vol = vol;
	this.mass = mass;
	this.g = g;
	this.SA = SA;
	this.work = 0;
	this.readout = readoutData.readout;
	this.readout.addEntry('work', 'Work:', 'kJ', 0, readoutData.idx, 1);
	this.volLast = this.vol();
	addListener(obj, 'init', 'workTracker', this.init, this);
}
WorkTracker.prototype = {
	init: function(){
		this.work=0;
		this.volLast = this.vol();
		this.volCur = this.vol();
		addListener(curLevel, 'reset', 'workTracker', this.reset, this);
		//addListener(curLevel, 'data', 'workTracker', this.updateReadout, this);
	},
	updateVal: function(){
		var volCur = this.vol();
		var p = ATMtoPA*pConst*this.mass()*this.g()/this.SA();
		var dV = LtoM3*vConst*(volCur - this.volLast);
		this.work -= JtoKJ*p*dV;
		this.volLast = volCur;
		this.readout.hardUpdate(this.work, 'work');
	},
	updateReadout: function(){
		//this.readout.tick(this.work, 'work');
	},
	reset: function(){
		addListener(curLevel, 'update', 'workTracker', this.updateVal, this);
		this.work=0;
		this.volLast = this.vol();
		this.volCur = this.vol();
	},
}
