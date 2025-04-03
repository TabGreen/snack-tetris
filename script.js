//constants
    //相对尺寸
const h = 20;
const w = 20;

const Scale_blockSize = 0.8;//缩放比例
var block_realSize;//px

const Scale_borderWidth = 0.01;
var borderWidth;//px
const borderColor = '#099';

var realWidth;
var realHeight;

const gridWidth = 1;//px
const gridColor = '#888';
const gridAlpha = 0.3;

    //除去边框的可用区域尺寸
var canBeUsedWidth;
var canBeUsedHeight;

function setConstants(){
    function computeBlockSize(){
        let x1 = w/h;
        let x2 = window.innerWidth/window.innerHeight;
        let block_realSize;
        if(x1 > x2){
            block_realSize = window.innerWidth*Scale_blockSize/w;
            borderWidth = window.innerWidth*Scale_borderWidth;
        }else{
            block_realSize = window.innerHeight*Scale_blockSize/h;
            borderWidth = window.innerHeight*Scale_borderWidth;
        }
        return block_realSize;
    }

    block_realSize = computeBlockSize();//px

    realWidth = w*block_realSize+borderWidth*2;
    realHeight = h*block_realSize+borderWidth*2;

    canBeUsedWidth = realWidth - 2*borderWidth;
    canBeUsedHeight = realHeight - 2*borderWidth;
}

setConstants();//设置有关画布尺寸的常量

const updateTime = 40;
//cvs
const cvsEl = document.getElementById('snack-tetris');
const ctx = cvsEl.getContext('2d');

const bufferEl = document.createElement('canvas');
const buffer = bufferEl.getContext('2d');

function setCVSSize(){
    cvsEl.width = realWidth;
    cvsEl.height = realHeight;
    bufferEl.width = realWidth;
    bufferEl.height = realHeight;
}
function setCVSPos(){
    cvsEl.style.left = (window.innerWidth - realWidth)/2 + 'px';
    cvsEl.style.top = (window.innerHeight - realHeight)/2 + 'px';
}
setCVSSize();
setCVSPos();
window.addEventListener('resize',()=>{
    setConstants();
    setCVSSize();
    drawAll();
    setCVSPos();
});

//drawBG
function drawBG(){
    function drawBorder(){
        buffer.fillStyle = borderColor;
        buffer.fillRect(0,0,realWidth,borderWidth);
        buffer.fillRect(0,0,borderWidth,realHeight);
        buffer.fillRect(0,realHeight-borderWidth,realWidth,borderWidth);
        buffer.fillRect(realWidth-borderWidth,0,borderWidth,realHeight);
    }
    function drawGrid(){
        buffer.fillStyle = gridColor;
        buffer.globalAlpha = gridAlpha;
        for(let i=0;i<w;i++){
            buffer.fillRect(i*block_realSize + borderWidth - gridWidth/2,borderWidth,gridWidth,realHeight);
        }
        for(let i=0;i<h;i++){
            buffer.fillRect(borderWidth,i*block_realSize + borderWidth - gridWidth/2,realWidth,gridWidth);
        }
        buffer.globalAlpha = 1;
    }
    drawGrid();
    drawBorder();
}
//render
function render(){
    ctx.clearRect(0,0,realWidth,realHeight);
    ctx.drawImage(bufferEl,0,0);
}
//draw all
function drawAll(){
    buffer.clearRect(0,0,realWidth,realHeight);
    drawBG();
    render();
}
//main update
function update(){
    drawAll();
}
setInterval(update,updateTime);