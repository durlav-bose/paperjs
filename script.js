
        var values = {
            paths: 50,
            minPoints: 5,
            maxPoints: 15,
            minRadius: 30,
            maxRadius: 90
        };

        var hitOptions = {
            segments: true,
            stroke: true,
            fill: true,
            tolerance: 5
        };

        createPaths();

        function createPaths() {
            var radiusDelta = values.maxRadius - values.minRadius;
            var pointsDelta = values.maxPoints - values.minPoints;
            for (var i = 0; i < 1; i++) {
                var radius = values.minRadius + Math.random() * radiusDelta;
                var points = values.minPoints + Math.floor(Math.random() * pointsDelta);
                var path = createBlob(view.size * Point.random(), radius, points);
                var lightness = (Math.random() - 0.5) * 0.4 + 0.4;
                var hue = Math.random() * 360;
                path.fillColor = { hue: hue, saturation: 1, lightness: lightness };
                path.strokeColor = 'black';
            };
        }

        function createBlob(center, maxRadius, points) {
            console.log('points :>> ', points);
            var d  = maxRadius * 0.5 + Math.random() * maxRadius * 0.5;
            console.log('d :>> ', d);
            var path = new Path();
            path.closed = true;
            var angles = [-45, 45, 135, 225]
            for (var i = 0; i < 4; i++) {
                var delta = new Point({
                    length: 100,
                    angle: angles[i]
                });
                
                path.add(center + delta);
            }
            // path.smooth();
            return path;
        }

        var segment, path;
        var movePath = false;
        function onMouseDown(event) {
            segment = path = null;
            var hitResult = project.hitTest(event.point, hitOptions);
            if (!hitResult)
                return;

            if (event.modifiers.shift) {
                if (hitResult.type == 'segment') {
                    hitResult.segment.remove();
                };
                return;
            }

            if (hitResult) {
                path = hitResult.item;
                if (hitResult.type == 'segment') {
                    segment = hitResult.segment;
                } else if (hitResult.type == 'stroke') {
                    var location = hitResult.location;
                    segment = path.insert(location.index + 1, event.point);
                    //  path.smooth();
                }
            }
            movePath = hitResult.type == 'fill';
            if (movePath)
                project.activeLayer.addChild(hitResult.item);
        }

        function onMouseMove(event) {
            project.activeLayer.selected = false;
            if (event.item)
                event.item.selected = true;
        }

        // function onMouseDrag(event) {
        //     if (segment) {
        //         segment.point += event.delta;
        //         path.smooth();
        //     } else if (path) {
        //         path.position += event.delta;
        //     }
        // }
        

        // function onMouseDrag(event) {
        //     if (segment) {
        //         // Move the segment point
        //         segment.point = segment.point.add(event.delta);
        //         adjustHandles(segment);
        //     }
        // }
        
        function adjustHandles(segment) {
            // Clear handles for a sharp corner
            segment.handleIn = new Point(0, 0);
            segment.handleOut = new Point(0, 0);
        
            if (segment.previous) {
                segment.handleIn = segment.point.subtract(segment.previous.point).normalize(-30); // length of handle, adjust as needed
            }
            if (segment.next) {
                segment.handleOut = segment.point.subtract(segment.next.point).normalize(-30); // length of handle, adjust as needed
            }
        }
        

        function createHandlesForSegment(segment) {
            // Determine the direction of the handles based on the segments around it
            var before = segment.previous ? segment.point.subtract(segment.previous.point) : null;
            var after = segment.next ? segment.point.subtract(segment.next.point) : null;
        
            // This is a simple heuristic to create handles that create a smooth curve
            var quarter = 1 / 4;
        
            if (before) {
                segment.handleIn = before.multiply(quarter);
            } else {
                segment.handleIn = new Point(0, 0);
            }
        
            if (after) {
                segment.handleOut = after.multiply(quarter);
            } else {
                segment.handleOut = new Point(0, 0);
            }
        }

        function onMouseDrag(event) {
            if (segment) {
                segment.point += event.delta;
                // Smooth only the handles for the segment being dragged
                createHandlesForSegment(segment);
            } else if (path) {
                path.position += event.delta;
            }
        }