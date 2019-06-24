import BigNumber from "../libs/bignumber.js"
import GameDatas from "../manager/GameDatas"

import SceneLayer from "../components/SceneLayer"
import TargetSwitch from "../components/targetSwitch"

export default class MainScene extends Laya.Scene{
    constructor(){
        super();
        
        if(GameDatas.instance)
            this.MainManager = GameDatas.instance;
        else
            this.MainManager = new GameDatas();
    }

    onEnable(){
        var _this = this;
        this.MainManager.addResChangeCallBack((res)=>{
            _this.updateResShow(res);
            _this.updateUpgradeDetect(res);
        },"mainScene");

        this.sceneLayer = this.getComponent(SceneLayer);

        this.initRoute();
        this.initDock();
        this.initPros();
        this.initWare();
        this.initBuild();
        this.initPlan();

        this.initResAlt();

        this.uiState = 0;

        this.backBut.on(Laya.Event.CLICK,this,()=>{
            this.warePanel.x = -640;
            this.buildPanel.x = -640;
            this.backBut.x = -600;
            this.planPanel.x = -640;

            this.buildPanel.zOrder = 20
            this.warePanel.zOrder = 20
            this.planPanel.zOrder = 20

            this.uiState = 0;
        });

        this.initButtonFloat();

        this.initSceneEvent();
        this.initTabSwitch();
    }

    backAllPabel(){
        this.buildPanel.zOrder = 20
        this.warePanel.zOrder = 20
        this.planPanel.zOrder = 20
    }

    updateResShow(res){
        for(var key in res){
            if(res.hasOwnProperty(key)){
                this[key].text = res[key].toUnit();
            }
        }
    }

    initRoute(){
        var data = this.MainManager.getCurrentRoute();
        this.router.setRoute(data);

        this.sceneLayer.setRoutePanel(this.router);
    }

    initDock(){
        this.sceneLayer.setDockPanel(this.dock);

        var rect = new Laya.Rectangle(this.router.x,this.router.y,this.router.width,this.router.height);

        var _this = this;
        this.sceneLayer.setDragCallback((posIndex,event)=>{
            if(event.flag == "release"){
                if(rect.contains(event.stageX,event.stageY)){
                    _this.MainManager.upShipToCurrentRoute(posIndex);
                }else{
                    _this.checkPosChange(posIndex,event.stageX,event.stageY);
                    _this.checkHandles(posIndex,event.stageX,event.stageY);
                }
            }

            _this.buttonFloatSwitch(event.flag);
        });
    }

    initPros(){
        this.sceneLayer.setInfoPanel(this.infoLayer.proImages);
    }

    initButtonFloat(){
        this.floatMaps = [
            {
                target:this.Info,
                handle:(pIndex)=>{
                    this.MainManager.showShipInfo(pIndex);
                }
            },
            {
                target:this.Repair,
                handle:(pIndex)=>{
                    this.MainManager.repairShip(pIndex);
                }
            },
            {
                target:this.wareHouse,
                handle:(pIndex)=>{
                    this.MainManager.recollectShip(pIndex);
                }
            }
        ]

        for(var float of this.floatMaps){
            float.comp = float.target.getComponent(TargetSwitch);
            float.comp.setState(1);
        }
    }

    initWare(){
        this.wareBut.on(Laya.Event.CLICK,this,()=>{
            this.warePanel.x = 0;
            this.backBut.x = 40;
            this.backAllPabel();
            this.warePanel.zOrder = 25
            this.uiState = 2;
        });

        this.sceneLayer.setDeskPanel(this.warePanel.content.getChildByName("mainContent"));
    }

    initBuild(){
        this.buildBut.on(Laya.Event.CLICK,this,()=>{
            this.buildPanel.x = 0;
            this.buildDot.visible = false;
            this.backBut.x = 450;

            this.backAllPabel();
            this.buildPanel.zOrder = 25;

            this.uiState = 3;

            this.sceneLayer.buildTripCheck();
        });

        this.buildDot.visible = false;

        this.sceneLayer.setBuildPanel(this.buildPanel.content.getChildByName("MainContent"));
    }

    initPlan(){
        this.planBut.on(Laya.Event.CLICK,this,()=>{
            this.planPanel.x = 0;
            this.backBut.x = 245;

            this.backAllPabel();
            this.planPanel.zOrder = 25;
            this.uiState = 4;
        });
    }

    initResAlt(){
        this.sceneLayer.setAltLayer();
    }

    initSceneEvent(){
        this.MainManager.onSceneEvent("scene:info",(ship)=>{
            this.sceneLayer.refreshInfoShow(ship);
            this.infoLayer.setShipSet(ship);
            this.infoLayer.x = 0;

            this.uiState = 1;
        });

        this.MainManager.onSceneEvent("scene:infoclose",()=>{
            this.infoLayer.x = -640;

            this.uiState = 0;
        });

        this.MainManager.onSceneEvent("ship:lvlup",(ship)=>{
            this.infoLayer.refreshShipInfo();
            this.sceneLayer.refreshInfoShow(ship);
        });

        this.MainManager.onSceneEvent("dock:pack",(pindex)=>{
            this.sceneLayer.recollectPos(pindex);
        });

        this.MainManager.onSceneEvent("pack:collect",(ship)=>{
            this.sceneLayer.insertPackShip(ship);
        });

        this.MainManager.onSceneEvent("route:unlock",(newIndex)=>{
            if(newIndex){
                this.routeTable.labels = this.MainManager.GetAllRouter();
                this.sceneLayer.unlockRoute(newIndex);
                this.sceneLayer.refreshRouterZorder();
            }
            this.sceneLayer.updateRoute(this.MainManager.currentRoute);
        });

        this.MainManager.onSceneEvent("dock:insert",(shipSet)=>{
            this.sceneLayer.insertDockPos(shipSet);
            this.sceneLayer.refreshAllDeskByOutShip(shipSet);
        });

        this.MainManager.onSceneEvent("dock:full",(shipSet)=>{
            this.sceneLayer.AllDesckRefreshFull();
        });

        this.MainManager.onSceneEvent("dock:lvlup",()=>{
            this.sceneLayer.updateAllDockPos();
        });

        this.MainManager.onSceneEvent("build:lvlup",()=>{
            this.sceneLayer.updateAllBuildTrip();
        });

        this.MainManager.onSceneEvent("build:trigger",()=>{
            this.buildOKTrigger();
        });

        this.MainManager.onSceneEvent("res:alt",(pos,res,ok,_func)=>{
            this.sceneLayer.showRes(res,ok,pos.x,pos.y,_func);
        });
    }

    initTabSwitch(){
        this.routeTable.labels = this.MainManager.GetAllRouter();
        this.routeTable.selectedIndex = this.MainManager.currentRoute;

        this.routeTable.selectHandler = new Laya.Handler(this,(index)=>{
            this.MainManager.changeRouteShow(index);
            this.sceneLayer.refreshRouterZorder();
        });
    }

    buttonEachMap(func){
        for(var float of this.floatMaps){
            func.call(this,float);
        }
    }

    buttonFloatSwitch(flag){
        if(flag == "release" || flag == "hoverOut"){
            this.buttonEachMap((float)=>{
                float.comp.setState(1);
            });
        }else{
            this.buttonEachMap((float)=>{
                float.comp.setState(2);
            });
        }
    }
    
    checkPosChange(pindex,x,y){
        var allPoses = this.sceneLayer.poses;
        var offsetPosx = this.dock.hScrollBar.value - this.dock.x;
        var offsetPosy = this.dock.y;
        for(var posi of allPoses){
            var rect = new Laya.Rectangle(posi.x - offsetPosx,offsetPosy + posi.y,posi.width,posi.height);
            if(rect.contains(x,y)){
                var res = this.MainManager.changeShipPos(pindex,posi.posIndex);

                if(res)
                    this.sceneLayer.changePos(pindex,posi.posIndex);

                break;
            }
        }
    }

    checkHandles(pindex,x,y){
        this.buttonEachMap((float)=>{
            var but = float.target;
            var rect = new Laya.Rectangle(but.x,but.y,but.width,but.height);

            if(rect.contains(x,y)){
                float.handle.call(this,pindex);
            }
        })
    }

    buildOKTrigger(){
        if(this.uiState == 3)return;
        this.buildDot.visible = true;
    }

    updateUpgradeDetect(resource){
        
    }
}
