import * as React from 'react';
import {State} from './../../model';
import * as THREE from 'three';

export default class Perspective extends React.Component<{enable:boolean, sharedState:State}, any>
{
    canvas:HTMLCanvasElement;
    width:number;
    height:number;
    sharedState:State;
    scene:THREE.Scene = new THREE.Scene(); 
    renderer:THREE.WebGLRenderer;
    camera:THREE.Camera;

    constructor(props:any)
    {
        super(props);
        this.sharedState = props.sharedState;
    }

    componentDidMount()
    {
        this.renderer = new THREE.WebGLRenderer({canvas:this.canvas});
        this.renderer.setClearColor( 0xff0000, 1 );
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
        this.animate();
    }

    lambda = ()=>this.animate();
    private animate()
    {
        let time = new Date().getTime();
        this.resize();

        this.renderer.render(this.scene, this.camera);

        requestAnimationFrame(this.lambda);
    }

    resize()
    {
        if (this.width != window.innerWidth || this.height != window.innerHeight)
        {
            let cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 10000);
            this.camera.copy(cam);
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.up.set(0,0,1);
            this.camera.position.set(0, 0, 0.5);
            
            this.camera.lookAt(new THREE.Vector3(32, -32, 0.5));
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        }
    }

    render()
    {
        return (
            <div>
                <canvas ref={(ref)=>this.canvas = ref}/>
            </div>
        );
    }
}