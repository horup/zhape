import * as React from 'react';

export default class Topdown extends React.Component<any, {width:number, height:number}>
{
    constructor(props)
    {
        super(props);
        this.state = {width:window.innerWidth, height:window.innerHeight}
    }
    canvas:HTMLCanvasElement;
    componentDidMount()
    {
        let context = this.canvas.getContext('2d');
        context.fillStyle = 'red';
        context.fillRect(0,0, 10, 10);
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