import * as React from 'react';
import Renderer from './renderer';
export default class Topdown extends React.Component<any, {width:number, height:number}>
{
    renderer:Renderer;
    constructor(props)
    {
        super(props);
        this.state = {width:window.innerWidth, height:window.innerHeight}
    }

    canvas:HTMLCanvasElement;
    componentDidMount()
    {
        let context = this.canvas.getContext('2d');
        this.renderer = new Renderer(context);
        this.renderer.animate();
        window.addEventListener("resize", () => 
        {
            this.setState({width:window.innerWidth, height:window.innerHeight});
        });

        window.addEventListener("click", (e)=>
        {
            console.log(e);
        });

        window.addEventListener("mousemove", (e)=>
        {
            console.log(e);
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