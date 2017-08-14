import * as React from 'react';
import {State} from './../../model';
export default class Perspective extends React.Component<{enable:boolean, sharedState:State}, any>
{
    sharedState:State;

    constructor(props:any)
    {
        super(props);
        this.sharedState = props.sharedState;
    }

    render()
    {
        return (
            <div>
                {this.sharedState.map.edges.length}
            </div>
        );
    }
}