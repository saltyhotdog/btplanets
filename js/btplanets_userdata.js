define(['js/lib/d3.min', 'js/btplanets'], function (d3, btplanets) {
	'use strict';

  return {
    planetData : null,

	modifiedUserData : {},
	parsedUserData : null,
	userDataSaveTimeout : null,

	textFile : null,

	scheduleUserDataSave : function (planet) {
		clearTimeout(this.userDataSaveTimeout);
		this.modifiedUserData[planet.name] = planet.userData;
		this.userDataSaveTimeout = setTimeout(this.saveModifiedUserData.bind(this), 1000);
	},

	saveModifiedUserData : function () {
		for(var key in this.modifiedUserData) {
			if(!this.modifiedUserData.hasOwnProperty(key)) {
				continue;
			}
			if(!!this.modifiedUserData[key]) {
				localStorage.setItem(key, this.modifiedUserData[key]);
			} else {
				localStorage.removeItem(key);
			}
		}
		this.modifiedUserData = {};
		//this.fireEvent('userdatasaved');
	},

	parseUserData : function (jsonText) {
		var parsedObj = JSON.parse(jsonText);
		var curPlanet;
		var counter = 0;

		this.parsedUserData = {};

		for(var i = 0, len = btplanets.planets.length; i < len; i++) {
			curPlanet = btplanets.planets[i];
			if(parsedObj.hasOwnProperty(curPlanet.name)) {
				this.parsedUserData[curPlanet.name] = parsedObj[curPlanet.name];
				counter++;
			}
		}

		return counter;
	},

	commitParsedUserData : function () {
		var curPlanet;

		for(var i = 0, len = btplanets.planets.length; i < len; i++) {
			curPlanet = btplanets.planets[i];
			curPlanet.userData = this.parsedUserData[curPlanet.name] || '';
		}
		this.modifiedUserData = this.parsedUserData || {};
		localStorage.clear();
		this.saveModifiedUserData();
		btplanets.updateAllUserDataHighlights();
	},

	exportToTextFile : function () {
		var textFile = null;
		var now = new Date();
		var timestamp = '';
		timestamp += now.getFullYear();
		timestamp += this.padInteger(now.getMonth() + 1, 2);
		timestamp += this.padInteger(now.getDate(), 2);
		timestamp += this.padInteger(now.getHours(), 2);
		timestamp += this.padInteger(now.getMinutes(), 2);
		timestamp += this.padInteger(now.getSeconds(), 2);

		var link = document.createElement('a');
		link.setAttribute('download', 'innersphere-userdata-'+timestamp+'.json');
		link.href = this.makeTextFile(this.createExportString());
		document.body.appendChild(link);

		// wait for the link to be added to the document
	    window.requestAnimationFrame(function () {
	      var event = new MouseEvent('click');
	      link.dispatchEvent(event);
	      document.body.removeChild(link);
		});
	},

	/**
	 * @private
	 */
	createExportString : function () {
		var obj = {};
		var curPlanet;
		for(var i = 0, len = btplanets.planets.length; i < len; i++) {
			curPlanet = btplanets.planets[i];
			if(!!curPlanet.userData) {
				obj[curPlanet.name] = curPlanet.userData;
			}
		}
		return JSON.stringify(obj);
	},

	/**
	 * @private
	 */
  	makeTextFile : function (text) {
    	var data = new Blob([text], {type: 'text/plain'});

	    // If we are replacing a previously generated file we need to
	    // manually revoke the object URL to avoid memory leaks.
	    if (this.textFile !== null) {
	      window.URL.revokeObjectURL(this.textFile);
	    }
    	this.textFile = window.URL.createObjectURL(data);

    	return this.textFile;
  	},

	/**
	 * @private
	 */
	padInteger : function (int, totalNumChar) {
		var str = int + '';
		totalNumChar = totalNumChar || 1;
		while(str.length < totalNumChar) {
			str = '0' + str;
		}
		return str;
	}
  };
});
