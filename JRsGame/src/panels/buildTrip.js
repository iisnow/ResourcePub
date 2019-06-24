import loadMap from "../libs/nameMap"
import ButtonFloat from "../components/buttonFloat"
import GameDatas from "../manager/GameDatas"

export default class BuildTrip extends Laya.Sprite{
    constructor(){
        super();
        this.attachBuild = null;
        this.tripID = 0;
    }

    onEnable(){
        loadMap(this,this,["mainLayUp","buildingNode","comBut","ShipIcon","packBut","dockBut"]);
        loadMap(this,this.mainLayUp,["BuildCov"]);
        loadMap(this,this.buildingNode,["timeLeft"]);

        this.refreshBuildTrip();
        this.showing = true;

        this.resShip = null;

        this.allbutts = [];
        this.initBuildButtons();

        this.BuildCov.on(Laya.Event.CLICK,this,()=>{
            this.allButtonSwitch();
        });

        this.comBut.on(Laya.Event.CLICK,this,()=>{
            this.refreshShow = true;
            this.resShip = GameDatas.instance.gainShip(this.attachBuild);
            this.resultRefresh();   
        });

        this.packBut.on(Laya.Event.CLICK,this,()=>{
            this.sendShipTo(0);
            this.attachBuild = null;
        });

        this.dockBut.on(Laya.Event.CLICK,this,()=>{
            this.sendShipTo(1);
            this.attachBuild = null;
        });

        this.frameLoop(29,this,()=>{
            this.refreshBuildTrip();
        })

        this.reEmpty();
    }

    sendShipTo(id){
        if(this.resShip != null){
            if(id == 1)
                GameDatas.instance.DockAutoIn(this.resShip);
            else
                GameDatas.instance.PackAutoIn(this.resShip);

            this.reEmpty();
        }
    }

    reEmpty(){
        this.refreshShow = false;
        this.resultRefresh();

        this.attachBuild = null;
        this.resShip = null;

        this.triggerED = false;
    }

    setBuilList(_buildList){
        this.attachBuild = _buildList;
        _buildList.buildPad = this;

        if(this.showing)
            this.refreshBuildTrip();
    }

    resultRefresh(){
        this.ShipIcon.visible = this.refreshShow;

        this.packBut.visible = false;
        this.dockBut.visible = false;

        if(this.refreshShow){
            this.ShipIcon.skin = this.resShip.getIconPath();
            this.comBut.visible = false;

            this.packBut.visible = true;
            this.dockBut.visible = !GameDatas.instance.CheckDockFull();
        }
    }

    initBuildButtons(){
        var _this = this;
        var maxBuildLev = GameDatas.instance.buildLevel;
        for(var lev = 1;lev <= maxBuildLev;lev++){
            var button = new ButtonFloat(lev);
            button.setClickCallBack((blev,event)=>{
                GameDatas.instance.showResAlt("build",{
                    handle:"Build"
                },{x:event.stageX,y:event.stageY},()=>{
                    _this.startBuild(blev);
                    _this.allButtonSwitch();
                });
            });
            button.skin = "comp/button.png";
            button.zOrder = 80;
            this.allbutts.push(button);
            this.mainLayUp.addChild(button);
        }
    }

    startBuild(level){
        this.setBuilList(GameDatas.instance.StartBuild(level));
    }

    refreshBuildTrip(){
        this.BuildCov.visible = this.attachBuild == null;
        this.comBut.visible = false;
    
        if(this.attachBuild != null){

            if(!this.refreshShow)
                this.comBut.visible = this.attachBuild.checkOK();

            if(this.attachBuild.checkOK()){
                this.timeLeft.visible = false;
                if(!this.triggerED){
                    this.triggerED = true;
                    GameDatas.instance.TriggerBuildOK();
                }
                return;
            }

            this.timeLeft.visible = true;
            var timeLeft = Math.floor(this.attachBuild.getTimeLeft());
            var leftSec = timeLeft % 60;
            var leftMin = Math.floor(timeLeft / 60);
            if(leftSec < 10)
                this.timeLeft.text = `${leftMin}:0${leftSec}`;
            else
                this.timeLeft.text = `${leftMin}:${leftSec}`;
        }else{
            this.timeLeft.visible = false;
        }
    }

    allButtonSwitch(){
        for(var button of this.allbutts){
            button.switchSet();
        }
    }
}