import * as React from 'react';
import Topdown from './topdown';
import Perspective from './perspective';

export default class View extends React.Component<any, {perspective:boolean}>
{
    constructor(props:any)
    {
        super(props);
        this.state = {perspective:true};
    }

    componentDidMount()
    {
        window.addEventListener("mousedown", (e)=>
        {
          
        });

        window.addEventListener("mouseup", (e)=>
        {
          
        });

        window.addEventListener("wheel", (e)=>
        {
         
        });

        window.addEventListener('contextmenu', (e) =>
        {
            e.preventDefault();
            return false;
        });

        window.addEventListener("keydown", (e)=>
        {
            if (e.keyCode == 13) // enter
            {
                this.setState({perspective:!this.state.perspective});
            }
            
            console.log(e.keyCode);
        });
    }

    render()
    {
        return (
            <div>
                <div className="fullscreen" style={{display:this.state.perspective ? 'block' : 'none'}}>
                    <Perspective enable = {this.state.perspective}/>
                </div>
                <div className="fullscreen" style={{display:!this.state.perspective ? 'block' : 'none'}}>
                    <Topdown enable = {!this.state.perspective}/>
                </div>
            </div>
        );
    }
}