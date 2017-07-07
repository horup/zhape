require("./style.css");
import * as React from 'react';
import * as Dom from 'react-dom';
import Body from './view/body';

var main = document.createElement('div');
document.body.appendChild(main);
Dom.render(<Body/>, main);