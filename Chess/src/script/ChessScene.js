import GameData from "./GameData"
import BoardSet from "./component/BoardSet"
import GridSet from "./component/GridSet"
import RandomTouzi from "./component/randomTouz";
import StandMove from "./component/standMove";

export default class ChessScene extends Laya.Scene {

    constructor() {
        super();
        this.gmd = GameData.GetInstance();
    }

    onEnable() {
        this.initAllPreSet();

        this.initSceneUI();
        this.initAllGrids();
        this.initAllChesses();

        this.initDebug();
    }

    initAllPreSet() {
        this.preSet = this.Borad.getComponent(BoardSet);
    }

    initSceneUI() {

    }

    initAllGrids() {
        this.grids = [];

        var data = this.gmd.boradDatas;
        var count = data.count;
        var preset = this.preSet.gridPre;

        for (var i = 0; i < count; i++) {
            var gridObj = preset.create();
            var grid = {
                com: gridObj,
                ID: i,
                data: data.random ? this.getRandomGrid(i) : data[i]
            }
            this.grids.push(grid);
            this.BoardContent.addChild(gridObj);

            gridObj.getComponent(GridSet).SetGridData(grid.data);
        }

        this.refreshContentScroll();
    }

    initAllChesses() {
        this.chesses = [];
        var preset = this.preSet.chessPre;

        for(var i=0;i<this.gmd.gameConfig.maxPlayer;i++){
            var chessObj = preset.create();
            var moveCom = chessObj.getComponent(StandMove);
            
            var _this = this;
            moveCom.SetStandIndex(i);
            moveCom.SetCalcPos((index,id) => {
                var pos = _this.CalcPos(index)
                var offPos = [50 + 50 * (id%2) , 60 + Math.floor(id/2) * 80];
                return [pos[0] + offPos[0], pos[1] + offPos[1]];
            });
            this.chesses.push({
                id: i,
                com: chessObj,
                posIndex: 0,
                score: 0,
                move: moveCom,
                isAI:i>0
            })

            chessObj.zOrder = 20;

            this.BoardContent.addChild(chessObj);
        }

        this.curChess = 0;
        this.RefreshScore();

        this.getCurPlayer().move.GetCurrent();
    }

    getCurPlayer(){
        return this.chesses[this.curChess];
    }

    getRandomGrid(_index) {

        var moveFlag = Math.floor(Math.random() * 8);
        var scoreGet = 0;
        var desc = '';

        if(_index==0){
            moveFlag = 0;
            desc = '起点';
        }else if(_index == this.gmd.boradDatas.count - 1){
            moveFlag = 0;
            desc = '终点';
        }else{
            if (moveFlag < 6) {
                scoreGet = Math.floor(Math.random() * 6) * 500 - 1000;
                if (scoreGet>=0)
                    scoreGet += 500;
                else
                    scoreGet /= 2;
                moveFlag = 0;
                desc += `Score:${scoreGet}`;
            }else{
                moveFlag -= 5;
                desc += moveFlag == 1 ? '前进' : '后退';
            }
        }

        var randRange = (max) => {
            return Math.floor(Math.random() * max);
        }

        return {
            color: [randRange(255), randRange(255), randRange(255)],
            title: `Index${_index}`,
            moveTag: moveFlag,
            scoreGet: scoreGet,
            func: function (player) {},
            index: _index,
            desc:desc,
            pos: this.CalcPos(_index)
        }
    }

    CalcPos(_index) {
        var width = this.gmd.boradDatas.width;
        var xOff = (width + 1) * 2;
        var yOff = width + 1;

        var y = Math.floor(_index / yOff) * 2 * 202 + 10;
        if ((_index + 1) % yOff == 0) {
            y += 202;
        }

        var x = 0;
        var xdir = _index % xOff;
        if (xdir < width) {
            x = xdir * 152 + 10;
        } else if (xdir == width) {
            x = xdir * 152 + 10 - 152;
        } else if (xdir > width && xdir < xOff - 1) {
            x = (2 * width - xdir) * 152 + 10;
        } else if (xdir == xOff - 1) {
            x = 10;
        }

        return [x, y];
    }

    refreshContentScroll() {
        var width = this.gmd.boradDatas.width;
        var count = this.gmd.boradDatas.count;
        var yOff = width + 1;

        this.BoardContent.width = width * 152 + 30;
        this.BoardContent.height = 630;
    }

    initDebug() {
        this.test.on(Laya.Event.CLICK, this, () => {
            this.test.visible = false;
            this.SightLockOn(this.getCurPlayer());
            this.RollDiceToMoveOn(true);
        });
    }

    RollDiceToMoveOn(dir){
        this.touz.getComponent(RandomTouzi).Action(this, (score) => {
            var curIndex = this.getCurPlayer().posIndex;

            var afIndex = curIndex;

            if(dir){
                afIndex = Math.min(this.gmd.boradDatas.count - 1, score + curIndex);
            }else{
                afIndex = Math.max(0, curIndex - score);
            }

            var _this = this;
            this.getCurPlayer().move.MoveToPos(curIndex, afIndex, (index, pass) => {
                _this.getCurPlayer().posIndex = index;
                if (pass) {
                    _this.TriggerAtGrid(this.getCurPlayer(),index);
                }
                _this.SightLockOn(_this.getCurPlayer());
            });
        });
    }

    TriggerAtGrid(player,_index){
        var grid = this.grids[_index];
        
        var data = grid.data;

        if(data.scoreGet != 0){
            player.score += data.scoreGet;
        }else if(data.moveTag == 1){
            Laya.timer.once(500,this,()=>{
                this.RollDiceToMoveOn(true);
            });
            return;
        }else if(data.moveTag == 2){
            Laya.timer.once(500,this,()=>{
                this.RollDiceToMoveOn(false);
            });
            return;
        }

        this.RefreshScore();
        this.NextPlayer();
        
    }

    RefreshScore(){
        this.Score.text = `${this.getCurPlayer().score}`;
    }

    NextPlayer(){

        this.getCurPlayer().move.LoseCurrent();

        this.curChess++;
        this.curChess%=this.gmd.gameConfig.maxPlayer;

        this.getCurPlayer().move.GetCurrent();

        if(this.getCurPlayer().isAI){
            Laya.timer.once(800,this,()=>{
                this.SightLockOn(this.getCurPlayer());
                this.RollDiceToMoveOn(true);
            });
        }else{
            this.test.visible = true;
        }
    }

    SightLockOn(_player){
        var _index = _player.posIndex;
        var yoff = this.CalcPos(_index)[1];
        var curScroll = this.BoardContent.vScrollBar.value;

        if(yoff < curScroll || yoff > curScroll + this.BoardContent.height - 150)
            this.BoardContent.vScrollBar.value = yoff - 10 - this.BoardContent.height/2 + 100;
    }
}