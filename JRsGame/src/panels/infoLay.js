import loadMap from "../libs/nameMap"
import GameDatas from "../manager/GameDatas"

export default class InfoLay extends Laya.Panel{
    constructor(){
        super();
        this.ship = null;
    }

    onEnable(){
        loadMap(this,this.content,["shipName","shipDesc","ShipIcon","proImages","buttonBack","buttonPic","buttonLvlup","levelab","job"]);
        
        this.buttonBack.on(Laya.Event.CLICK,this,()=>{
            GameDatas.instance.closeInfo();
        });

        this.buttonLvlup.on(Laya.Event.CLICK,this,(event)=>{
            var _this = this;
            GameDatas.instance.showResAlt("ship",{
                obj:this.ship
            },{x:event.stageX,y:event.stageY},()=>{
                GameDatas.instance.lvlInfoShip();
                _this.refreshShipInfo();
            });
        });

        this.frameLoop(60,this,()=>{
            this.refreshJOB();
        });
        this.refreshJOB();
    }

    setShipSet(_shipSet){
        this.ship = _shipSet;
        this.refreshShipInfo();
        this.refreshJOB();
    }

    refreshShipInfo(){
        this.shipName.text = this.ship.curData.name;
        this.shipDesc.text = this.ship.curData.desc;
        this.ShipIcon.skin = this.ship.getIconPath();

        this.buttonLvlup.visible = this.ship.curData.lvlim > this.ship.getCurrentLevel();

        this.levelab.text = `Lev:${this.ship.getCurrentLevelText()}`;
    }

    refreshJOB(){
        if(this.ship != null)
            this.job.text = this.ship.GetJobText();
    }
}
