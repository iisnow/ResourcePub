import GameDatas from "../manager/GameDatas"
import loadMap from "../libs/nameMap"
    
export default class DockPos extends Laya.Box{
    constructor(){
        super();
        this.shipSet = null;
        this.showing = false;
        this.busy = false;
        this.dragging = false;

        this.clickCallBack = (s)=>{};
        this.dragPlaceCallBack = (e)=>{};
    }

    onEnable(){
        loadMap(this,this,["Pad","PadActive","PadING","ShipIcon","PadShadow","BusyFlag","repairBar"]);

        this.stateText = this.BusyFlag.getChildByName("stateText");
        this.repairLeft = this.repairBar.getChildByName("repairLeft");

        var hoverFlag = false;

        this.ShipIcon.on(Laya.Event.MOUSE_DOWN,this,(e)=>{this.startDragShip(e);});
        this.ShipIcon.on(Laya.Event.MOUSE_UP,this,(e)=>{this.endDragedShip(e,"release");});
        this.ShipIcon.on(Laya.Event.MOUSE_OUT,this,(e)=>{
            hoverFlag = false;
            Laya.timer.frameOnce(30,this,()=>{
                if(!hoverFlag)
                this.endDragedShip(e,"hoverOut");
            });
        });
        this.ShipIcon.on(Laya.Event.MOUSE_OVER,this,(e)=>{
            hoverFlag = true;
        });

        this.on(Laya.Event.CLICK,this,()=>{
            if(!this.dragging && this.shipSet != null){
                this.clickCallBack(this.shipSet);
            }
        });

        this.oirPos = {
            x:this.ShipIcon.x,
            y:this.ShipIcon.y
        };

        this.showing = true;
        this.refreshState();

        this.forceBack = false;
        
        this.float.play();
        this.frameLoop(29,this,()=>{
            this.updateRepair();
        });
    }

    refreshState(){
        
        this.Pad.visible = this.shipSet == null && !this.busy;
        this.PadActive.visible = this.shipSet != null && !this.busy;

        this.PadING.visible = this.busy;

        if(this.shipSet != null && this.shipSet.getIconPath()){
            this.ShipIcon.skin = this.shipSet.getIconPath();
            this.PadShadow.skin = this.shipSet.getIconPath();
            this.ShipIcon.visible = true;
        }else
            this.ShipIcon.visible = false;

        this.ShipIcon.gray = this.busy;

        this.PadShadow.visible = this.ShipIcon.visible && (!this.dragging) && (!this.busy);

        this.BusyFlag.visible = this.busy;
        this.repairBar.visible = this.shipSet != null && this.shipSet.crash && this.shipSet.repair;

        this.updateRepair();
    }

    updateRepair(){
        if(this.shipSet == null)return;
        if(!this.shipSet.repair)return;

        var start = this.shipSet.repairStart;
        var now = new Date();

        var timePassBy = Math.floor((now - start)/ 1000);
        var timeNeed = Math.floor(this.shipSet.curData.repair * GameDatas.instance.GetRepairFix());

        if(timePassBy >= timeNeed)
            this.shipSet.repairCompelete();
        
        var timeLeft = timeNeed - timePassBy;
        var leftSec = timeLeft % 60;
        var leftMin = Math.floor(timeLeft / 60);
        if(leftSec < 10)
            this.repairLeft.text = `${leftMin}:0${leftSec}`;
        else
            this.repairLeft.text = `${leftMin}:${leftSec}`;

        this.repairBar.value = timePassBy / timeNeed;
    }

    setClickCallBack(_func){
        this.clickCallBack = _func;
    }

    setdragPlaceCallBack(_func){
        this.dragPlaceCallBack = _func;
    }

    clearShip(){
        this.placeShip(-1);
    }

    setBusy(){
        this.busy = true;
        this.float.stop();
        this.refreshState();
    }

    resumeBusy(){
        this.busy = false;
        this.forceBack = false;

        this.float.play();

        this.refreshState();
    }

    placeShip(_ship){
        this.shipSet = _ship;

        if(_ship != null)
            _ship.dockPos = this;

        if(this.showing){
            this.refreshState();
        }
    }

    setSendBack(){
        this.setWorkState("ForceBack");
        this.forceBack = true;
    }

    setCrashBack(){
        this.setWorkState("CrashBack");
        this.forceBack = true;
    }

    setWorkState(_text){
        if(this.forceBack)return;
        this.stateText.text = _text;
    }

    checkDraggable(){
        return !(this.busy || this.shipSet.repair);
    }

    startDragShip(event){
        if(!this.checkDraggable())return;

        this.float.stop();
        this.dragging = true;

        var befPos = {
            x:this.ShipIcon.x + this.x + this.scene.dock.x - this.scene.dock.hScrollBar.value,
            y:this.ShipIcon.y + this.y + this.scene.dock.y
        };

        this.ShipIcon.pos(befPos.x,befPos.y)
        this.ShipIcon.startDrag();
        
        this.ShipIcon.zOrder = 100;
        this.scene.addChild(this.ShipIcon);

        this.frameOnce(2,this,()=>{
            this.dragPlaceCallBack("drag",event);
        });

        this.refreshState();
        event.stopPropagation();
    }

    endDragedShip(event,release){
        if(!this.dragging)return;
        
        this.frameOnce(2,this,()=>{
            this.dragPlaceCallBack(release,event);
        });
    }

    backPos(){
        this.dragging = false;

        this.ShipIcon.pos(this.oirPos.x,this.oirPos.y);
        this.ShipIcon.stopDrag();
        this.refreshState();

        this.addChild(this.ShipIcon);

        if(!this.busy)
            this.float.play();

        this.ShipIcon.zOrder = 0;
    }
}