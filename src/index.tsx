require("./style.css");
import * as React from 'react';
import * as Dom from 'react-dom';
import Body from './view/body';
import * as M from './math';

console.log(JSON.stringify(M.findLoop([])));
console.log(JSON.stringify(M.findLoop([[0,1], [1,5], [2,0]])));
console.log(JSON.stringify(M.findLoop([[0,1], [1,2], [2,0]])));
console.log(JSON.stringify(M.findLoop([[0,1], [1,2], [2,3], [3,4], [4,1]])));
console.log(JSON.stringify(M.findLoop([[0,1], [1,2], [2,3], [3,4], [4,1]])));
console.log(JSON.stringify(M.findLoop([[0,1], [1,2], [2,3], [3,4] , [4,0]])));

var main = document.createElement('div');
document.body.appendChild(main);
Dom.render(<Body/>, main);