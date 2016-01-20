'use strict';

angular.module('starRenderer')
    .directive('starRenderer', function() {
        restrict: 'A',
        scope: {
            'width': '=',
            'height': '=',
            'fillcontainer': '=',

            'minlum': '=',
            'maxlum': '=',
            'mindist': '=',
            'maxdist': '=',

            'stars': '='
        },

        link: function postLink(scope, element, attrs) {
            var camera, scene, renderer, scatterPlot,
                contW = (scope.fillcontainer) ? element[0].clientWidth : scope.width,
                contH = scope.height,
                windowMidX = contW / 2,
                windowMidY = contH / 2

            scope.init = function() {

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

                camera = new THREE.PerspectiveCamera(45, w / h, 1, 10000);
                camera.position.z = 200;
                camera.position.x = -100;
                camera.position.y = 100;

                scene = new THREE.Scene();

                var renderer = new THREE.WebGLRenderer({
                    antialias: true
                });
                renderer.setSize(contW, contH);

                element[0].appendChild(renderer.domElement);

                scatterPlot = new THREE.Object3D();
                scene.add(scatterPlot);

                scatterPlot.rotation.y = 0;

                            var format = d3.format("+.3f");

                var xExent = d3.extent(scope.stars, function (d) {return d.x; }),
                    yExent = d3.extent(scope.stars, function (d) {return d.y; }),
                    zExent = d3.extent(scope.stars, function (d) {return d.z; });

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
                              .range([-(scope.maxDist /2),(scope.maxDist /2)]);
                var yScale = d3.scale.linear()
                              .domain(yExent)
                              .range([-(scope.maxDist /2),(scope.maxDist /2)]);                  
                var zScale = d3.scale.linear()
                              .domain(zExent)
                              .range([-(scope.maxDist /2),(scope.maxDist /2)]);

                var mat = new THREE.ParticleBasicMaterial({
                    vertexColors: true,
                    size: 10
                });

                var pointCount = scope.stars.length;
                var pointGeo = new THREE.Geometry();
                for (var i = 0; i < pointCount; i ++) {
                    var x = xScale(scope.stars[i].x);
                    var y = yScale(scope.stars[i].y);
                    var z = zScale(scope.stars[i].z);

                    pointGeo.vertices.push(new THREE.Vector3(x, y, z));
                    console.log(pointGeo.vertices);
                    pointGeo.colors.push(getStarColour(scope.stars[i].colorb_v));

                }
                var points = new THREE.ParticleSystem(pointGeo, mat);
                scatterPlot.add(points);

                window.addEventListener('resize', scope.onWindowResize, false);

                renderer.render(scene, camera);
                var paused = false;
                var last = new Date().getTime();
                var down = false;
                var sx = 0,
                    sy = 0;
                    
                window.onmousedown = function(ev) {
                    down = true;
                    sx = ev.clientX;
                    sy = ev.clientY;
                };
                window.onmouseup = function() {
                    down = false;
                };
                window.onmousemove = function(ev) {
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
                window.ondblclick = function() {
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


            };

            scope.onWindowResize = function() {
                scope.resizeCanvas();
            };

            scope.resizeCanvas = function() {
              contW = (scope.fillcontainer) ? 
                element[0].clientWidth : scope.width;
              contH = scope.height;

              windowMidX = contW / 2;
              windowMidY = contH / 2;

              camera.aspect = contW / contH;
              camera.updateProjectionMatrix();

              renderer.setSize( contW, contH );
            };
        }
    });      