import loadMap from "../libs/nameMap"
import GameDatas from "../manager/GameDatas"

export default class DeskTrip extends Laya.Image{
    constructor(){
        super();
        this.shipSet = [];
    }

    onEnable(){
        loadMap(this,this,["shipicon1","shipicon2","shipicon3","shadow1","shadow2","shadow3","buttonOut1","buttonOut2","buttonOut3"]);

        this.iconSet = [this.shipicon1,this.shipicon2,this.shipicon3];
        this.shadowSet = [this.shadow1,this.shadow2,this.shadow3];
        this.buttonAll = [this.buttonOut1,this.buttonOut2,this.buttonOut3];

        this.showing = true;

        
        var index = 0;
        for(var but of this.buttonAll){
            but.visible = false;
            but.index = index++;
            but.on(Laya.Event.CLICK,this,(event)=>{
                var bindex = event.target.index;
                GameDatas.instance.SendShipToDock(
                    this.shipSet[bindex]
                );
            });
        }

        this.refreshShow();
    }

    setShip(placeIndex,shipSet){
        if(placeIndex < 0 || placeIndex >= 3)return;
        this.shipSet[placeIndex] = shipSet;
        if(this.showing){
            this.refreshShow();
        }
    }

    refreshShow(){
        var isDockFull = GameDatas.instance.CheckDockFull();
        for(var i=0;i<3;i++){
            var shipSet = this.shipSet[i];

            if(shipSet != null){
                this.iconSet[i].skin = shipSet.curData.iconPath;
                this.shadowSet[i].skin = shipSet.curData.iconPath;
                this.buttonAll[i].visible = (!isDockFull);
            }else{
                this.iconSet[i].skin = "";
                this.shadowSet[i].skin = "";
                this.buttonAll[i].visible = false;
            }
        }
    }
}