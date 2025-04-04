//颜色统一使用16进制
//constants
    //相对尺寸
const h = 20;
const w = 20;

const Scale_blockSize = 0.8;//缩放比例
var block_realSize;//px

const Scale_borderWidth = 0.01;
var borderWidth;//px
const borderColor = '#9EA6C9';

var realWidth;
var realHeight;

const Scale_gridWidth = 0.06;//相对于一个格子的尺寸
var gridWidth;//px
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
        gridWidth = block_realSize*Scale_gridWidth;
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
function setElement(){
    setConstants();
    setCVSSize();
    setCVSPos();
}
//drawBG
function drawBG(){
    function drawGrid(){
        buffer.fillStyle = gridColor;
        buffer.globalAlpha = gridAlpha;
        for(let i=0;i<w;i++){
            buffer.fillRect(i*block_realSize + borderWidth - gridWidth/2,borderWidth,gridWidth,realHeight - 2*borderWidth);
        }
        for(let i=0;i<h;i++){
            buffer.fillRect(borderWidth,i*block_realSize + borderWidth - gridWidth/2,realWidth - 2*borderWidth,gridWidth);
        }
        buffer.globalAlpha = 1;
    }
    drawGrid();
}
function drawBorder() {
    const Scale_width = [7, 3, 2]; // 外边框, 狭小的空白, 内边框的宽度比
    const totalScale = Scale_width.reduce((a, b) => a + b, 0);
    const outerBorderWidth = borderWidth * (Scale_width[0] / totalScale);
    const innerBorderWidth = borderWidth * (Scale_width[2] / totalScale);
    const gapWidth = borderWidth * (Scale_width[1] / totalScale);

    // 绘制外边框
    buffer.fillStyle = borderColor;
    buffer.fillRect(0, 0, realWidth, outerBorderWidth); // 上
    buffer.fillRect(0, 0, outerBorderWidth, realHeight); // 左
    buffer.fillRect(0, realHeight - outerBorderWidth, realWidth, outerBorderWidth); // 下
    buffer.fillRect(realWidth - outerBorderWidth, 0, outerBorderWidth, realHeight); // 右

    // 绘制内边框
    buffer.fillRect(gapWidth, gapWidth, realWidth - 2 * gapWidth, innerBorderWidth); // 上
    buffer.fillRect(gapWidth, gapWidth, innerBorderWidth, realHeight - 2 * gapWidth); // 左
    buffer.fillRect(outerBorderWidth + gapWidth, realHeight - borderWidth, realWidth - borderWidth - outerBorderWidth - gapWidth +1, innerBorderWidth); // 下
    buffer.fillRect(realWidth - borderWidth, outerBorderWidth + gapWidth, innerBorderWidth, realHeight - borderWidth - outerBorderWidth - gapWidth+1); // 右
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
    drawBorder();
    render();
}
//main update
function update(){
    setElement();
    drawAll();
}
setInterval(update,updateTime);