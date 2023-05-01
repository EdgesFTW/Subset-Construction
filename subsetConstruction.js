
/*
    Things to add:
        1. add tracking and display of start/end states
        2. interpolating transitions with bezier curves
        3. ability to change alphabet in gui
        4. options pane for colors and font
        5. add a pause button for the animation

*/


var ctx1;
var ctx2;
var text;
var options;
var width,height;

var node_list1 = new Map();
var node_list2 = new Map();
var highlighted = new Map();
var alphabet = ["0","1"];

var last_grabbed = undefined
var grabbed_node = undefined;
var mouse = {x1:0,y1:0,x2:0,y2:0};
var waitingForClick = false;

var HOLD_TIME = 1000; // how long will groups of highlighted nodes stay in milliseconds
var TIME_BETWEEN_NODES = 500; // how long of a delay between highlighting nodes in milliseconds


function sendOptions(){
    window.optionsPending = false;
}
async function setConstants() {
    let hold_time = document.querySelector('#HOLD_TIME');
    let time_between_nodes = document.querySelector('#TIME_BETWEEN_NODES');

    hold_time.value = HOLD_TIME;
    time_between_nodes.value = TIME_BETWEEN_NODES;
    options.hidden = false;
    window.optionsPending = true;
    while(window.optionsPending == true){
        await timeout(50); // pauses script
    }
    options.hidden = true;

    HOLD_TIME = hold_time.value;
    TIME_BETWEEN_NODES = time_between_nodes.value;

    console.log(TIME_BETWEEN_NODES)


}

window.tmp = true;

function draw(milliseconds) {

    if(!window.waitingForClick)
    {
        next = false;
    }
    window.esc = false;

    // console.log(grabbed_node)

    ctx1.clearRect(0,0,width*1.1,height*1.1);
    ctx2.clearRect(0,0,width*1.1,height*1.1);

    if(grabbed_node != undefined && !window.waitingForClick){
        if(node_list1.has(grabbed_node.id) && grabbed_node.nodes==null){ // checking if grabbed node is in canvas1
            grabbed_node.x = mouse.x1;
            grabbed_node.y = mouse.y1;
        }
        else if(node_list2.has(grabbed_node.id)){
            grabbed_node.x = mouse.x2;
            grabbed_node.y = mouse.y2;
        }
        else{
            console.log("grabbed node error");
        }
    }
    
    node_list1.forEach(node => {

        // draw circle and fill it
        ctx1.lineWidth = 5;
        ctx1.strokeStyle  = "#000000";
        if(node.accepting){
            ctx1.strokeStyle  = "#008F00";
        }
        ctx1.beginPath();
        ctx1.arc((node.x+1)*width/2, (node.y+1)*height/2, node.radius*height/8, 0, 2 * Math.PI,true);
        ctx1.fillStyle = "#6d707a";
        if(highlighted.has(node.id)){
            ctx1.fillStyle = "#0000AF";
        }else if(node.starting){
            ctx1.fillStyle = "#AF0000";
        }
        ctx1.stroke(); 
        ctx1.fill();

        // draw text
        ctx1.fillStyle = "#00FF00";
        ctx1.font = "10px Arial";
        ctx1.fillText(node.id, (node.x+1)*width/2, (node.y+1)*height/2);

        // draw transitions
        let drawn = {};
        node.nexts.forEach(outerTransition => {
            let transitionArr = [];
            if(drawn[outerTransition.val]!=true){
                transitionArr.push(outerTransition.t);
            }
            drawn[outerTransition.val] = true;
            node.nexts.forEach(innerTransition => {
                if(outerTransition.t!=innerTransition.t && outerTransition.val==innerTransition.val){ //drawn[innerTransition.val]!=true && 
                    transitionArr.push(innerTransition.t);
                    drawn[innerTransition.val] = true;
                }
            })
            drawTransition(node,node_list1.get(outerTransition.val),"#000000",String(transitionArr.join(",")),ctx1);
        });
        // console.log(drawn);
        window.tmp = false;
        
    });

    node_list2.forEach(node => {

        // draw circle and fill it
        ctx2.lineWidth = 5;
        ctx2.strokeStyle = "#000000";
        if(node.accepting){
            ctx2.strokeStyle  = "#008F00";
        }
        ctx2.beginPath();
        ctx2.arc((node.x+1)*width/2, (node.y+1)*height/2, node.radius*height/8, 0, 2 * Math.PI);
        ctx2.fillStyle = "#6d707a";
        if(node.starting){
            ctx2.fillStyle = "#AF0000";
        }
        ctx2.stroke(); 
        ctx2.fill();

        // draw text
        ctx2.fillStyle = "#00FF00";
        ctx2.font = "10px Arial";
        ctx2.fillText(node.id, (node.x+1)*width/2, (node.y+1)*height/2);

        // draw transitions
        let drawn = {};
        node.nexts.forEach(outerTransition => {
            let transitionArr = [];
            if(drawn[outerTransition.val]!=true){
                transitionArr.push(outerTransition.t);
            }
            drawn[outerTransition.val] = true;
            node.nexts.forEach(innerTransition => {
                if(outerTransition.t!=innerTransition.t && outerTransition.val==innerTransition.val){ //drawn[innerTransition.val]!=true && 
                    transitionArr.push(innerTransition.t);
                    drawn[innerTransition.val] = true;
                }
            })
            drawTransition(node,node_list2.get(outerTransition.val),"#000000",String(transitionArr.join(",")),ctx2);
        });
        
    });

    requestAnimationFrame(draw)
}
async function setup(event) {
    window.options = document.querySelector('#options');
    window.text = document.querySelector('#text');
    window.canvas1 = document.querySelector('#canvas1');
    window.canvas2 = document.querySelector('#canvas2');
    ctx1 = window.canvas1.getContext('2d');
    ctx2 = window.canvas2.getContext('2d');
    window.canvas1.width = document.body.clientWidth/2;
    window.canvas1.height = document.body.clientHeight;
    window.canvas2.width = document.body.clientWidth/2;
    window.canvas2.height = document.body.clientHeight;
    
    width = document.body.clientWidth/2;
    height = document.body.clientWidth/2;
    node_list1.set("0",{id:"0", x: -0.5, y: -0.5, starting: false, accepting: false, radius: 1/4, nexts: [{t:"e",val:"1"},{t:"1",val:"3"}]});
    node_list1.set("1",{id:"1", x: 0.0, y: 0.0, starting: true, accepting: false, radius: 1/4, nexts: [{t:"e",val:"2"},{t:"0",val:"3"}]});
    node_list1.set("2",{id:"2", x: 0.7, y: -0.2, starting: false, accepting: false, radius: 1/4, nexts: [{t:"1",val:"4"}]});
    node_list1.set("3",{id:"3", x: -0.4, y: 0.3, starting: false, accepting: true, radius: 1/4, nexts: []});
    node_list1.set("4",{id:"4", x: 0.4, y: 0.3, starting: false, accepting: true, radius: 1/4, nexts: []});
    

    text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

    // add user provided node
    let custom_node = false; // enable/disable adding a custom node
    if(custom_node){
        tmpID = parseInt(prompt("id:"));
        tmpX = Number(prompt("x(-1,1):"));
        tmpY = Number(prompt("y(-1,1):"));
        tmpNext = {t:"e", val:parseInt(prompt("Points to id:"))};
        node_list1.set(tmpID,{id: tmpID, x: tmpX, y: tmpY, radius: height/40, nexts: [tmpNext]});
    }

    window.addEventListener("mousedown",(event =>{
        let can1 = window.canvas1.getBoundingClientRect();
        let x1 = (event.clientX - can1.left)*2/width-1;
        let y1 = (event.clientY - can1.top)*2/height-1;
        let can2 = window.canvas2.getBoundingClientRect();
        let x2 = (event.clientX - can2.left)*2/width-1;
        let y2 = (event.clientY - can2.top)*2/height-1;
        
        
        for(const node of node_list1){
            let dx = x1 - node[1].x;
            let dy = y1 - node[1].y;
            
            if(Math.sqrt(dx*dx+dy*dy)<node[1].radius/4){
                grabbed_node = node[1];
            }
        }
        for(const node of node_list2){
            let dx = x2 - node[1].x;
            let dy = y2 - node[1].y;
            
            if(Math.sqrt(dx*dx+dy*dy)<node[1].radius/4){
                grabbed_node = node[1];
            }
        }
        
        window.next = true;
        // console.log(next)

    }));
    window.addEventListener("mouseup",(event =>{
        grabbed_node = undefined;
    }));
    window.addEventListener("mousemove",(event =>{
        let can1 = window.canvas1.getBoundingClientRect();
        let x1 = (event.clientX - can1.left)*2/width-1;
        let y1 = (event.clientY - can1.top)*2/height-1;
        mouse.x1 = x1;
        mouse.y1 = y1;
        let can2 = window.canvas2.getBoundingClientRect();
        let x2 = (event.clientX - can2.left)*2/width-1;
        let y2 = (event.clientY - can2.top)*2/height-1;
        mouse.x2 = x2;
        mouse.y2 = y2;
    }));

    requestAnimationFrame(draw)
}

function resizeCanvas() {
    window.canvas1.width = document.body.clientWidth/2;
    window.canvas1.height = document.body.clientWidth/2;
    // window.canvas1.height = window.innerHeight;
    window.canvas2.width = document.body.clientWidth/2;
    window.canvas2.height = document.body.clientWidth/2;
    // window.canvas2.height = window.innerHeight;
    width = document.body.clientWidth/2;
    height = document.body.clientWidth/2;
}

const timeout = async ms => new Promise(res => setTimeout(res, ms));
window.next = false; // this is to be changed on user input
// window.waitingForClick = false;

async function waitUserInput() {
    while (window.next === false) {
        // console.log('spinning')
        await timeout(50); // pauses script
    }
    window.next = false; // reset var
}

async function changeStarting(){
    text.innerHTML = "Click node to make it the starting node!";
    
    /* get node node */
    let node = undefined;
    window.waitingForClick = true;
    node = await waitUserToSelectNode();
    if(node === -1){
        // tear down
        text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

        return;
    }
    
    let id = node.id;
    window.waitingForClick = false;

    node_list1.forEach(tmpNode => {
        tmpNode.starting = false;
    })
    node.starting = true;

    // console.log(node)

    text.innerHTML = "Transitions to nowhere imply transitions to a trash state";
}

async function toggleAccepting(){

    text.innerHTML = "Click node to toggle accepting node!";


    /* get node node */
    let node = undefined;
    window.waitingForClick = true;
    node = await waitUserToSelectNode();
    if(node === -1){
        // tear down
        text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

        return;
    }
    let id = node.id;
    window.waitingForClick = false;

    /* toggle accepting */
    node.accepting = !node.accepting;


    text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

}

async function delNode(){
    text.innerHTML = "Click node to remove it!";
    
    /* get node node */
    let node = undefined;
    window.waitingForClick = true;
    node = await waitUserToSelectNode();
    if(node === -1){
        // tear down
        text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

        return;
    }
    let id = node.id;
    window.waitingForClick = false;

    let newNexts = [];

    node_list1.forEach(node1 => {
        newNexts = node1.nexts.filter(transition => {
            return transition.val!=id;
        });
        node1.nexts = newNexts;
    });

    node_list1.delete(node.id);

    text.innerHTML = "Transitions to nowhere imply transitions to a trash state";
    
}

async function addNode(){
    text.innerHTML = "Click location to add node";
    
    let id = "n1";
    while(node_list1.has(id)){
        id = "n"+(Number(id.substring(1))+1);
    }
    // console.log(id);
    
    window.waitingForClick = true;
    await waitUserInput(); 
    window.waitingForClick = false;
    
    text.innerHTML = "Transitions to nowhere imply transitions to a trash state";
    
    let x = mouse.x1;
    let y = mouse.y1;
    
    id = prompt("Node ID:",id)
    if(id==null){
        text.innerHTML = "Transitions to nowhere imply transitions to a trash state";
        return;
    }
    
    if(id!=null)
    {
        node_list1.set(id,{id:id, x: x, y: y, radius: 1/4, nexts: []})
    }
    
}

async function waitUserToSelectNode() {
    while (window.grabbed_node === undefined) {
        if(window.esc){
            return -1;
        }
        await timeout(20); // pauses script
    }
    let ret = window.grabbed_node;
    window.grabbed_node = undefined; // reset var
    return ret;
}

async function rmTransition(){ // refactor to alow users to choose the index of the transition instead of the character
    text.innerHTML = "Click state to select transition's source";
    
    /* get source node */
    let source = undefined;
    window.waitingForClick = true;
    source = await waitUserToSelectNode();
    if(source === -1){
        // tear down
        text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

        return;
    }
    window.waitingForClick = false;
    console.log(source)


    let newNexts = [];
    let t = undefined;
    let msg = "";
    while (t == undefined && !(t===null)) { // 
        t = prompt("Transition Character (epsilon = \e):\n"+msg,alphabet[0]);
        if(t==null){
            text.innerHTML = "Transitions to nowhere imply transitions to a trash state";
            return;
        }

        let retry = !source.nexts.some((ele) => {
            console.log(ele.t,t)
            console.log(typeof ele.t,typeof t)
            return ele.t==t;
        });
        // console.log("retry:",retry);
        
        if(retry){
            msg = "Bad transition!";
            console.log(t)
            t = undefined; // force user to input again
        }
        else{// transition is valid
            newNexts = source.nexts.filter(transition => transition.t!=t);
            // console.log(newNexts);
        }

    }
    if(!alphabet.includes(t)){
        alphabet.push(t);
    }
    

    if(t!=null)
    {
        source.nexts = newNexts;
    }


    text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

}
async function addTransition(){
    text.innerHTML = "Click state to select new transition's source";
    
    /* get source node */
    let source = undefined;
    window.waitingForClick = true;
    source = await waitUserToSelectNode();
    if(source === -1){
        // tear down
        text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

        return;
    }
    window.waitingForClick = false;
    // console.log(source)

    text.innerHTML = "Click state to select new transition's destination";
    
    /* get destination node */
    window.waitingForClick = true;
    let destination = await waitUserToSelectNode(); 
    if(destination === -1){
        // tear down
        text.innerHTML = "Transitions to nowhere imply transitions to a trash state";

        return;
    }
    window.waitingForClick = false;
    // console.log(source)


    let t = undefined;
    let msg = "";
    while (t == undefined && !(t===null)) { // 
        t = prompt("Transition Character (epsilon = \e):\n"+msg,alphabet[0]);
        if(t==null){
            text.innerHTML = "Transitions to nowhere imply transitions to a trash state";
            return;
        }

        if(t==""){
            msg = "Must include transition!";
            t = undefined; // force user to input again
        }
        else if(t==""){
            msg = "Must include transition!";
            t = undefined; // force user to input again
        }

    }
    if(!alphabet.includes(t)){
        alphabet.push(t);
    }
    

    if(t!=null)
    {
        source.nexts.push({t:t,val:destination.id});

    }


    text.innerHTML = "Transitions to nowhere imply transitions to a trash state";


    // let x = mouse.x1;
    // let y = mouse.y1;

    // id = prompt("Node ID:",id)
}

function drawTransition(node,dest,color,t,ctx){
    
    if(dest==null){
        return;
    }
    let nodeX = node.x;
    let nodeY = node.y;
    let destX = dest.x - ((dest.x-node.x)/Math.sqrt((dest.x - node.x)*(dest.x - node.x) + (dest.y - node.y)*(dest.y - node.y)))*node.radius/4;
    let destY = dest.y - ((dest.y-node.y)/Math.sqrt((dest.x - node.x)*(dest.x - node.x) + (dest.y - node.y)*(dest.y - node.y)))*node.radius/4;
    nodeX = nodeX + ((dest.x-node.x)/Math.sqrt((dest.x - node.x)*(dest.x - node.x) + (dest.y - node.y)*(dest.y - node.y)))*node.radius/4; 
    nodeY = nodeY + ((dest.y-node.y)/Math.sqrt((dest.x - node.x)*(dest.x - node.x) + (dest.y - node.y)*(dest.y - node.y)))*node.radius/4; 

    let diffX = destX - nodeX;
    let diffY = destY - nodeY;
    let mag = Math.sqrt(diffX*diffX + diffY*diffY);


    
    if(mag > 0){
        diffX = diffX/mag;
        diffY = diffY/mag;
    }
    else{ // dont draw if theres no line to draw.
        return;
    }
    
    let c = 0;
    let s = 1;

    let v1 = {x:diffX,y:diffY};
    let p = {x:1/2*(-v1.y),y:1/2*(v1.x)};
    let cp1 = {x:nodeX + 1/2*v1.x + 1/2*p.x,y:nodeY + 1/2*v1.y + 1/2*p.y};
    let cp2 = cp1;
    

    /* bezier curve */
    // ctx.beginPath();
    // ctx.moveTo((nodeX+1)*width/2, (nodeY+1)*height/2);
    // ctx.bezierCurveTo((cp1.x+1)*width/2, (cp1.y+1)*height/2, (cp2.x+1)*width/2, (cp2.y+1)*height/2, (destX+1)*width/2, (destY+1)*height/2);
    // ctx.stroke();

    // ctx.fillStyle = "red";
    // ctx.beginPath();
    // ctx.arc((cp1.x+1)*width/2, (cp1.y+1)*height/2, 5, 0, 2 * Math.PI); // Control point one
    // ctx.arc((cp2.x+1)*width/2, (cp2.y+1)*height/2, 5, 0, 2 * Math.PI); // Control point two
    // ctx.fill();

    // draw arrow line
    ctx.lineWidth = 1;
    ctx.strokeStyle  = "#000000";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo((nodeX+1)*width/2, (nodeY+1)*height/2);
    ctx.lineTo((destX+1)*width/2, (destY+1)*height/2);
    ctx.stroke();
    
    // draw arrow head
    const angle = Math.atan2((destY+1)*height/2 - (nodeY+1)*height/2, (destX+1)*width/2 - (nodeX+1)*width/2);
    ctx.beginPath();
    ctx.moveTo((destX+1)*width/2, (destY+1)*height/2);
    ctx.lineTo((destX+1)*width/2 - height/50 * Math.cos(angle - Math.PI / 6), (destY+1)*height/2 - height/50 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo((destX+1)*width/2 - height/50 * Math.cos(angle + Math.PI / 6), (destY+1)*height/2 - height/50 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();
    
    // draw text(id) on arrow
    ctx.fillStyle = "#FF0000";
    ctx.font = "15px Arial";
    ctx.fillText(t, (nodeX+1)*width/2 + 1/2*((destX+1)*width/2-(nodeX+1)*width/2), (nodeY+1)*height/2 + 1/2*((destY+1)*height/2-(nodeY+1)*height/2));

    return;
}

function dfs(nodelist,startNode,transition,boolean_descriptors){
    let stack = [];
    let currNode = {};
    stack.push(startNode);
    nodelist.push(startNode)
    while (stack.length > 0) {
        currNode = stack.pop();
        node_list1.get(currNode.id).nexts.forEach((node) => {
            if(node.t != transition){
                return; // really just a continue for a normal for each loop, stupid js
            }

            let nxtNode = node_list1.get(node.val);
            if (!nodelist.includes(nxtNode)) {
                nodelist.push(nxtNode);
                stack.push(nxtNode);
            }
        });
    }
}

function createState(node){
    let nodeList = []

    let boolean_descriptors = {starting_node:false, accepting_node: false};
    boolean_descriptors.starting_node = false;
    boolean_descriptors.accepting_node = false;
    if(node.starting){
        boolean_descriptors.starting_node = true;
    }
    

    // dfs to find connected component
    dfs(nodeList,node,"e",boolean_descriptors);
    nodeList = nodeList.map(tmpNode => tmpNode.id);
    
    // sort list of states accessible
    nodeList.sort();
    
    let x=0;
    let y=0;
    nodeList.forEach(id => {
        let curNode = node_list1.get(id);
        x += curNode.x;
        y += curNode.y;
    })
    x = x/nodeList.length;
    y = y/nodeList.length;

    // console.log(String(nodeList.join(",")),nodeList)

    if(nodeList.some( (n) => {return node_list1.get(n).accepting;})){
        boolean_descriptors.accepting_node = true;
    }

    // form return object, should contain original node and which nodes it can access
    let returnObj = {id: String(nodeList.join(",")), x: x, y: y, radius: 1/4, original: node.id, nodes: nodeList, starting: boolean_descriptors.starting_node, accepting: boolean_descriptors.accepting_node};

    return returnObj;
}


async function subsetConstruction(){
    let newNodeList = []; // used to replace node_list1
    let nodeListFull = []; // used for translating transitions 
    
    // for each node in the list, create a new state of possible states. 
    node_list1.forEach(node => {
        state = createState(node);
        nodeListFull.push(state);
    });

    // set transitions of new list
    nodeListFull.forEach(node => {
        node.nexts = [];
    })
    
    // get the states defined by transitions other than epsilon transitions
    for (let i=0; i<nodeListFull.length; i++){
        let curNode = nodeListFull[i];
        alphabet.forEach(char => { // for each node in the new "state", find the nodes(old) that each letter can get to 
            let nodes = [];
            curNode.nodes.forEach(node => { 
                let transitions = node_list1.get(node).nexts.filter(ele => ele.t == char).map(tran => tran.val)
                transitions.forEach(transition => nodes.push(transition));
            });
            if(nodes.length !=0 && !nodeListFull.some(ele =>{ ele.id == String(nodes.join(",")) })){ // new subset state found, add it to list

                let unsorted = nodes.slice();

                nodes.sort();
    
                let x=0;
                let y=0;
                nodes.forEach(id => {
                    let curNode = node_list1.get(id);
                    x += curNode.x;
                    y += curNode.y;
                })
                x = x/nodes.length;
                y = y/nodes.length;

                let boolean_descriptors = {starting_node:false, accepting_node: false};
                boolean_descriptors.starting_node = false;
                boolean_descriptors.accepting_node = false;
                if(nodes.some( (n) => {return node_list1.get(n).accepting;})){
                    boolean_descriptors.accepting_node = true;
                }

                let subsetState = {id: nodes.join(","), x: x, y: y, radius: 1/4, nodes: unsorted, nexts: [], starting: boolean_descriptors.starting_node, accepting: boolean_descriptors.accepting_node};
                nodeListFull.push(subsetState);
                nodeListFull[i].nexts.push({t: char,val: String(nodes.join(","))});
            }
        }); 
    }
    
    node_list2.clear();

    await new Promise(resolve => {
            setTimeout(() => {
            resolve('resolved');
            }, 250);
        });
    
    // copy unique states into new graph
    for (const ele of nodeListFull) {
        newNodeList.push(ele);
    }

    
    /* This portion will be responsible for the animation portion */
    for (const ele of newNodeList) {
        for(const sub_state of ele.nodes){
            // console.log(sub_state)
            highlighted.set(sub_state,1);
            text.innerHTML = "Finding states connected by epsilon transitions";
            await new Promise(resolve => {
                setTimeout(() => {
                resolve('resolved');
                }, TIME_BETWEEN_NODES);
            });
        }
        let replaced_node = node_list2.get(ele.id);
        if(replaced_node != null){
            ele.accepting = replaced_node.accepting;
            ele.starting = replaced_node.starting;
        }
        // console.log(node_list2.get(ele.id),ele)
        node_list2.set(ele.id,ele);
        text.innerHTML = "State(s) have been combined into 1 new state";
        await new Promise(resolve => {
            setTimeout(() => {
            resolve('resolved');
            }, HOLD_TIME);
        });

        highlighted.clear();
        await new Promise(resolve => {
            setTimeout(() => {
            resolve('resolved');
            }, TIME_BETWEEN_NODES);
        });
    }
    

    text.innerHTML = "Transitions to nowhere imply transitions to a trash state";


}
  
window.addEventListener("resize", resizeCanvas);
  

window.addEventListener('load',setup)
window.addEventListener('keydown',(key) => {

    // console.log(key.code,false)

    // if(key.code=="Escape"){
    //     // console.log("kek1")
    //     if(window.next == false){
    //         // console.log("kek2")
    //         window.esc = true;
    //     }
    // }
})

