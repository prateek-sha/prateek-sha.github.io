var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:'#1B142E',
};


var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
        renderer, container;
        
        const mouse = new THREE.Vector2();
        const target = new THREE.Vector2();

        const windowHalf = new THREE.Vector2( window.innerWidth / 2, window.innerHeight / 2 );
function createScene() {
	// Get the width and the height of the screen,
	// use them to set up the aspect ratio of the camera 
	// and the size of the renderer.
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;

	// Create the scene
	scene = new THREE.Scene();

	// Add a fog effect to the scene; same color as the
	// background color used in the style sheet
	scene.fog = new THREE.Fog(0xf7d9aa, 100, 950);
	
	// Create the camera
	aspectRatio = WIDTH / HEIGHT;
	fieldOfView = 60;
	nearPlane = 1;
	farPlane = 10000;
	camera = new THREE.PerspectiveCamera(
		fieldOfView,
		aspectRatio,
		nearPlane,
		farPlane
		);
	
	// Set the position of the camera
	camera.position.x = 0;
	camera.position.z = 200;
	camera.position.y = 100;
	
	// Create the renderer
	renderer = new THREE.WebGLRenderer({ 
		// Allow transparency to show the gradient background
		// we defined in the CSS
		alpha: true, 

		// Activate the anti-aliasing; this is less performant,
		// but, as our project is low-poly based, it should be fine :)
		antialias: true 
	});

	// Define the size of the renderer; in this case,
	// it will fill the entire screen
	renderer.setSize(WIDTH, HEIGHT);
	
	// Enable shadow rendering
	renderer.shadowMap.enabled = true;
	
	// Add the DOM element of the renderer to the 
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);
	
	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}


function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

var hemisphereLight, shadowLight;

function createLights() {
	// A hemisphere light is a gradient colored light; 
	// the first parameter is the sky color, the second parameter is the ground color, 
	// the third parameter is the intensity of the light
	hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)
	
	// A directional light shines from a specific direction. 
	// It acts like the sun, that means that all the rays produced are parallel. 
	shadowLight = new THREE.DirectionalLight(0xffffff, .9);

	// Set the direction of the light  
	shadowLight.position.set(150, 350, 350);
	
	// Allow shadow casting 
	shadowLight.castShadow = true;

	// define the visible area of the projected shadow
	shadowLight.shadow.camera.left = -400;
	shadowLight.shadow.camera.right = 400;
	shadowLight.shadow.camera.top = 400;
	shadowLight.shadow.camera.bottom = -400;
	shadowLight.shadow.camera.near = 1;
	shadowLight.shadow.camera.far = 1000;

	// define the resolution of the shadow; the higher the better, 
	// but also the more expensive and less performant
	shadowLight.shadow.mapSize.width = 2048;
	shadowLight.shadow.mapSize.height = 2048;
	
	// to activate the lights, just add them to the scene
	scene.add(hemisphereLight);  
	scene.add(shadowLight);
}



Moon = function(){
    var loader = new THREE.TextureLoader();
    loader.crossOrigin = '';
    var texture = loader.load('moon.jpg');
    var geom = new THREE.SphereGeometry(1,32,64);
    var mat = new THREE.MeshBasicMaterial({
        color:Colors.white,
        side: THREE.DoubleSide
      });

      this.mesh = new THREE.Mesh(geom, mat);
     


}


Sea = function(){
	
	var geom = new THREE.CylinderGeometry(80,80,1000,40,10);
	geom.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
	geom.mergeVertices();

	var l = geom.vertices.length;

	this.waves = [];

	for (var i=0; i<l; i++){
		// get each vertex
		var v = geom.vertices[i];

		// store some data associated to it
		this.waves.push({y:v.y,
						 x:v.x,
						 z:v.z,
						 // a random angle
                         ang:Math.random()*Math.PI*2,
                        // a random distance
                         amp:5 + Math.random()*25,
                        // a random speed between 0.016 and 0.048 radians / frame
                         speed:0.016 + Math.random()*0.032
                    });
	};
	// create the material 
	var mat = new THREE.MeshBasicMaterial({
		color:Colors.blue,
		transparent:false,
		opacity:1,
		shading:THREE.FlatShading,
	});


	this.mesh = new THREE.Mesh(geom, mat);
	this.mesh.receiveShadow = true; 
}


Star = function(){
    var geom = new THREE.SphereGeometry(0.3,32,32);
    var mat = new THREE.MeshBasicMaterial({
        color:Colors.white,
        side: THREE.DoubleSide
    });
    this.stars = []
    for (let i = -100; i < 100; i++) {
        let star = new THREE.Mesh( geom, mat );
        //star.position.x = normalize(getRandom(), -.75,.75,-100, 100);
        star.position.y = Math.floor(Math.random()*150) + 50;
        star.position.x = Math.floor(Math.random()*550) - 300;
        star.position.z = i;
        star.material.side = THREE.DoubleSide;
        star.scale.x = star.scale.y = 2;
        this.stars.push( star );
    }
}



var sea;

function createSea(){
	sea = new Sea();
	sea.mesh.position.y = -55;
	scene.add(sea.mesh);
}

var moon;

function createMoon(){
    moon = new Moon();
    moon.mesh.position.set(-80, 140 , -50);
    moon.mesh.scale.setScalar(35);
    scene.add(moon.mesh);
}

var star;

function createStar(){
    star = new Star();
    for (let j = 0; j < star.stars.length; j++) {
        scene.add( star.stars[j] );
      }
}

Sea.prototype.moveWaves = function (){
	
	// get the vertices
	var verts = this.mesh.geometry.vertices;
	var l = verts.length;
	
	for (var i=0; i<l; i++){
		var v = verts[i];
		
		// get the data associated to it
		var vprops = this.waves[i];
		
		// update the position of the vertex
		v.x = vprops.x + Math.cos(vprops.ang)*vprops.amp;
		v.y = vprops.y + Math.sin(vprops.ang)*vprops.amp;

		// increment the angle for the next frame
		vprops.ang += vprops.speed;

	}
	this.mesh.geometry.verticesNeedUpdate=true;

	sea.mesh.rotation.z += .005;
}


function normalize(v,vmin,vmax,tmin, tmax){
    var nv = Math.max(Math.min(v,vmax), vmin);
    var dv = vmax-vmin;
    var pc = (nv-vmin)/dv;
    var dt = tmax-tmin;
    var tv = tmin + (pc*dt);
    return tv;
  }

function onMouseMove( event ) {

	mouse.x = ( event.clientX - windowHalf.x );
	mouse.y = ( event.clientY - windowHalf.x );

}
var lightness = 0;
function movestar() {
    for (let k = 0; k < star.stars.length; k++) {
        let sta = star.stars[k];
       // sta.position.x = ;
        sta.position.z +=  k/100;
        //sta.rotation.z += .01;
        if(sta.position.z>100) sta.position.z-=200; 
        // lightness > 100 ? lightness = 0 : lightness++;
        // sta.material.color = new THREE.Color("hsl(0, 0%, " + lightness * .56 + "%)");
    }
}

function loop(){
	// Rotate the propeller, the sea and the sky
	//airplane.propeller.rotation.x += 0.3;
	//sea.mesh.rotation.z += .005;
	//sky.mesh.rotation.z += .01;
    target.x = (1 - normalize(mouse.x * 0.002 ,-.75,.75,-50, 100)) * 0.002 ;
    //target.x = (1 - mouse.x) * 0.002;
    //target.y = ( 1 - mouse.y ) * 0.002;
    target.y = (1 - normalize(mouse.y, -.75,.75,25, 175)) * 0.002;
    camera.rotation.x += 0.05 * ( target.y - camera.rotation.x );
    camera.rotation.y += 0.05 * ( target.x - camera.rotation.y );
	// render the scene
	renderer.render(scene, camera);
    movestar();

	// call the loop function again
	requestAnimationFrame(loop);
}



function init(event){
    createScene();
    createLights();
    createMoon();
    createStar();
    createSea();
    
    sea.moveWaves();
    
    loop();
    document.addEventListener( 'mousemove', onMouseMove, false );
}

window.addEventListener('load', init, false);
