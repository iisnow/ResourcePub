
import BigNum from "../libs/bignumber"

const State = {
    START:0,
    FORWARD:1,
    PACKIN:2,
    BACK:3,
    PACKOUT:4,
    REPAIR:5,
    INTERRAUPT:6,
    NOING:-1,
    PAUSENULL:-2
};
    
export default class RepeatMove extends Laya.Script{
    /** @prop {name:realStartX,tips:"航路开始的X坐标",type:Int} */
    /** @prop {name:realEndX,tips:"航路结束的X坐标",type:Int} */

    constructor(){
        super();

        this.state = State.START;
        this.eventMap = {};
    }

    onEnable(){
        this.moveSpeed = 50;
        this.packtime = 60;
        this.interProb = 0.15;
        this.lineLength = 500;

        this.safeFix = [100,100];
        this.safeCount = 0;

        this.interBefore = State.START;

        this.moveCount = BigNum(0);

        this.updateDataWithRealLength();
    }

    updateDataWithRealLength(){
        this.realLength = this.realEndX - this.realStartX;

        var per = this.realLength / this.lineLength;
        this.moveSpeed *= per;
    }

    updateSafeLength(){
        this.moveCount = BigNum(0);

        var safeMin = this.safeFix[0];
        var safeGap = this.safeFix[1] - this.safeFix[0];

        this.safeCount = (Math.random() * safeGap + safeMin) * this.realLength / 100;
    }

    configAllData(_config){
        Object.assign(this,_config);
        this.updateDataWithRealLength();
        this.updateSafeLength();
    }

    onUpdate(){
        if(this.state == State.START){
            this.CheckBeforeMove();
        }else if(this.state == State.FORWARD){
            this.moveForward();
            this.updateInterrupt();
        }else if(this.state == State.PACKIN){
            this.changeState(State.NOING);
            Laya.timer.frameOnce(this.packtime,this,()=>{
                this.changeState(State.BACK);
            });
        }else if(this.state == State.BACK){
            this.moveBack();
            this.updateInterrupt();
        }else if(this.state == State.PACKOUT){
            this.changeState(State.NOING);
            Laya.timer.frameOnce(this.packtime,this,()=>{
                this.changeState(State.FORWARD);
            });
        }else if(this.state == State.INTERRAUPT){

        }
    }

    CheckBeforeMove(){
        this.changeState(State.FORWARD);
        this.owner.x = this.realStartX;
    }

    moveForward(){
        var tempSet = this.owner.x;
        this.owner.x += this.moveSpeed;
        this.owner.scaleX = 1;
        if(this.owner.x >= this.realEndX){
            this.moveCount = this.moveCount.plus(BigNum(this.realEndX - tempSet));
            this.owner.x = this.realEndX;
            this.changeState(State.PACKIN);
        }else{
            this.moveCount = this.moveCount.plus(BigNum(this.moveSpeed))
        }
    }

    moveBack(){
        var tempSet = this.owner.x;
        this.owner.x -= this.moveSpeed;
        this.owner.scaleX = -1;
        if(this.owner.x <= this.realStartX){
            this.moveCount = this.moveCount.plus(BigNum(tempSet - this.realStartX));
            this.owner.x = this.realStartX;
            this.changeState(State.PACKOUT);
        }else{
            this.moveCount = this.moveCount.plus(BigNum(this.moveSpeed))
        }
    }

    updateInterrupt(){
        if(this.state != State.PACKOUT && this.state != State.PACKIN){
            if(this.moveCount.gt(this.safeCount)){
                this.interBefore = this.state;
                this.changeState(State.INTERRAUPT);
                this.updateSafeLength();
            }
        }
    }

    reBackInter(){
        this.changeState(this.interBefore);
    }

    changeState(_state){
        var perState = this.state;
        this.state = _state;
        if(this.eventMap[_state]){
            this.eventMap[_state](perState,_state);
        }
    }

    setStateCallBack(state,_func){
        this.eventMap[state] = _func;
    }

    setBlank(){
        this.changeState(State.PAUSENULL);
        this.owner.visible = false;
    }

    startMove(){
        this.changeState(State.START);

        this.owner.visible = true;
        this.owner.x = this.realStartX;
        this.owner.scaleX = 1;
    }
}