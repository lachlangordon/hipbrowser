(function () {
	'use strict';

	angular
		.module('app')
		.controller('HomeController', HomeController);

	HomeController.$inject = ['StarsService', '$filter', '$scope'];
	function HomeController(StarsService, $filter, $scope) {
		var vm = this;

		vm.stars = [];
		vm.filteredstars = [];
		vm.filter = {maxDist: 1000};

		vm.loadAllStars = loadAllStars;
		vm.rerenderStars = rerenderStars;

		initController();

		function initController() {
			loadAllStars();
		}

		function loadAllStars() {
			vm.dataloading = true;
			StarsService.getAll()
			.then(function (starsData) {
				vm.stars = starsData;
				console.log(vm.stars);

				vm.filteredstars = $filter('filter')(vm.stars, function (value, index, array) {return value.distly < vm.filter.maxDist;})
				renderStarMap();
				vm.dataloading = false;
			});
		}

		function rerenderStars() {
			vm.filteredstars = $filter('filter')(vm.stars, function (value, index, array) {return value.distly < vm.filter.maxDist;});
			vm.filteredstars = $filter('filter')(vm.stars, function (value, index, array) {return value.distly > vm.filter.minDist;});
			vm.filteredstars = $filter('filter')(vm.stars, function (value, index, array) {return value.lum < vm.filter.maxLum;});
			vm.filteredstars = $filter('filter')(vm.stars, function (value, index, array) {return value.lum > vm.filter.minLum;});
			vm.filteredstars = $filter('filter')(vm.stars, function (value, index, array) {return value.absmag > vm.filter.maxMag;});
			vm.filteredstars = $filter('filter')(vm.stars, function (value, index, array) {return value.absmag < vm.filter.minMag;});
			jQuery('.webgl').remove();

			renderStarMap();
		}

		function renderStarMap() {

			function getStarColour(colorb_v) {
				if (colorb_v <= -0.29) {
					return new THREE.Color("rgb(162, 192, 255)");
				} 
				else if (colorb_v <= 0) {
					return new THREE.Color("rgb(255, 255, 255)");
				} 
				else if (colorb_v <= 0.31) {
					return new THREE.Color("rgb(255, 229, 206)");
				} 
				else if (colorb_v <= 0.59) {
					return new THREE.Color("rgb(255, 188, 118)");
				} 
				else if (colorb_v <= 0) {
					return new THREE.Color("rgb(255, 157, 60)");
				}
				else {
					return new THREE.Color("rgb(255, 100, 30)");
				} 
			}

			var renderer = new THREE.WebGLRenderer({
			    antialias: true
			});
			var w = window.innerWidth;
			var h = 500;
			renderer.setSize(w, h);
			document.body.appendChild(renderer.domElement);
			renderer.domElement.className = "webgl";

			//renderer.setClearColorHex(0xEEEEEE, 1.0);

			var camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
			camera.position.z = 200;
			camera.position.x = -100;
			camera.position.y = 100;

			var scene = new THREE.Scene();

			var scatterPlot = new THREE.Object3D();
			scene.add(scatterPlot);

			scatterPlot.rotation.y = 0;

			function v(x, y, z) {
			    return new THREE.Vector3(x, y, z);
			}


			var format = d3.format("+.3f");

			var xExent = d3.extent(vm.filteredstars, function (d) {return d.x; }),
			    yExent = d3.extent(vm.filteredstars, function (d) {return d.y; }),
			    zExent = d3.extent(vm.filteredstars, function (d) {return d.z; });

			var vpts = {
			    xMax: xExent[1],
			    xCen: (xExent[1] + xExent[0]) / 2,
			    xMin: xExent[0],
			    yMax: yExent[1],
			    yCen: (yExent[1] + yExent[0]) / 2,
			    yMin: yExent[0],
			    zMax: zExent[1],
			    zCen: (zExent[1] + zExent[0]) / 2,
			    zMin: zExent[0]
			}

			var xScale = d3.scale.linear()
			              .domain(xExent)
			              .range([-100,100]);
			var yScale = d3.scale.linear()
			              .domain(yExent)
			              .range([-100,100]);                  
			var zScale = d3.scale.linear()
			              .domain(zExent)
			              .range([-100,100]);

			var mat = new THREE.ParticleBasicMaterial({
			    vertexColors: true,
			    size: 10
			});

			var pointCount = vm.filteredstars.length;
			var pointGeo = new THREE.Geometry();
			for (var i = 0; i < pointCount; i ++) {
			    var x = xScale(vm.filteredstars[i].x);
			    var y = yScale(vm.filteredstars[i].y);
			    var z = zScale(vm.filteredstars[i].z);

			    pointGeo.vertices.push(new THREE.Vector3(x, y, z));
			    console.log(pointGeo.vertices);
			    pointGeo.colors.push(getStarColour(vm.filteredstars[i].colorb_v));

			}
			var points = new THREE.ParticleSystem(pointGeo, mat);
			scatterPlot.add(points);

			renderer.render(scene, camera);
			var paused = false;
			var last = new Date().getTime();
			var down = false;
			var sx = 0,
			    sy = 0;

			var canvas_el = document.getElementsByTagName("canvas")[0];
			canvas_el.addEventListener("touchstart", handleStart, false);
			canvas_el.addEventListener("touchend", handleEnd, false);
			canvas_el.addEventListener("touchcancel", handleEnd, false);
			canvas_el.addEventListener("touchmove", handleMove, false);

			function handleStart(ev) {
				ev.preventDefault();
				down = true;

				var touchobj = ev.changedTouches[0];
			    sx = parseInt(touchobj.clientX);
			    sy = parseInt(touchobj.clientY);
			}

			function handleEnd(ev) {
				down = false;
			}

			function handleMove(ev) {
				var touchobj = ev.changedTouches[0];
				if (down) {
					ev.preventDefault();
			        var dx = parseInt(touchobj.clientX) - sx;
			        var dy = parseInt(touchobj.clientY - sy);
			        scatterPlot.rotation.y += dx * 0.01;
			        camera.position.y += dy;
			        sx += dx;
			        sy += dy;
			    }
			}
    
			canvas_el.onmousedown = function(ev) {
			    down = true;
			    sx = ev.clientX;
			    sy = ev.clientY;
			};

			canvas_el.onmouseup = function() {
			    down = false;
			};

			canvas_el.onmousemove = function(ev) {
			    if (down) {
			        var dx = ev.clientX - sx;
			        var dy = ev.clientY - sy;
			        scatterPlot.rotation.y += dx * 0.01;
			        camera.position.y += dy;
			        sx += dx;
			        sy += dy;
			    }
			}

			var animating = false;
			canvas_el.ondblclick = function() {
			    animating = !animating;
			};

			function animate(t) {
			    if (!paused) {
			        last = t;
			        if (animating) {
			            var v = pointGeo.vertices;
			            for (var i = 0; i < v.length; i++) {
			                var u = v[i];
			                console.log(u)
			                u.angle += u.speed * 0.01;
			                u.x = Math.cos(u.angle) * u.radius;
			                u.z = Math.sin(u.angle) * u.radius;
			            }
			            pointGeo.__dirtyVertices = true;
			        }
			        renderer.clear();
			        camera.lookAt(scene.position);
			        renderer.render(scene, camera);
			    }
			    window.requestAnimationFrame(animate, renderer.domElement);
			};
			animate(new Date().getTime());
			onmessage = function(ev) {
			    paused = (ev.data == 'pause');
			};

		}		
	}
})();