/*
Mark Dickerson
 */

/*
Cool Things
- Diamond Square Algorithm wraps around. This enabled me to tile the landscape and fly around infinitely 
- Water Line Cut Off
*/





var currentTransformMatrix = new mat4();

var matrixStack = new Array();

var gl;

window.onload= function main(){
    gl = initialize();    
    
    var speed = 0.5; //Adjusts rate of forward/backward/pitch/roll/yaw
    var eye = vec3(0.0,25.0,25.0);
    var direction = vec3(0.0,0.0,-0.5)
    var up = vec3(0.0,1.0,0.0)
  
    // initialize the model matrix to the identity
    gl.uniformMatrix4fv(gl.u_ModelMatrix, false, flatten(mat4()));
        
        
    // create the heightfield
    var heightfield = new HeightField(gl, 50,50,.2);


    var keysPressed = {} // Keeps track of what keys are currently pressed

    window.onkeydown = function(e){
   
        keysPressed[e.keyCode] = true;
        console.log(e.keyCode);
    }
    
    window.onkeyup = function(e){
       
         keysPressed[e.keyCode] = false;

    }

    var drawWorld = function(){
        // Forwards
        if (keysPressed[38]){
            eye = add(eye, scalev(speed,direction));
            if (eye[0] < -25) {
                eye[0] = eye[0]+50.0;
            }
            if (eye[0] > 25) {
                eye[0] = eye[0]-50.0;
            }
            if (eye[2] < -25) {
                eye[2] = eye[2]+50.0;
            }
            if (eye[2] > 25) {
                eye[2] = eye[2]-50.0;
            }
        }
        // Backwards
        if (keysPressed[40]){
            eye = subtract(eye, scalev(speed,direction));
            if (eye[0] < -25) {
                eye[0] = eye[0]+50.0;
            }
            if (eye[0] > 25) {
                eye[0] = eye[0]-50.0;
            }
            if (eye[2] < -25) {
                eye[2] = eye[2]+50.0;
            }
            if (eye[2] > 25) {
                eye[2] = eye[2]-50.0;
            }
        }
        // Left
        if (keysPressed[37]){
            direction = vec3(
                direction[0]*Math.cos(-radians(speed*2.0))-direction[2]*Math.sin(-radians(speed*2.0)),
                direction[1],
                direction[0]*Math.sin(-radians(speed*2.0))+direction[2]*Math.cos(-radians(speed*2.0))
            );
            up = vec3(
                up[0]*Math.cos(-radians(speed*2.0))-up[2]*Math.sin(-radians(speed*2.0)),
                up[1],
                up[0]*Math.sin(-radians(speed*2.0))+up[2]*Math.cos(-radians(speed*2.0))
            );
        }
        // Right
        if (keysPressed[39]){
            direction = vec3(
                direction[0]*Math.cos(radians(speed*2.0))-direction[2]*Math.sin(radians(speed*2.0)),
                direction[1],
                direction[0]*Math.sin(radians(speed*2.0))+direction[2]*Math.cos(radians(speed*2.0))
            );
            up = vec3(
                up[0]*Math.cos(radians(speed*2.0))-up[2]*Math.sin(radians(speed*2.0)),
                up[1],
                up[0]*Math.sin(radians(speed*2.0))+up[2]*Math.cos(radians(speed*2.0))
            );
        }

        // W - Tilt Forwards
        if (keysPressed[87]){
            direction = vec3(
                direction[0],
                direction[1]*Math.cos(-radians(speed*2.0))-direction[2]*Math.sin(-radians(speed*2.0)),
                direction[1]*Math.sin(-radians(speed*2.0))+direction[2]*Math.cos(-radians(speed*2.0))
            );
            up = vec3(
                up[0],
                up[1]*Math.cos(-radians(speed*2.0))-up[2]*Math.sin(-radians(speed*2.0)),
                up[1]*Math.sin(-radians(speed*2.0))+up[2]*Math.cos(-radians(speed*2.0))
            );
        }
        // S - Tilt Backwards
        if (keysPressed[83]){
            direction = vec3(
                direction[0],
                direction[1]*Math.cos(radians(speed*2.0))-direction[2]*Math.sin(radians(speed*2.0)),
                direction[1]*Math.sin(radians(speed*2.0))+direction[2]*Math.cos(radians(speed*2.0))
            );
            up = vec3(
                up[0],
                up[1]*Math.cos(radians(speed*2.0))-up[2]*Math.sin(radians(speed*2.0)),
                up[1]*Math.sin(radians(speed*2.0))+up[2]*Math.cos(radians(speed*2.0))
            );
        }
        // A - Tilt Left
        if (keysPressed[65]){
            direction = vec3(
                direction[0]*Math.cos(radians(speed*2.0))-direction[1]*Math.sin(radians(speed*2.0)),
                direction[0]*Math.sin(radians(speed*2.0))+direction[1]*Math.cos(radians(speed*2.0)),
                direction[2]
            );
            up = vec3(
                up[0]*Math.cos(radians(speed*2.0))-up[1]*Math.sin(radians(speed*2.0)),
                up[0]*Math.sin(radians(speed*2.0))+up[1]*Math.cos(radians(speed*2.0)),
                up[2]
            );
        }
        // D - Tilt Right
        if (keysPressed[68]){
            direction = vec3(
                direction[0]*Math.cos(-radians(speed*2.0))-direction[1]*Math.sin(-radians(speed*2.0)),
                direction[0]*Math.sin(-radians(speed*2.0))+direction[1]*Math.cos(-radians(speed*2.0)),
                direction[2]
            );
            up = vec3(
                up[0]*Math.cos(-radians(speed*2.0))-up[1]*Math.sin(-radians(speed*2.0)),
                up[0]*Math.sin(-radians(speed*2.0))+up[1]*Math.cos(-radians(speed*2.0)),
                up[2]
            );
        }
        

        

         gl.clear(gl.COLOR_BUFFER_BIT |gl.DEPTH_BUFFER_BIT);

        var numTiles = 5; //num of tiles to use on in x and z direction of the landscape

        heightfield.draw();

            // set the camera view
        currentTransformMatrix = lookAt(eye, add(eye,direction), up);

        //heightfield.draw();

        //Tiles LandScape
        for (var i = 0; i < numTiles; i++) {
            for (var j = 0; j < numTiles; j++) {
                matrixStack.push(currentTransformMatrix);   
                currentTransformMatrix = mult(currentTransformMatrix, translate(-25.0*(numTiles-1)+50*i, 0.0,-25.0*(numTiles-1)+50*j)); 
                heightfield.draw();
                currentTransformMatrix = matrixStack.pop();

            }
        }
        
        requestAnimationFrame(drawWorld);
    }

    
    drawWorld();
}



function initialize() {
    var canvas = document.getElementById('gl-canvas');
    
    // Use webgl-util.js to make sure we get a WebGL context
    var gl = WebGLUtils.setupWebGL(canvas);
    
    if (!gl) {
        alert("Could not create WebGL context");
        return;
    }
    
    
    // set the viewport to be sized correctly
    gl.viewport(0,0, canvas.width, canvas.height);
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // create program with our shaders and enable it
    gl.program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(gl.program);

    
    gl.u_ModelMatrix =  gl.getUniformLocation(gl.program, 'u_ModelMatrix');
    gl.u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
    gl.u_Projection = gl.getUniformLocation(gl.program, 'u_Projection');
    
    
    // set the perspective projection
    var projection  = perspective(50, canvas.width/canvas.height, .5, 100);
    gl.uniformMatrix4fv(gl.u_Projection, false, flatten(projection));

    //lighting
    var u_LightDirection = gl.getUniformLocation(gl.program, 'u_LightDirection');
    gl.uniform3f(u_LightDirection, 0.0,30.0,2.0);
    
    var light_ambient = gl.getUniformLocation(gl.program, 'light_ambient');
    gl.uniform3f(light_ambient, 0.2, 0.2, 0.2);
    
    var light_diffuse = gl.getUniformLocation(gl.program, 'light_diffuse');
    gl.uniform3f(light_diffuse, 0.9, 0.9, 0.9);

    var light_specular = gl.getUniformLocation(gl.program, 'light_specular');
    gl.uniform3f(light_specular, 0.9, 0.9, 0.9);
    
    
    return gl;
}





function HeightField(gl, s, s, scale){

    n = 7;
    s = Math.pow(2,n)+1;
    roughness = 0.125;
    vertices = new Array(Math.pow(s,2)*3);
    indices = [];
    faceNormals = [];
    verticeNormals = [];

    this.angle = 0;
    this.scale = scale;

    // Initialize Corners
    vertices[0] = -25.0;
    vertices[1] = 0.0;
    vertices[2] = -25.0;

    vertices[(s-1)*3] = 25.0;
    vertices[(s-1)*3+1] = 0.0;
    vertices[(s-1)*3+2] = -25.0;

    vertices[(Math.pow(s,2)-Math.pow(2,n)-1)*3] = -25.0;
    vertices[(Math.pow(s,2)-Math.pow(2,n)-1)*3+1] = 0.0;
    vertices[(Math.pow(s,2)-Math.pow(2,n)-1)*3+2] = 25.0;

    vertices[(Math.pow(s,2)-1)*3] = 25.0;
    vertices[(Math.pow(s,2)-1)*3+1] = 0.0;
    vertices[(Math.pow(s,2)-1)*3+2] = 25.0;

    for (var l = 1; l < n+1; l++) {
        a = (s-1)/Math.pow(2,l);
        step = 2*a;
        r = roughness * a;


        // Square Step
        for (var i = a; i < s; i+=step) {
            for (var j = a; j < s; j+=step) {
                average = (
                    vertices[(s*(j-a)+(i-a))*3+1]+
                    vertices[(s*(j-a)+(i+a))*3+1]+
                    vertices[(s*(j+a)+(i-a))*3+1]+
                    vertices[(s*(j+a)+(i+a))*3+1]
                )/4.0
                //console.log(s*(j-x)+(i+x));

                vertices[(s*j+i)*3] = -25.0 + (50.0*i)/(s-1.0);//x
                vertices[(s*j+i)*3+1] = average + Math.floor(Math.random()*2)*2*r - r; //y
                vertices[(s*j+i)*3+2]  = -25.0 + (50.0*j)/(s-1.0);//z
            }

        }

        b = a

        // Diamond Step
        for (var i = 0; i < s-1; i+=a) {
            for (var j = b; j < s-1; j+=(2*a)) {

                var xWrap = false;
                var yWrap = false;
                var p1, p2, p3, p4;

                if (i - a < 0) {
                    p1 = (s*(j)+s-a-1);
                    p2 = (s*(j)+i+a);
                    xWrap = true;
                } else {
                    p1 = (s*(j)+i-a);
                    p2 = (s*(j)+i+a);
                }

                if (j - a < 0) {
                    p3 = (s*(s-a-1)+i);
                    p4 = (s*(j+a)+i);
                    yWrap = true;
                } else {
                    p3 = (s*(j-a)+i);
                    p4 = (s*(j+a)+i);
                }

                average = (
                    vertices[p1*3+1]+
                    vertices[p2*3+1]+
                    vertices[p3*3+1]+
                    vertices[p4*3+1]
                )/4.0;

                var newHeight = average + Math.floor(Math.random()*2)*2*r - r;

                vertices[(s*j+i)*3] = -25.0 + (50.0*i)/(s-1.0);//x
                vertices[(s*j+i)*3+1] = newHeight; //y
                vertices[(s*j+i)*3+2]  = -25.0 + (50.0*j)/(s-1.0);//z
                                
                if (xWrap) {
                    vertices[(s*j+s-1)*3] = 25;//x
                    vertices[(s*j+s-1)*3+1] = newHeight;//y
                    vertices[(s*j+s-1)*3+2]  = -25.0 + (50.0*j)/(s-1.0);//z
                }

                if (yWrap) {
                    vertices[(s*(s-1)+i)*3] = -25.0 + (50.0*i)/(s-1.0);//x
                    vertices[(s*(s-1)+i)*3+1] = newHeight;//y
                    vertices[(s*(s-1)+i)*3+2]  = 25;//z
                }
            }
            b = a - b;
        }
    }

    // Water Cut Off
    for (var i = 1; i < (Math.pow(s,2)-1)*3+2; i+=3) {
        if (vertices[i] < 0) {
            vertices[i] = 0;
        }
    }

    //console.log(vertices);
    

    
    /************ Create the index list ************/
    
    // build the wireframe
    var indices = [];

    for (var i = 0; i < s-1; i++){    
         for (var j = 0; j < s; j++){
            indices.push(i*s+j);
            indices.push((i+1)*s+j);
        }
        
    }
       
        

    // Calculate Face Normals
    for (var i = 0; i < s-1; i++) {
        for (var j = 0; j < s-1; j++) {

            var u = vec3(
                    vertices[(s*(j+1)+i)*3]-vertices[(s*j+i)*3],
                    vertices[(s*(j+1)+i)*3+1]-vertices[(s*j+i)*3+1],
                    vertices[(s*(j+1)+i)*3+2]-vertices[(s*j+i)*3+2]
                );

            var v = vec3(
                    vertices[(s*j+i+1)*3]-vertices[(s*j+i)*3],
                    vertices[(s*j+i+1)*3+1]-vertices[(s*j+i)*3+1],
                    vertices[(s*j+i+1)*3+2]-vertices[(s*j+i)*3+2]
                );

            //console.log(normalize(cross(u,v)));
            faceNormals.push(normalize(cross(u,v)));


            u = vec3(
                    vertices[(s*(j)+i+1)*3]-vertices[(s*(j+1)+i+1)*3],
                    vertices[(s*(j)+i+1)*3+1]-vertices[(s*(j+1)+i+1)*3+1],
                    vertices[(s*(j)+i+1)*3+2]-vertices[(s*(j+1)+i+1)*3+2]
                );

            v = vec3(
                    vertices[(s*(j+1)+i)*3]-vertices[(s*(j+1)+i+1)*3],
                    vertices[(s*(j+1)+i)*3+1]-vertices[(s*(j+1)+i+1)*3+1],
                    vertices[(s*(j+1)+i)*3+2]-vertices[(s*(j+1)+i+1)*3+2]
                );

            //console.log(normalize(cross(u,v)));


            faceNormals.push(normalize(cross(u,v)));
 
        }
    }

    //Calculate Vertice Normals

    a = (s-1);
    b = (s-1)*2

    
    for (var i = 0; i < s; i++) {
        for (var j = 0; j < s; j++) {
            var normal = vec3(0.0,0.0,0.0);

            var f1, f2, f3, f4, f5, f6

            function wrap(x,wl) {
                answer = x;
                if (x < 0 || x > wl-1) {
                    answer = wl - Math.abs(x - 1);
                    /*
                    console.log(x);
                    console.log(wl);
                    console.log(answer);
                    console.log();
                    */
                }

                return answer;
            }


            normal = add(normal, vec3(faceNormals[b*wrap(j,a)+wrap(i*2,b)]));
            normal = add(normal, vec3(faceNormals[b*wrap(j,a)+wrap(i*2-1,b)]));
            normal = add(normal, vec3(faceNormals[b*wrap(j,a)+wrap(i*2-2,b)]));
            normal = add(normal, vec3(faceNormals[b*wrap(j-1,a)+wrap(i*2,b)]));
            normal = add(normal, vec3(faceNormals[b*wrap(j-1,a)+wrap(i*2-1,b)]));
            normal = add(normal, vec3(faceNormals[b*wrap(j-1,a)+wrap(i*2-2,b)]));
            

            verticeNormals.push(normalize(normal));
        }
    }
   
    vertices = new Float32Array(vertices);
    indices = new Uint16Array(indices);
    verticeNormals = new Float32Array(verticeNormals);
    
    vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }


    indexBuffer = gl.createBuffer();
    if (!indexBuffer) {
        console.log('Failed to create the index buffer object');
        return -1;
    }

    normalBuffer = gl.createBuffer();
    if (!normalBuffer) {
        console.log('Failed to create the index buffer object');
        return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.DYNAMIC_DRAW);

 

    var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get position location');
        return -1;
    }

       gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verticeNormals, gl.STATIC_DRAW);

    var a_Normal= gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get storage location');
        return -1;
    }
    
    var u_Coloring = gl.getUniformLocation(gl.program, 'u_Coloring');
    if (u_Coloring < 0) {
        console.log('Failed to get coloring uniform');
        return -1;
    }
    
    // set the polygon offset
    gl.polygonOffset(1.0, 1.0);
    
    

    
    
    /*
     *This handles the animation.
     *
     *When called, it computes a new angle and then updates all of the heights in the field before passing
     *everything back down to the VBO.
     */
    this.update = function(elapsed){
        this.angle = (this.angle + (90 * elapsed) / 1000.0) % 360;
        
     
        for (var i = 0; i < s; i++){
            for (var j = 0; j < s; j++){
                var x = (i - s/2);
                var z = (j - s/2);
                var index = (i * s + j) *3 + 1;
                var data = this.heightFunction(x,z);
                vertices[index] = data;
            }
        }
      
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

        
    }
    
    
    /*
     * Draw the function. The arguments tell us what we want to render.
     */
    this.draw = function(){
        gl.uniformMatrix4fv(gl.u_ViewMatrix, false, flatten(currentTransformMatrix));

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);


        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0,0);
        gl.enableVertexAttribArray(a_Position);

        // set the association for the normal attribute
        gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0,0);
        gl.enableVertexAttribArray(a_Normal);
        
        var offset;
             
        offset = s*s*indices.BYTES_PER_ELEMENT*2; // skip past the lines
        gl.uniform1i(u_Coloring, 1); // do depth based coloring
        gl.enable(gl.POLYGON_OFFSET_FILL); // drop the skin back away from the lines


        var offset = 0;
        
        // loop through the bands
        for (var i = 0; i < s-1; i++){
            gl.drawElements(gl.TRIANGLE_STRIP, s*2, gl.UNSIGNED_SHORT,offset);
            offset += (s*2)* indices.BYTES_PER_ELEMENT;

        }

        gl.disable(gl.POLYGON_OFFSET_FILL);
       
       
    }
}
