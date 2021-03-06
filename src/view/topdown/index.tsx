import * as React from 'react';
import Renderer from './renderer';
import {State} from './../../model';
export default class Topdown extends React.Component<{enable:boolean, sharedState:State}, {width:number, height:number}>
{
    ctrl = false;
    renderer:Renderer;
    sharedState:State;
    constructor(props)
    {
        super(props);
        this.state = {width:window.innerWidth, height:window.innerHeight};
        this.sharedState = props.sharedState;
    }

    canvas:HTMLCanvasElement;
    componentDidMount()
    {
        let context = this.canvas.getContext('2d');
        this.renderer = new Renderer(context, this.sharedState);
        this.renderer.animate();
        window.addEventListener("resize", () => 
        {
            this.setState({width:window.innerWidth, height:window.innerHeight});
        });

        window.addEventListener("mousedown", (e)=>
        {
            if (!this.props.enable)
                return;
            if (e.button == 0)
                this.renderer.input.leftdown = true;
            else
                this.renderer.input.rightdown = true;
        });

        window.addEventListener("mouseup", (e)=>
        {
            if (!this.props.enable)
                return;

            if (e.button == 0)
                this.renderer.input.leftdown = false;
            else
                this.renderer.input.rightdown = false;
        });

        window.addEventListener("wheel", (e)=>
        {
            if (!this.props.enable)
                return;
            let dir = Math.sign(e.deltaY);
            this.renderer.input.zoom = dir;
        });

        window.addEventListener("keydown", (e)=>
        {
            if (!this.props.enable)
                return;
            console.log(e.keyCode);
            if (e.keyCode == 32)
            {
                this.renderer.input.ins = true;
            }
            else if (e.keyCode == 53)
            {
                this.renderer.input.save = true;
            }
            else if (e.keyCode == 54)
            {
                this.renderer.input.load = true;
            }
            else if (e.keyCode == 71)
            {
                this.renderer.input.grid = true;
            }
            else if (e.keyCode == 17)
                this.ctrl = true;
             else if (e.keyCode == 90 && this.ctrl)
                this.renderer.input.undo = true;
        });

        window.addEventListener("keyup", (e)=>
        {
            if (!this.props.enable)
                return;
            if (e.keyCode == 17)
                this.ctrl = false;
        });

        window.addEventListener("mousemove", (e)=>
        {
            if (!this.props.enable)
                return;
            this.renderer.input.mouseX = e.x;
            this.renderer.input.mouseY = e.y;
        });
    }

    render()
    {
        return (
            <div>
                <canvas width={this.state.width} height={this.state.height} ref={(ref)=>this.canvas = ref}/>
            </div>
        );
    }
}