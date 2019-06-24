import GameDatas from "../manager/GameDatas"
import Resource from "../data/resource"
import loadMap from "../libs/nameMap"

export default class ResourceAlt extends Laya.Panel{
    constructor(){
        super()

        this.res = new Resource();
        this.okCallBack = ()=>{};
        this.cancelCallBack = ()=>{};
    }

    onEnable(){
        loadMap(this,this.content,["oil","ammo","steel","Al","OKbut","Cancelbut"]);

        this.showing = true;
        this.refreshResNum();

        this.OKbut.on(Laya.Event.CLICK,this,()=>{
            this.okCallBack(this.res);
        });

        this.Cancelbut.on(Laya.Event.CLICK,this,(event)=>{
            this.cancelCallBack();
        });
    }

    setResourceShow(_res){
        this.res = _res;

        if(this.showing)
            this.refreshResNum();
    }

    setEnough(en_fl){
        this.enoughFlag = en_fl;
        if(this.showing)
        {
            this.refreshOKBut();
        }
    }

    refreshOKBut(){
        this.OKbut.visible = this.enoughFlag;
    }

    refreshResNum(){
        this.oil.text = this.res.oil.toUnit();
        this.ammo.text = this.res.ammo.toUnit();
        this.steel.text = this.res.steel.toUnit();
        this.Al.text = this.res.Al.toUnit();
    }
}
