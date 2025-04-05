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
const gridColor = '#888888';
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
const snack_timeInterval_move = 60;//两次移动的时间间隔

const snack_timeInterval_changeDirection_max = 500;//两次改变方向的时间间隔
var snack_timeInterval_changeDirection;
function setDirChangeInterval(){
    snack_timeInterval_changeDirection = Math.floor(Math.random()*snack_timeInterval_changeDirection_max);
}
setDirChangeInterval();
        //snack_blockColor
        const snack_blockColor1 = '#444444';
        const snack_blockColor2 = '#666666';
        //dead_blockColor
        const dead_blockColor1 = '#774444';
        const dead_blockColor2 = '#886666';
    //running
var snack_lastMove = Date.now();
var snack_lastChangeDirection = Date.now();

var snack_direction = 0;
function randomDirection(){
let d = Math.floor(Math.random()*4);
if(d>=4){d=3;}snack_direction = d;}
randomDirection();

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

            buffer.globalAlpha = 0.8;
        }else{
            color.addColorStop(0,snack_blockColor1);
            color.addColorStop(1,snack_blockColor2);
        }
        buffer.fillStyle = color;
        buffer.fillRect(x*block_realSize + borderWidth,y*block_realSize + borderWidth,block_realSize,block_realSize);
        if(isDead){
            buffer.strokeStyle = dead_blockColor1;

            buffer.globalAlpha = 1;
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
function moveSnack(){
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
        randomDirection();
    }
}
    //change direction
function changeDirection(){
    [headIndex,tailIndex,snack_realLength] = getHeadAndTailIndex();
    let canDir = [];
    function canChange(_h,_w){
        if(_h < 0 || _h >= h || _w < 0 || _w >= w
        || space[_h][_w] !== 0){
            return false;
        }else{
            return true;
        }
    }
    if(canChange(headIndex[0]-1,headIndex[1])){canDir.push(0);}
    if(canChange(headIndex[0],headIndex[1]+1)){canDir.push(1);}
    if(canChange(headIndex[0]+1,headIndex[1])){canDir.push(2);}
    if(canChange(headIndex[0],headIndex[1]-1)){canDir.push(3);}
    
    function set(){
        setDirChangeInterval();
        snack_lastChangeDirection = Date.now();

        let sdi = Math.floor(canDir.length*Math.random());
        if(sdi >= canDir.length){sdi = canDir.length-1;}
        snack_direction = canDir[sdi];
    }

/*
 YY    YY        OOOOO       UU      UU       !!!
  YY  YY       OO     OO     UU      UU       !!!
    YY         OO     OO     UU      UU       !!!
    YY         OO     OO     UU      UU
    YY           OOOOO        UUUUUUUU        !!!

Here are something to tell you:
*/
debugger;
/*
蛇的死亡是这个动画的一部分.
当蛇足够长时(5格以上),它的身体在空间中会堆成一团
当蛇身形成一个封闭空间,并且蛇误入这个由自己身体构成的陷阱内,
蛇就会无法返回,只能前进,最终碰到自己的身体,然后死亡
控制蛇转向的算法很简单,就是在蛇头周围有空格时,随机选择一个空格,
因此,蛇无法对复杂环境做出决策,只能靠随机选择,
然而,这种“错误”正是这个动画的魅力之一
如果想要进行更近一步的决策,很抱歉,我懒得想,也懒得写
因为这个项目只是一个简单的艺术品,而并非深究算法的人工智能
*/

    if(canDir.includes(snack_direction)){
        if(Date.now() - snack_lastChangeDirection > snack_timeInterval_changeDirection){
            set();
        }
    }else if(canDir.length > 0){
        set();
    }
}
//tetris
    //constants
const shapes = [
    [//单个形状
        [[1,1,1,1]]/*单种旋转*/
    ],

    [[[1,1],
    [1,1]]],

    [[[0,1,0],
    [1,1,1]]],

    [[[1,0,0],
    [1,1,1]]],

    [[[0,0,1],
    [1,1,1]]],

    [[[0,1,1],
    [1,1,0]]],

    [[[1,1,0],
    [0,1,1]]]
]
//给每个形状创建旋转后的图像
for(let i=0;i<shapes.length;i++){
    const shape = shapes[i][0];
    //顺时针旋转90
    const shape_rotated1 = [];
    for(let j=0;j<shape[0].length;j++){
        let row = [];
        for(let k=0;k<shape.length;k++){
            row.push(0);
        }
        shape_rotated1.push(row);
    }
    for(let y=0;y<shape.length;y++){
        for(let x=0;x<shape[0].length;x++){
            shape_rotated1[x][shape.length-y-1] = shape[y][x];
        }
    }
    //180
    const shape_rotated2 = [];
    for(let j=0;j<shape.length;j++){
        let row = [];
        for(let k=0;k<shape[0].length;k++){
            row.push(0);
        }
        shape_rotated2.push(row);
    }
    for(let y=0;y<shape.length;y++){
        for(let x=0;x<shape[0].length;x++){
            shape_rotated2[shape.length-y-1][shape[0].length-x-1] = shape[y][x];
        }
    }
    //逆时针旋转90
    const shape_rotated3 = [];
    for(let j=0;j<shape[0].length;j++){
        let row = [];
        for(let k=0;k<shape.length;k++){
            row.push(0);
        }
        shape_rotated3.push(row);
    }
    for(let y=0;y<shape.length;y++){
        for(let x=0;x<shape[0].length;x++){
            shape_rotated3[shape[0].length-x-1][y] = shape[y][x];
        }
    }

    shapes[i].push(shape_rotated1,shape_rotated2,shape_rotated3);
}
const shapeColors = [
    "#00FFFF",
    "#FFFF00",
    "#FF00FF",
    "#9400D3",
    "#FFA500",
    "#00FF00",
    "#FF0000"
]
    //draw
        //由于这个方块的绘制逻辑来源于我的另一个项目,因此保留了旧代码的部分特性,包括 用xy定位而不是hw
        //drawBlock
const borderOfTetrisBlock = 0.2;
const tetris_colorChange = [0.6,0.7,-0.5,-0.6];//tetris方块周围的梯形颜色增减值的数组

function drawTetrisBlock(x, y, colorIndex){


    buffer.fillStyle = shapeColors[colorIndex];

    const rectData = [(x+borderOfTetrisBlock),(y+borderOfTetrisBlock),(1-borderOfTetrisBlock*2),(1-borderOfTetrisBlock*2)]
    buffer.fillRect(
    rectData[0]*block_realSize+borderWidth,
    rectData[1]*block_realSize+borderWidth,
    rectData[2]*block_realSize,
    rectData[3]*block_realSize);
    buffer.strokeStyle = shapeColors[colorIndex];

    const points = [
        [
            [x, y],
            [(x+1), y],
            [(x+1-borderOfTetrisBlock), (y+borderOfTetrisBlock)],
            [(x+borderOfTetrisBlock), (y+borderOfTetrisBlock)]
        ],
        [
            [(x+1), y],
            [(x+1), (y+1)],
            [(x+1-borderOfTetrisBlock), (y+1-borderOfTetrisBlock)],
            [(x+1-borderOfTetrisBlock), (y+borderOfTetrisBlock)]
        ],
        [
            [x, (y+1)],
            [(x+1), (y+1)],
            [(x+1-borderOfTetrisBlock), (y+1-borderOfTetrisBlock)],
            [(x+borderOfTetrisBlock), (y+1-borderOfTetrisBlock)]
        ],
        [
            [x, y],
            [x, (y+1)],
            [(x+borderOfTetrisBlock), (y+1-borderOfTetrisBlock)],
            [(x+borderOfTetrisBlock), (y+borderOfTetrisBlock)]
        ]
    ]
    for(let i=0;i<points.length;i++){
        for(let j=0;j<points[i].length;j++){
            points[i][j][0] = points[i][j][0]*block_realSize+borderWidth;
            points[i][j][1] = points[i][j][1]*block_realSize+borderWidth;
        }
    }
    for(let i=0;i<4;i++){
        buffer.beginPath();
        buffer.moveTo(points[i][0][0],points[i][0][1]);
        buffer.lineTo(points[i][1][0],points[i][1][1]);
        buffer.lineTo(points[i][2][0],points[i][2][1]);
        buffer.lineTo(points[i][3][0],points[i][3][1]);
        buffer.closePath();
        buffer.strokeStyle = adjustColorBrightness(shapeColors[colorIndex],tetris_colorChange[i]);
        buffer.fillStyle = adjustColorBrightness(shapeColors[colorIndex],tetris_colorChange[i]);
        buffer.fill();
        buffer.stroke();
    }
}
        //drawTetrisShape
function drawTetrisShape(shapeIndex, shapeRotation, x, y){
    for(let i=0;i<shapes[shapeIndex][shapeRotation].length;i++){
        for(let j=0;j<shapes[shapeIndex][shapeRotation][i].length;j++){
            if(shapes[shapeIndex][shapeRotation][i][j] === 1){
                drawTetrisBlock(x+j, y+i, shapeIndex);
            }}}
}


        //get TetrisShape on snack
var tetris_lastCreated = Date.now();
const tetris_timeInterval_create = 1000;
const tetris_createHistory = [0,0,0,0,0,0,0];
const tetris_created = [];//[...,[shapeIndex,rotation,x,y,createdTime],...]
function drawTetris(){
    for(let i=0;i<tetris_created.length;i++){
        //等待开发
        drawTetrisShape(tetris_created[i][0], tetris_created[i][1], tetris_created[i][2], tetris_created[i][3]);
    }
}
function createTetris(){
    function findShapesOnSnack(){
        const canCover = [];
        for(let shapeIndex=0;shapeIndex<shapes.length;shapeIndex++){
            for(let rotation=0;rotation<shapes[shapeIndex].length;rotation++){
                const shape = shapes[shapeIndex][rotation];
                for(let posY=0;posY<space.length-shape.length;posY++){
                    for(let posX=0;posX<space[posY].length-shape[0].length;posX++){
                        if(space[posY][posX] <= 0){continue;}
                        let isCover = true;
                        (()=>{
                            for(let shapeY=0;shapeY<shape.length;shapeY++){
                                for(let shapeX=0;shapeX<shape[shapeY].length;shapeX++){
                                    if(shape[shapeY][shapeX] === 1){
                                        if(space[posY+shapeY][posX+shapeX] <= 0){
                                            isCover = false;
                                            return;
                                        }
                                    }
                                }
                            }
                        })();
                        if(isCover){
                            canCover.push([shapeIndex,rotation,posX,posY]);
                        }
                    }
                }
            }
        }
        return canCover;
    }
    //等待开发
    function chooseShape(allCanCover){
        let index = Math.floor(Math.random()*allCanCover.length);
        if(index>=allCanCover.length){index=allCanCover.length-1;}
        return allCanCover[index];
    }
    if(Date.now()-tetris_lastCreated>tetris_timeInterval_create){
        tetris_lastCreated = Date.now();
        const canCover = findShapesOnSnack();
        if(canCover.length>0){
            const used = chooseShape(canCover);
            used.push(Date.now());
            tetris_created.push(used);
            tetris_createHistory[used[0]]++;
        }
    }
}


        //辅助函数
function adjustColorBrightness(hexColor, percent) {//改变颜色亮度,使方块更灵动
    var r = parseInt(hexColor.substring(1, 3), 16);var g = parseInt(hexColor.substring(3, 5), 16);var b = parseInt(hexColor.substring(5, 7), 16);var color = [r,g,b];
    if(percent > 0){for(let i = 0;i<color.length;i++){if(color[i]>=255){continue;}if(color[i]<=0){color[i]=Math.floor(255*percent);continue;
    }color[i] += color[i] * percent;if(color[i]>255){color[i]=255;}}}if(percent<0){percent = Math.abs(percent);for(let i = 0;i<color.length;i++){
    if(color[i]<=0){continue;}if(color[i]>=255){color[i]=Math.floor(255* percent);continue;}color[i] -= color[i] * percent;if(color[i]<=0){color[i]=0;}}}
    color = color.map(function(c) {return Math.floor(c);});
    var newColor =   `#${color[0].toString(16).padStart(2, '0')}${color[1].toString(16).padStart(2, '0')}${color[2].toString(16).padStart(2, '0')}`;
    return newColor;
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
function getColorHex(hex1, hex2, ratio) {
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
        buffer.fillStyle = getColorHex(borderColor, warnColor, past*2 / dead_animation_duration);
    }else if(past>= dead_animation_duration/2 && past< dead_animation_duration){
        buffer.fillStyle = getColorHex(borderColor, warnColor, 1-past / dead_animation_duration);
    }
}
    buffer.fillRect(0, 0, realWidth, outerBorderWidth); // 上
    buffer.fillRect(0, 0, outerBorderWidth, realHeight); // 左
    buffer.fillRect(0, realHeight - outerBorderWidth, realWidth, outerBorderWidth); // 下
    buffer.fillRect(realWidth - outerBorderWidth, 0, outerBorderWidth, realHeight); // 右

    // 绘制内边框
    buffer.fillRect(outerBorderWidth+gapWidth, outerBorderWidth+gapWidth, realWidth - 2 * gapWidth, innerBorderWidth); // 上
    buffer.fillRect(outerBorderWidth+gapWidth, outerBorderWidth+gapWidth, innerBorderWidth, realHeight - 2 * gapWidth); // 左
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
    drawTetris();
    drawBorder();
    render();
}
//main update
function update(){
    setElement();
    moveSnack();
    changeDirection();
    createTetris();
    drawAll();
}
setInterval(update,updateTime);