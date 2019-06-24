import TargetSwitch from "./targetSwitch"
    
export default class ButtonFloat extends Laya.Button{
    constructor(_lev){
        super();

        this.rankLev = _lev;
        this.clickCallBack = ()=>{};
    }

    onEnable(){
        this.label = `Rank:${this.rankLev}`;
        this.on(Laya.Event.CLICK,this,(event)=>{
            this.clickCallBack(this.rankLev,event);
        });

        this.skin = "images/UI/buttonTripInfo.png";
        this.stateNum = 2;
        this.labelColors = "#ffffff";
        this.labelSize = 16;
        /*this.strokeColors = "#000000";
        this.labelStroke = 1;*/
        this.width = 80;
        this.height = 40;

        var tarSwi = this.addComponent(TargetSwitch);
        tarSwi.pos1X = this.rankLev * 80 - 30;
        tarSwi.pos1Y = -40;
        tarSwi.pos2X = this.rankLev * 80 - 30;
        tarSwi.pos2Y = 40;
        tarSwi.speed = 20;

        tarSwi.onEnable();
        tarSwi.setState(1);

        this.tarSwi = tarSwi;
    }

    setClickCallBack(_func){
        this.clickCallBack = _func;
    }

    switchSet(){
        this.tarSwi.switchTarget();
    }

}