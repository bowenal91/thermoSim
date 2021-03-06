/*
Copyright (C) 2013  Daniel Reid

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

var flowFuncs = {
	getPts: function(a, b, UV, perp, fracOffset) {
		var distAB = a.VTo(b).mag();
		var widthFrac = this.width/(distAB);
		this.fracOffset = Math.max(Math.min(this.fracOffset, 1 - widthFrac/2), widthFrac/2);
		var aOffset = fracOffset - widthFrac / 2;
		var bOffset = fracOffset + widthFrac / 2;
		var pt1 = a.copy().fracMoveTo(b, aOffset);
		var pt4 = a.copy().fracMoveTo(b, bOffset);
		var pt2 = pt1.copy().movePt(perp.copy().neg().mult(this.depth));
		var pt3 = pt4.copy().movePt(perp.copy().neg().mult(this.depth));
		return this.deleteDuplicatePts([pt1, pt2, pt3, pt4]);
	},
	addPts: function() {
		var aIdx = Math.min(this.ptIdxs[0], this.ptIdxs[1]);
		var bIdx = Math.max(this.ptIdxs[0], this.ptIdxs[1]);
		var a = this.wall[aIdx].copy();
		var b = this.wall[bIdx].copy();
		this.perp = this.wall.getPerpUV(aIdx);
		var UV = this.wall.getUV(aIdx);
		this.pts = this.getPts(a, b, UV, this.perp, this.fracOffset);
	},
	addFlowSliders: function(attrSliders, flows) {
		var sliders = [];
		for (var i=0; i<attrSliders.length; i++) {
			var attrSlider = attrSliders[i];
			var sliderFlowHandles = attrSlider.flowHandles;
			var sliderFlows = this.pluckFlows(flows, sliderFlowHandles);
			var handle = attrSlider.handle;
			var title = attrSlider.title;
			var fracOpen = attrSlider.fracOpen;
			var sliderIdx = attrSlider.sliderIdx;
			var sliderGroup = new Inlet.FlowGroupSlider(title, handle, sliderFlows);
			var slider = sliderManager.addSlider(title, this.handle + 'Slider' + handle.toCapitalCamelCase(),  {value: fracOpen*100},
				[{eventType:'slide', obj: sliderGroup, func: sliderGroup.parseSlider}],
			undefined
			)
			sliderGroup.slider = slider;
			sliders.push(sliderGroup);
		}
		return sliders;
	},
	fracToTemp: function(min, max, frac) {
		return min + (max - min) * frac;
	},
	tempToFrac: function(min, max, temp) {
		return (temp - min) / (max - min);
	},
	pluckFlows: function(flows, flowHandles) {
		var plucked = [];
		for (var i=0; i<flowHandles.length; i++) {
			var foundFlow = false;
			for (var j=0; j<flows.length; j++) {
				if (flows[j].handle == flowHandles[i]) {
					plucked.push(flows[j]);
					foundFlow = true;
				}
			}
			if (!foundFlow) console.log('Could not find flow ' + flowHandles[i] + ' for inlet slider');
		}
		return plucked;
	},
	deleteDuplicatePts: function(pts) {
		for (var i=0; i<pts.length-1; i++) {
			for (var j=i+1; j<pts.length; j++) {
				if (pts[i].sameAs(pts[j])) {
					pts.splice(j, 1);
					j--;
				}
			}
		}
		return pts;
	},
	addArrows: function(UV, type) {
		var arrows = [];
		var width = this.width;
		var arrowCount = this.width > 30 ? 2 : 1;
		var pos = this.pts[1].copy();
		pos.movePt(UV.copy().neg().mult(this.arrowDims.dy/3));
		var ptVec = this.pts[1].VTo(this.pts[2]);
		var stepAdvance = ptVec.copy().UV().copy().mult(ptVec.mag()/(arrowCount + 1));
		for (var ctIdx=0; ctIdx<arrowCount; ctIdx++) {
			pos.movePt(stepAdvance);
			arrows.push(new ArrowStatic({pos: pos, dims: this.arrowDims, UV: UV.copy(), handle: this.handle + 'Idx' + ctIdx, fill: this.arrowFill, stroke: this.arrowStroke, cleanUpWith: this.cleanUpWith}));
		}
		return arrows;
	},

}