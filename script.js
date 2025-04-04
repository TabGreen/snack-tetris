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
//snack
    //constants
const snackLength = 6;
const snack_timeInterval_move = 100;//两次移动的时间间隔
const snack_timeInterval_changeDirection = 1000;//两次改变方向的时间间隔
        //snack_blockColor
        const snack_blockColor1 = '#444';
        const snack_blockColor2 = '#666';
        //dead_blockColor
        const dead_blockColor1 = '#644';
        const dead_blockColor2 = '#866';
    //running
var snack_lastMove = Date.now();
var snack_lastChangeDirection = Date.now();

var snack_direction = 0;

var lastDead;
var dead_animation_duration = 300;
const warnColor = '#FF0000';
    //生成空间
const space = [];
for(let i=0;i<h;i++){
    space[i] = [];
    for(let j=0;j<w;j++){
        space[i][j] = 0;
    }
}
//随机选一个位置作为蛇头
function randomSnackHead(){
    let _h = Math.floor(Math.random()*h);
    let _w = Math.floor(Math.random()*w);
    while(space[_h][_w] !== 0){
        _h = Math.floor(Math.random()*h);
        _w = Math.floor(Math.random()*w);
    }
    space[_h][_w] = 1;
}
randomSnackHead();
    //绘制snack
function drawSnack(){
    function drawBlock(x,y,isDead = false){
        const color = buffer.createRadialGradient
        (x*block_realSize + borderWidth + block_realSize/2,y*block_realSize + borderWidth + block_realSize/2,0,
        x*block_realSize + borderWidth + block_realSize/2,y*block_realSize + borderWidth+block_realSize/2,block_realSize/2);
        if(isDead){
            color.addColorStop(0,dead_blockColor1);
            color.addColorStop(1,dead_blockColor2);
        }else{
            color.addColorStop(0,snack_blockColor1);
            color.addColorStop(1,snack_blockColor2);
        }
        buffer.fillStyle = color;
        buffer.fillRect(x*block_realSize + borderWidth,y*block_realSize + borderWidth,block_realSize,block_realSize);
        if(isDead){
            buffer.strokeStyle = dead_blockColor1;
        }else{
            buffer.strokeStyle = snack_blockColor1;
        }
        buffer.strokeRect(x*block_realSize + borderWidth,y*block_realSize + borderWidth,block_realSize,block_realSize);
    }
    for(let i=0;i<h;i++){
    for(let j=0;j<w;j++){
    if(space[i][j] > 0){
        drawBlock(j,i);}
    if(space[i][j] < 0){
        drawBlock(j,i,true);
    }}}
}
    //move snack
function moveSnack(){
    function getHeadAndTailIndex(){
        //最大的数字是头,最小的数字是尾
        //找到最大的数字,最小的数字 的索引
        let headIndex = [0,0];
        let tailIndex = [0,0];

        let snack_realLength = 0;
        for(let i=0;i<h;i++){
            for(let j=0;j<w;j++){
                if(space[i][j] > 0){
                    snack_realLength++;
                    //必要的修正
                    if(space[headIndex[0]][headIndex[1]] <= 0){headIndex[0]=i;headIndex[1]=j;}
                    if(space[tailIndex[0]][tailIndex[1]] <= 0){tailIndex[0]=i;tailIndex[1]=j;}
                    //更新头尾
                    if(space[i][j] > space[headIndex[0]][headIndex[1]]){
                        headIndex = [i,j];
                    }else if(space[i][j] < space[tailIndex[0]][tailIndex[1]]){
                        tailIndex = [i,j];
        }}}}
        return [headIndex,tailIndex,snack_realLength];
    }
    if(Date.now() - snack_lastMove > snack_timeInterval_move){
        snack_lastMove = Date.now();
        let [headIndex,tailIndex,snack_realLength] = getHeadAndTailIndex();
        let isDead = false;
        //根据方向,在蛇头之前添加方块
        function add(_h,_w,head){
            //边界判定
            if(_h < 0 || _h >= h || _w < 0 || _w >= w
            || space[_h][_w] !== 0){
                //死亡
                lastDead = Date.now();
                isDead = true;
                return;}
            space[_h][_w] = head + 1;
        }
        switch(snack_direction){
            case 0://上
                add(headIndex[0]-1,headIndex[1],space[headIndex[0]][headIndex[1]]);
                break;
            case 1://右
                add(headIndex[0],headIndex[1]+1,space[headIndex[0]][headIndex[1]]);
                break;
            case 2://下
                add(headIndex[0]+1,headIndex[1],space[headIndex[0]][headIndex[1]]);
                break;
            case 3://左
                add(headIndex[0],headIndex[1]-1,space[headIndex[0]][headIndex[1]]);
                break;
        }
        if(isDead){
            dieAndRestart();
            return;
        }
        if(snack_realLength >= snackLength){
            space[tailIndex[0]][tailIndex[1]] = 0;
        }
    }
    function dieAndRestart(){
        //把所有大于0的数字都改为-1
        for(let i=0;i<h;i++){
            for(let j=0;j<w;j++){
                if(space[i][j]> 0){
                    space[i][j] = -1;
        }}}
        //如果-1过多,则清空
        let count = 0;
        for(let i=0;i<h;i++){
            for(let j=0;j<w;j++){
                if(space[i][j]<0){
                    count++;
        }}}
        const max = 0.6;
        if(count > max*h*w){
            for(let i=0;i<h;i++){
                for(let j=0;j<w;j++){
                    space[i][j] = 0;
        }}}
        //重新设置蛇头
        randomSnackHead();
    }
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
// 辅助函数
function getColorRGB(hex1, hex2, ratio) {
    // 将16进制颜色转换为RGB数组
    function hexToRgb(hex) {
const bigint = parseInt(hex.slice(1), 16);
return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];}
    // 将RGB数组转换为16进制颜色
    function rgbToHex(r, g, b) {
return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;}
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    let r = c1[0] * (1 - ratio) + c2[0] * ratio;
    let g = c1[1] * (1 - ratio) + c2[1] * ratio;
    let b = c1[2] * (1 - ratio) + c2[2] * ratio;
    r = Math.floor(r);g = Math.floor(g);b = Math.floor(b);
    return rgbToHex(r, g, b);
}
function drawBorder() {
    const Scale_width = [7, 3, 2]; // 外边框, 狭小的空白, 内边框的宽度比
    const totalScale = Scale_width.reduce((a, b) => a + b, 0);
    const outerBorderWidth = borderWidth * (Scale_width[0] / totalScale);
    const innerBorderWidth = borderWidth * (Scale_width[2] / totalScale);
    const gapWidth = borderWidth * (Scale_width[1] / totalScale);

    // 绘制外边框
    buffer.fillStyle = borderColor;
if(lastDead){
    let past = Date.now() - lastDead;
    if(past< dead_animation_duration/2){
        buffer.fillStyle = getColorRGB(borderColor, warnColor, past*2 / dead_animation_duration);
    }else if(past>= dead_animation_duration/2 && past< dead_animation_duration){
        buffer.fillStyle = getColorRGB(borderColor, warnColor, 1-past / dead_animation_duration);
    }
}
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
    drawSnack();
    moveSnack();
    drawBorder();
    render();
}
//main update
function update(){
    setElement();
    drawAll();
}
setInterval(update,updateTime);