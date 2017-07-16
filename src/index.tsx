require("./style.css");
import * as React from 'react';
import * as Dom from 'react-dom';
import Body from './view/body';
import * as M from './math';

var main = document.createElement('div');
document.body.appendChild(main);
Dom.render(<Body/>, main);